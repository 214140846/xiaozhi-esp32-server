# Repository Guidelines
always response in 中文！
This repository contains the Manager Web (React + Vite + TypeScript) for xiaozhi-esp32-server. Follow these concise rules to keep code consistent and maintainable.
除了 table 和 Form 之外用 shadcn-ui 组件
要能切换黑白主题
react query 用来对接口
axios 包装请求
我让你做的复刻任务你不要复刻那边的样式，样式要自己写
带有小智的文案一律不要拷贝过来
用 pnpm 来 build 和 add 包
用 motion 来优化动效
不要出现小智相关的字眼和图片
用 hookform 来做表单
除了 table 和 Form 之外用 shadcn-ui 组件
要能切换黑白主题
react query 用来对接口
axios 包装请求
我让你做的复刻任务你不要复刻那边的样式，样式要自己写
带有小智的文案一律不要拷贝过来
用 pnpm 来 build 和 add 包
用 motion 来优化动效
不要出现小智相关的字眼和图片
用 hookform 来做表单
zod 做表单校验/

用 TanStack Table + React Query 会更简单、更稳，尤其是分页、排序、多选、列定义与数据缓存这类通用能力不用自己造轮子；也契合本仓库规则里“表格可用第三方库、接口用 react-query、表单用 hookform + zod、样式用 shadcn-ui + Tailwind”的约束。

## Project Structure & Module Organization
- App code: `src/` (components, pages, hooks, api, lib, assets, types).
- API clients: only inside domain folders under `src/api/*` (e.g., `src/api/agent/`). Do not place API files directly in `src/api`.
- Hooks: only inside domain folders under `src/hooks/*` (e.g., `src/hooks/admin/`). Avoid backend-facing hooks at the top level of `src/hooks`.
- Docs: `docs/` and `api-docs/`. Scripts: `scripts/`. Static: `public/`. Build: `dist/`.

## Build, Test, and Development Commands
- `pnpm dev` — start Vite dev server.
- `pnpm build` — type-check and build production bundle.
- `pnpm preview` — preview the production build.
- `pnpm lint` — run ESLint across the project.
- `pnpm generate:openapi` / `pnpm generate:admin` — regenerate typed API clients and hooks.

## Coding Style & Naming Conventions
- TypeScript, React 19, hooks with `use*` names (camelCase files).
- Components and pages in `src/components`/`src/pages` use PascalCase filenames.
- Indentation: 2 spaces; keep imports ordered, avoid default exports for shared utilities.
- Linting: ESLint (`eslint.config.js`). Fix via `pnpm lint --fix`.
- Tailwind CSS v4 is used for styling; prefer utility classes and co-locate small component styles.

## Testing Guidelines
- No formal test framework configured yet. When adding tests, place them next to code or under `src/__tests__` and use Vitest + Testing Library.
- Keep units pure; mock network via Axios adapters.

## Commit & Pull Request Guidelines
- Commits: short imperative subject (max ~72 chars). Group related changes; avoid mixed concerns.
- Prefer Conventional Commits when possible: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`.
- PRs: clear description, linked issue, screenshots for UI changes, and notes on any migrations or env updates.

## Security & Configuration
- Manage secrets via `.env` (see `.env.example`). Do not commit real credentials.
- Network base paths are configured via Vite proxy or Axios baseURL. Keep domain-specific clients within their folders.

