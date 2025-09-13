#!/usr/bin/env node
// Generate axios API clients and React Query hooks from all *_OpenAPI.json files in api-docs.
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { dirname, resolve, basename } from 'path';

const root = resolve(process.cwd());
const specsDir = resolve(root, 'api-docs');

function ensureDir(p) {
  mkdirSync(p, { recursive: true });
}

function toWords(str) {
  return (str || '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function toPascalCase(str) {
  return toWords(str)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function toCamelCase(str) {
  const p = toPascalCase(str);
  return p ? p.charAt(0).toLowerCase() + p.slice(1) : p;
}

function buildNameFromPath(path, operationId, method) {
  const base = toPascalCase(path);
  const op = operationId ? toPascalCase(operationId) : toPascalCase(method);
  const baseOp = base + op;
  return {
    func: toCamelCase(baseOp),
    hookQuery: `use${baseOp}Query`,
    hookMutation: `use${baseOp}Mutation`,
    key: `${base}.${op}`,
  };
}

function buildUrlTemplate(path) {
  const paramNames = [];
  const url = path.replace(/\{([^}]+)\}/g, (_, p1) => {
    paramNames.push(p1);
    return `\${${`params.${p1}`}}`;
  });
  return { url, paramNames };
}

function generateForSpec(specFile) {
  const specPath = resolve(specsDir, specFile);
  const group = basename(specFile).replace(/_OpenAPI\.json$/, '');
  const outApiDir = resolve(root, `src/api/${group}`);
  const outHooksDir = resolve(root, `src/hooks/${group}`);

  const spec = JSON.parse(readFileSync(specPath, 'utf-8'));
  const paths = spec.paths || {};

  ensureDir(outApiDir);
  ensureDir(outHooksDir);

  const apiLines = [];
  const hooksLines = [];

  apiLines.push(`/** Auto-generated from ${specFile}. Do not edit manually. */`);
  apiLines.push(`import { apiClient } from '../../lib/api';`);
  apiLines.push(`import type { ApiResponse } from '../../types/model';`);
  apiLines.push('');

  hooksLines.push(`/** Auto-generated hooks for ${group} APIs. */`);
  hooksLines.push(`import { useQuery, useMutation } from '@tanstack/react-query';`);
  hooksLines.push(`import * as Api from '../../api/${group}/generated';`);
  hooksLines.push('');

  const methodList = ['get', 'post', 'put', 'delete', 'patch'];
  const usedFuncNames = new Set();

  for (const [path, ops] of Object.entries(paths)) {
    for (const method of methodList) {
      const op = ops[method];
      if (!op) continue;

      const { func, hookQuery, hookMutation, key } = buildNameFromPath(path, op.operationId, method);
      let funcName = func;
      let i = 2;
      while (usedFuncNames.has(funcName)) {
        funcName = `${func}${i++}`;
      }
      usedFuncNames.add(funcName);

      const summary = op.summary || '';
      const { url, paramNames } = buildUrlTemplate(path);
      const hasBody = !!op.requestBody;
      const params = Array.isArray(op.parameters) ? op.parameters : [];
      const queryParams = params.filter((p) => p.in === 'query').map((p) => p.name);
      const pathParams = params.filter((p) => p.in === 'path').map((p) => p.name);

      const paramType = pathParams.length
        ? `{ ${pathParams.map((n) => `${n}: string | number`).join('; ')} }`
        : 'Record<string, never>';
      const queryType = queryParams.length
        ? `{ ${queryParams.map((n) => `${n}?: any`).join('; ')} }`
        : 'Record<string, any> | undefined';

      // API function generation
      apiLines.push(`/** ${summary} */`);
      apiLines.push(
        `export async function ${funcName}(params${
          paramType === 'Record<string, never>' ? '?: ' + paramType : ': ' + paramType
        }${hasBody ? ', data?: any' : ''}, query?: ${queryType}, config?: any): Promise<ApiResponse<any>> {`
      );
      apiLines.push(`  const url = \`` + url + `\`;`);
      if (method === 'get') {
        apiLines.push(`  const res = await apiClient.get<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);`);
      } else if (method === 'delete') {
        if (hasBody) {
          apiLines.push(`  const res = await apiClient.delete<ApiResponse<any>>(url, { ...(config || {}), data, params: { ...(config?.params || {}), ...(query || {}) } } as any);`);
        } else {
          apiLines.push(`  const res = await apiClient.delete<ApiResponse<any>>(url, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);`);
        }
      } else {
        apiLines.push(
          `  const res = await apiClient.${method}<ApiResponse<any>>(url, ${hasBody ? 'data' : 'undefined'}, { ...(config || {}), params: { ...(config?.params || {}), ...(query || {}) } } as any);`
        );
      }
      apiLines.push(`  return res.data;`);
      apiLines.push(`}`);
      apiLines.push('');

      // Hook generation
      if (method === 'get') {
        hooksLines.push(`/** ${summary} */`);
        hooksLines.push(
          `export function ${hookQuery}(params${
            paramType === 'Record<string, never>' ? '?: ' + paramType : ': ' + paramType
          }, query?: ${queryType}, options?: any) {`
        );
        hooksLines.push(
          `  return useQuery({ queryKey: ['${key}', params, query], queryFn: () => Api.${funcName}(params as any, query), ...(options || {}) });`
        );
        hooksLines.push(`}`);
        hooksLines.push('');
      } else {
        hooksLines.push(`/** ${summary} */`);
        hooksLines.push(`export function ${hookMutation}(options?: any) {`);
        hooksLines.push(
          `  return useMutation({ mutationFn: (args: { params${
            paramType === 'Record<string, never>' ? '?: ' + paramType : ': ' + paramType
          }${hasBody ? ', data?: any' : ''}, query?: ${queryType}, config?: any }) => Api.${funcName}(args.params as any${
            hasBody ? ', args.data' : ''
          }, args.query, args.config), ...(options || {}) });`
        );
        hooksLines.push(`}`);
        hooksLines.push('');
      }
    }
  }

  const apiOutPath = resolve(outApiDir, 'generated.ts');
  const hooksOutPath = resolve(outHooksDir, 'generatedHooks.ts');
  ensureDir(dirname(apiOutPath));
  ensureDir(dirname(hooksOutPath));

  writeFileSync(apiOutPath, apiLines.join('\n') + '\n');
  writeFileSync(hooksOutPath, hooksLines.join('\n') + '\n');

  console.log(`Generated API: ${apiOutPath}`);
  console.log(`Generated Hooks: ${hooksOutPath}`);
}

function main() {
  const files = readdirSync(specsDir).filter((f) => /_OpenAPI\.json$/.test(f));
  files.forEach((f) => generateForSpec(f));
}

main();
