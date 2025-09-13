// Simple OpenAPI -> Axios + React Query generator for agent APIs
// Reads api-docs/agent_OpenAPI.json and outputs:
// - src/api/agentApi.ts (axios functions)
// - src/hooks/agentHooks.ts (React Query hooks)
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const OPENAPI_PATH = path.join(ROOT, 'api-docs', 'agent_OpenAPI.json');
const OUT_API = path.join(ROOT, 'src', 'api', 'agentApi.ts');
const OUT_HOOKS = path.join(ROOT, 'src', 'hooks', 'agentHooks.ts');

/** Utilities **/
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));

const toTsIdentifier = (name) => name.replace(/[^a-zA-Z0-9_]/g, '_');
const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const isReserved = new Set(['delete']);

const refName = (ref) => ref.split('/').pop();

function tsTypeFromSchema(schema, schemas, inline = false) {
  if (!schema) return 'any';
  if (schema.$ref) return refName(schema.$ref);

  const { type } = schema;
  if (!type) return 'any';

  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'array') {
    const itemType = tsTypeFromSchema(schema.items || {}, schemas, true);
    return `${itemType}[]`;
  }
  if (type === 'object') {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const entries = Object.entries(props);
    if (entries.length === 0) return 'Record<string, any>';
    const body = entries
      .map(([k, v]) => `${k}${required.has(k) ? '' : '?'}: ${tsTypeFromSchema(v, schemas, true)};`)
      .join(' ');
    return inline ? `{ ${body} }` : `{
  ${entries
    .map(([k, v]) => `${k}${required.has(k) ? '' : '?'}: ${tsTypeFromSchema(v, schemas, true)};`)
    .join('\n  ')}
}`;
  }
  return 'any';
}

function generateTypes(schemas) {
  const lines = [];
  lines.push('// Generated from OpenAPI components.schemas');
  Object.entries(schemas).forEach(([name, schema]) => {
    const id = toTsIdentifier(name);
    if (schema.type === 'object' || schema.properties) {
      const body = tsTypeFromSchema({ ...schema, type: 'object' }, schemas);
      lines.push(`export interface ${id} ${body}`);
    } else if (schema.type === 'array') {
      const itemType = tsTypeFromSchema(schema.items || {}, schemas, true);
      lines.push(`export type ${id} = ${itemType}[];`);
    } else {
      lines.push(`export type ${id} = any;`);
    }
  });
  return lines.join('\n\n');
}

function pathTemplateToTs(pathStr) {
  return pathStr.replace(/\{(.*?)\}/g, '${path.$1}');
}

function buildFunctionName(opId, method) {
  if (!opId || typeof opId !== 'string') {
    return `${method}`;
  }
  return opId;
}

function getOkResponseSchema(op) {
  const res = op.responses?.['200'] || op.responses?.['201'] || op.responses?.['default'];
  if (!res) return null;
  const content = res.content || {};
  const media = Object.keys(content)[0];
  if (!media) return null;
  return content[media]?.schema || null;
}

function collectParams(op, where) {
  return (op.parameters || []).filter((p) => p.in === where);
}

function genApiAndHooks(openapi) {
  const schemas = openapi.components?.schemas || {};
  const serverUrl = openapi.servers?.[0]?.url || '';

  const typesBlock = generateTypes(schemas);

  const apiFns = [];
  const hookFns = [];

  for (const [rawPath, methods] of Object.entries(openapi.paths || {})) {
    for (const method of Object.keys(methods)) {
      const op = methods[method];
      const opIdRaw = buildFunctionName(op.operationId, method);
      const opId = toTsIdentifier(opIdRaw);
      const isGet = method.toLowerCase() === 'get';

      const pathParams = collectParams(op, 'path');
      const queryParams = collectParams(op, 'query');
      const hasQuery = queryParams.length > 0;
      const hasPath = pathParams.length > 0;

      const reqBodySchema = op.requestBody?.content?.['application/json']?.schema;
      const reqBodyType = reqBodySchema ? tsTypeFromSchema(reqBodySchema, schemas, true) : 'undefined';
      const resSchema = getOkResponseSchema(op);
      const resType = resSchema ? tsTypeFromSchema(resSchema, schemas, true) : 'any';

      const urlTemplate = pathTemplateToTs(rawPath);

      // Build function signature pieces
      const pathArgType = hasPath
        ? `{ ${pathParams.map((p) => `${p.name}: string`).join('; ')} }`
        : 'undefined';
      const queryArgType = hasQuery ? `{ ${queryParams.map((p) => `${p.name}?: any`).join('; ')} }` : 'undefined';

      const fnArgs = [];
      if (hasPath) fnArgs.push(`path: ${pathArgType}`);
      if (hasQuery) fnArgs.push(`query?: ${queryArgType}`);
      if (reqBodySchema) fnArgs.push(`body: ${reqBodyType}`);

      // Axios call expression
      let axiosCall;
      const urlExpr = '`' + urlTemplate + '`';
      if (isGet || method.toLowerCase() === 'delete') {
        const cfg = hasQuery ? ', { params: query }' : '';
        axiosCall = `apiClient.${method}<${resType}>(${urlExpr}${cfg})`;
      } else {
        const cfg = hasQuery ? ', { params: query }' : '';
        const bodyArg = reqBodySchema ? 'body' : 'undefined';
        axiosCall = `apiClient.${method}<${resType}>(${urlExpr}, ${bodyArg}${cfg})`;
      }

      // Avoid reserved identifiers
      const exportName = isReserved.has(opId) ? `_${opId}` : opId;

      apiFns.push(`
/** ${op.summary || ''} */
export const ${exportName} = async (${fnArgs.join(', ')}): Promise<${resType}> => {
  const response = await ${axiosCall};
  return response.data as ${resType};
};
`);

      // Hooks generation
      const isWrapped = !!(resSchema && resSchema.$ref && refName(resSchema.$ref).startsWith('Result'));

      if (isGet) {
        const hookName = `use${upperFirst(exportName)}`;
        const queryKeyExprParts = [`'${exportName}'`];
        if (hasPath) queryKeyExprParts.push('path');
        if (hasQuery) queryKeyExprParts.push('query');
        const queryKeyExpr = `[${queryKeyExprParts.join(', ')}]`;
        const hookArgs = [];
        if (hasPath) hookArgs.push(`path: ${pathArgType}`);
        if (hasQuery) hookArgs.push(`query?: ${queryArgType}`);
        hookArgs.push('options?: any');

        hookFns.push(`
/** ${op.summary || ''} */
export const ${hookName} = (${hookArgs.join(', ')}) => {
  return useQuery({
    queryKey: ${queryKeyExpr},
    queryFn: async () => {
      const res = await ${exportName}(${hasPath ? 'path' : ''}${hasPath && (hasQuery || reqBodySchema) ? ', ' : ''}${hasQuery ? 'query' : ''});
      ${isWrapped ? `if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;` : `return res as any;`}
    },
    ...(options || {}),
  });
};
`);
      } else {
        const hookName = `use${upperFirst(exportName)}`;
        // variables param shape for mutation
        // Keep variables as any to avoid import gymnastics for DTO types

        hookFns.push(`
/** ${op.summary || ''} */
export const ${hookName} = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      ${hasPath ? `args.push(variables?.path);` : ''}
      ${hasQuery ? `args.push(variables?.query);` : ''}
      ${reqBodySchema ? `args.push(variables?.body);` : ''}
      const res = await ${exportName}(${[hasPath, hasQuery, reqBodySchema]
        .map((flag, idx) => (flag ? `args[${[hasPath, hasQuery, reqBodySchema].slice(0, idx).filter(Boolean).length}]` : null))
        .filter(Boolean)
        .join(', ')});
      ${isWrapped ? `if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;` : `return res as any;`}
    },
  });
};
`);
      }
    }
  }

  const apiFnNames = apiFns
    .map((s) => s.match(/export const (\w+)/)?.[1])
    .filter(Boolean);

  const apiFile = `/**
 * This file is generated by scripts/generate-agent-api.mjs
 * Source: api-docs/agent_OpenAPI.json
 * Do not edit manually.
 */
/* eslint-disable */
import { apiClient } from '../lib/api';

${typesBlock}

${apiFns.join('\n')}

export const agentAPI = {
${apiFnNames.map((n) => `  ${n},`).join('\n')}
};
`;

  const hooksFile = `/**
  * React Query hooks generated from OpenAPI
  * Depends on functions in src/api/agentApi.ts
  */
/* eslint-disable */
import { useQuery, useMutation } from '@tanstack/react-query';
import {
${apiFnNames.map((n) => `  ${n},`).join('\n')}
} from '../api/agentApi';

${hookFns.join('\n')}
`;

  fs.mkdirSync(path.dirname(OUT_API), { recursive: true });
  fs.writeFileSync(OUT_API, apiFile, 'utf-8');
  fs.mkdirSync(path.dirname(OUT_HOOKS), { recursive: true });
  fs.writeFileSync(OUT_HOOKS, hooksFile, 'utf-8');

  console.log('Generated:', OUT_API);
  console.log('Generated:', OUT_HOOKS);
}

function main() {
  const openapi = readJson(OPENAPI_PATH);
  genApiAndHooks(openapi);
}

main();
