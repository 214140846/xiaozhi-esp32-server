#!/usr/bin/env node
// Simple OpenAPI -> axios + React Query generator for admin APIs
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

const root = resolve(process.cwd());
const specPath = resolve(root, 'api-docs/admin_OpenAPI.json');
const outApiDir = resolve(root, 'src/api/admin');
const outHooksDir = resolve(root, 'src/hooks/admin');

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
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
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
    key: `${base}.${op}`
  };
}

function buildUrlTemplate(path) {
  // Replace {param} with ${params.param}
  const paramNames = [];
  const url = path.replace(/\{([^}]+)\}/g, (_, p1) => {
    paramNames.push(p1);
    return `\${${`params.${p1}`}}`;
  });
  return { url, paramNames };
}

function readSpec() {
  const json = JSON.parse(readFileSync(specPath, 'utf-8'));
  return json;
}

function generate() {
  const spec = readSpec();
  const paths = spec.paths || {};

  ensureDir(outApiDir);
  ensureDir(outHooksDir);

  const apiLines = [];
  const hooksLines = [];

  apiLines.push(`/** Auto-generated from admin_OpenAPI.json. Do not edit manually. */`);
  apiLines.push(`import { apiClient } from '../../lib/api';`);
  apiLines.push(`import type { ApiResponse } from '../../types/auth';`);
  apiLines.push('');

  hooksLines.push(`/** Auto-generated hooks for admin APIs. */`);
  hooksLines.push(`import { useQuery, useMutation } from '@tanstack/react-query';`);
  hooksLines.push(`import * as AdminApi from '../../api/admin/generated';`);
  hooksLines.push('');

  const methodList = ['get', 'post', 'put', 'delete', 'patch'];

  const usedFuncNames = new Set();

  for (const [path, ops] of Object.entries(paths)) {
    for (const method of methodList) {
      const op = ops[method];
      if (!op) continue;

      const { func, hookQuery, hookMutation, key } = buildNameFromPath(path, op.operationId, method);
      let funcName = func;
      // Ensure unique function names
      let i = 2;
      while (usedFuncNames.has(funcName)) {
        funcName = `${func}${i++}`;
      }
      usedFuncNames.add(funcName);

      const summary = op.summary || '';
      const { url, paramNames } = buildUrlTemplate(path);

      const hasBody = !!op.requestBody;
      // parameters array: collect query params names
      const params = Array.isArray(op.parameters) ? op.parameters : [];
      const queryParams = params.filter(p => p.in === 'query').map(p => p.name);
      const pathParams = params.filter(p => p.in === 'path').map(p => p.name);

      const paramType = pathParams.length ? `{ ${pathParams.map(n => `${n}: string | number`).join('; ')} }` : 'Record<string, never>';
      const queryType = queryParams.length ? `{ ${queryParams.map(n => `${n}?: any`).join('; ')} }` : 'Record<string, any> | undefined';

      // API function
      apiLines.push(`/** ${summary} */`);
      apiLines.push(`export async function ${funcName}(params${paramType === 'Record<string, never>' ? '?: ' + paramType : ': ' + paramType}${hasBody ? ', data?: any' : ''}, query?: ${queryType}): Promise<ApiResponse<any>> {`);
      apiLines.push(`  const url = \`` + url + `\`;`);
      if (method === 'get' || method === 'delete') {
        if (hasBody && method === 'delete') {
          apiLines.push(`  const res = await apiClient.${method}<ApiResponse<any>>(url, { data }, { params: query });`);
        } else {
          apiLines.push(`  const res = await apiClient.${method}<ApiResponse<any>>(url, { params: query } as any);`);
        }
      } else {
        apiLines.push(`  const res = await apiClient.${method}<ApiResponse<any>>(url, ${hasBody ? 'data' : 'undefined'}, { params: query });`);
      }
      apiLines.push(`  return res.data;`);
      apiLines.push(`}`);
      apiLines.push('');

      // Hook
      if (method === 'get') {
        hooksLines.push(`/** ${summary} */`);
        hooksLines.push(`export function ${hookQuery}(params${paramType === 'Record<string, never>' ? '?: ' + paramType : ': ' + paramType}, query?: ${queryType}, options?: any) {`);
        hooksLines.push(`  return useQuery({ queryKey: ['${key}', params, query], queryFn: () => AdminApi.${funcName}(params as any, undefined, query), ...(options || {}) });`);
        hooksLines.push(`}`);
        hooksLines.push('');
      } else {
        hooksLines.push(`/** ${summary} */`);
        hooksLines.push(`export function ${hookMutation}(options?: any) {`);
        hooksLines.push(`  return useMutation({ mutationFn: (args: { params${paramType === 'Record<string, never>' ? '?: ' + paramType : ': ' + paramType}${hasBody ? ', data?: any' : ''}, query?: ${queryType} }) => AdminApi.${funcName}(args.params as any${hasBody ? ', args.data' : ''}, args.query), ...(options || {}) });`);
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

generate();

