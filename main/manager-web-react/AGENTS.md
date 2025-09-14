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
页面要兼容移动端和黑白主题下的展示，做到专业的展示

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


# 代码风格
For each rule, always demonstrate both a **❌ Wrong Example** and a **✅ Correct Example**.

---

# **📦 Componentization**

## **1. One file = one component**

❌ Wrong Example: Multiple components in the same file

```
// Bad.tsx
export function Header() { return <h1>Title</h1>; }
export function Footer() { return <footer>© 2025</footer>; }
```

✅ Correct Example: Each component in its own file

```
// Header.tsx
export function Header() { return <h1>Title</h1>; }

// Footer.tsx
export function Footer() { return <footer>© 2025</footer>; }
```

---

## **2. Avoid declaring new components inside components**

❌ Wrong Example: Inline sub-component declaration

```
export function Bad2() {
  const Inline = () => <span>Hi</span>; // defined inside
  return <Inline />;
}
```

✅ Correct Example: Define separately

```
function Inline() {
  return <span>Hi</span>;
}
export function Good2() {
  return <Inline />;
}
```

---

## **3. Always use function components, avoid class components**

❌ Wrong Example: Class component

```
import React from "react";

export class Bad3 extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}
```

✅ Correct Example: Function component

```
export function Good3() {
  return <div>Hello</div>;
}
```

---

## **4. Do NOT return JSX directly from useCallback**

❌ Wrong Example: Using useCallback to render UI

```
import { useCallback } from "react";

export function Bad4() {
  const render = useCallback(() => <div>Hi</div>, []);
  return render(); // ❌ not recommended
}
```

✅ Correct Example: Return JSX normally

```
export function Good4() {
  return <div>Hi</div>;
}
```

---

## **5. Keep components simple — avoid heavy data transformation inside render**

❌ Wrong Example: Large data manipulation inside render

```
export function Bad5({ data }: { data: string[] }) {
  const list = data.map(x => x.toUpperCase()).filter(x => x.length > 2);
  return <ul>{list.map(x => <li key={x}>{x}</li>)}</ul>;
}
```

✅ Correct Example: Extract transformation outside (hook or util)

```
function useProcessedData(data: string[]) {
  return data.filter(x => x.length > 2).map(x => x.toUpperCase());
}

export function Good5({ data }: { data: string[] }) {
  const list = useProcessedData(data);
  return <ul>{list.map(x => <li key={x}>{x}</li>)}</ul>;
}
```

---

## **6. Props must use interface, colocated with component**

❌ Wrong Example: Inline type alias far away

```
type Props = { title: string };

export function Bad6(props: Props) {
  return <h1>{props.title}</h1>;
}
```

✅ Correct Example: export interface ${ComponentName}Props in same file

```
export interface Good6Props {
  title: string;
}

export function Good6({ title }: Good6Props) {
  return <h1>{title}</h1>;
}
```

---

## **7. Wrap callbacks passed to children with useCallback**

❌ Wrong Example: Passing unstable inline callback

```
export function Bad7() {
  return <button onClick={() => console.log("clicked")}>Click</button>;
}
```

✅ Correct Example: Stable reference via useCallback

```
import { useCallback } from "react";

export function Good7() {
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []);
  return <button onClick={handleClick}>Click</button>;
}
```

---

## **8. Props names should be specific, avoid generic or confusing names**

❌ Wrong Example: Ambiguous prop name data

```
export interface Bad8Props {
  data: string; // ❌ too generic
}

export function Bad8({ data }: Bad8Props) {
  return <div>{data}</div>;
}
```

✅ Correct Example: Use descriptive names

```
export interface Good8Props {
  username: string;
}

export function Good8({ username }: Good8Props) {
  return <div>{username}</div>;
}
```

---

# **📝 Form**

## **1. Separate form view (JSX) and form state (react-hook-form)**

❌ Wrong Example: Using useState for form fields

```
import { useState } from "react";

export function BadForm() {
  const [email, setEmail] = useState("");
  return <input value={email} onChange={e => setEmail(e.target.value)} />;
}
```

✅ Correct Example: Use react-hook-form

```
import { useForm } from "react-hook-form";

export function GoodForm() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  return (
    <form onSubmit={handleSubmit(d => console.log(d))}>
      <input {...register("email")} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## **2. Validation feedback must appear in UI near the field**

❌ Wrong Example: Validation but no visible error

```
import { useForm } from "react-hook-form";

export function BadValidation() {
  const { register, handleSubmit } = useForm<{ email: string }>({ mode: "onChange" });
  return (
    <form onSubmit={handleSubmit(d => console.log(d))}>
      <input {...register("email", { required: true })} />
    </form>
  );
}
```

✅ Correct Example: Show error next to field

```
import { useForm } from "react-hook-form";

export function GoodValidation() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({ mode: "onChange" });
  return (
    <form onSubmit={handleSubmit(d => console.log(d))}>
      <input {...register("email", { required: "Email is required" })} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

---

## **3. Avoid context for form state management (perf issue)**

❌ Wrong Example: Global context storing form state

```
import { createContext, useContext, useState } from "react";

const FormCtx = createContext<any>(null);

export function BadFormCtx() {
  const [email, setEmail] = useState("");
  return (
    <FormCtx.Provider value={{ email, setEmail }}>
      <Child />
    </FormCtx.Provider>
  );
}
```

✅ Correct Example: Localized form state via react-hook-form

```
import { useForm } from "react-hook-form";

export function GoodFormCtx() {
  const { register } = useForm<{ email: string }>();
  return <input {...register("email")} />;
}
```

---

## **4. Don’t over-abstract form views — keep whole form visible in one place**

❌ Wrong Example: Form fields overly hidden in separate subcomponents

```
function EmailField() { return <input name="email" />; }
function PasswordField() { return <input name="password" />; }

export function BadFormView() {
  return (
    <form>
      <EmailField />
      <PasswordField />
    </form>
  );
}
```

✅ Correct Example: Show full form structure clearly

```
export function GoodFormView() {
  return (
    <form>
      <input name="email" />
      <input name="password" type="password" />
    </form>
  );
}
```

---

---

# 🪝 Hooks

## **1. Avoid useState,useEffect,useCallback unless truly necessary**

❌ Wrong Example: Derived values unnecessarily stored in state

```
import { useState, useEffect } from "react";

export function Bad1({ price, qty }: { price: number; qty: number }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(price * qty); // Unnecessary: pure expression
  }, [price, qty]);
  return <div>Total: {total}</div>;
}
```

✅ Correct Example: Use an expression (or useMemo if expensive)

```
export function Good1({ price, qty }: { price: number; qty: number }) {
  const total = price * qty;
  return <div>Total: {total}</div>;
}
```

---

## **2. Only put**

## **source state in useState . Derived values should be expressions**

❌ Wrong Example: Duplicating derived state

```
import { useState, useEffect } from "react";

export function Bad2() {
  const [count, setCount] = useState(1);
  const [double, setDouble] = useState(2);
  useEffect(() => {
    setDouble(count * 2);
  }, [count]);
  return <button onClick={() => setCount(c => c + 1)}>{count} -> {double}</button>;
}
```

✅ Correct Example: Derived value directly from source

```
import { useState } from "react";

export function Good2() {
  const [count, setCount] = useState(1);
  const double = count * 2;
  return <button onClick={() => setCount(c => c + 1)}>{count} -> {double}</button>;
}
```

---

## **3. Don’t misuse useEffect as a “state listener”**

❌ Wrong Example: Updating state inside effect just to mirror props

```
import { useEffect, useState } from "react";

export function Bad3({ items }: { items: string[] }) {
  const [len, setLen] = useState(0);
  useEffect(() => {
    setLen(items.filter(Boolean).length);
  }, [items]);
  return <div>Count: {len}</div>;
}
```

✅ Correct Example: Derive count directly

```
export function Good3({ items }: { items: string[] }) {
  const count = items.filter(Boolean).length;
  return <div>Count: {count}</div>;
}
```

---

## **4. Always clean up timers and event listeners in useEffect**

❌ Wrong Example: Missing cleanup → memory leaks

```
import { useEffect, useState } from "react";

export function Bad4() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    // No cleanup!
  }, []);
  return <div>{tick}</div>;
}
```

✅ Correct Example: Proper cleanup

```
import { useEffect, useState } from "react";

export function Good4() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <div>{tick}</div>;
}
```

---

## **5. Abstract business logic into custom hooks**

❌ Wrong Example: Business + effects mixed inside component

```
import { useEffect, useState } from "react";

export function Bad5() {
  const [todos, setTodos] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/todos").then(r => r.json()).then(setTodos);
  }, []);
  const add = async (t: string) => {
    await fetch("/api/todos", { method: "POST", body: t });
    setTodos(s => [...s, t]);
  };
  return <>{todos.map(t => <div key={t}>{t}</div>)}</>;
}
```

✅ Correct Example: Use useTodos hook

```
import { useEffect, useState, useCallback } from "react";

function useTodos() {
  const [todos, setTodos] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      const data = await fetch("/api/todos").then(r => r.json());
      setTodos(data);
    })();
  }, []);
  const add = useCallback(async (t: string) => {
    await fetch("/api/todos", { method: "POST", body: t });
    setTodos(s => [...s, t]);
  }, []);
  return { todos, add };
}

export function Good5() {
  const { todos, add } = useTodos();
  return <>{todos.map(t => <div key={t}>{t}</div>)}</>;
}
```

---

## **6. Actions returned by custom hooks should use useCallback**

❌ Wrong Example: Returns new function reference each render

```
import { useState } from "react";

function useCounterBad() {
  const [n, setN] = useState(0);
  return { n, inc: () => setN(x => x + 1) };
}
```

✅ Correct Example: Wrap in useCallback for referential stability

```
import { useState, useCallback } from "react";

function useCounterGood() {
  const [n, setN] = useState(0);
  const inc = useCallback(() => setN(x => x + 1), []);
  return { n, inc };
}
```

---

## **7. Custom hooks should have single responsibility**

❌ Wrong Example: One hook handling multiple domains

```
import { useState } from "react";

function useAuthAndThemeBad() {
  const [user, setUser] = useState<{name:string}|null>(null);
  const [theme, setTheme] = useState<"light"|"dark">("light");
  return { user, theme };
}
```

✅ Correct Example: Split into useAuth and useTheme

```
import { useState, useCallback } from "react";

function useAuth() {
  const [user, setUser] = useState<{name:string}|null>(null);
  const login = useCallback((name:string) => setUser({ name }), []);
  return { user, login };
}

function useTheme() {
  const [theme, setTheme] = useState<"light"|"dark">("light");
  const toggle = useCallback(() => setTheme(t => t === "light" ? "dark" : "light"), []);
  return { theme, toggle };
}
```

---

## **8. Dependencies in useEffect / useCallback ideally ≤3**

❌ Wrong Example: Too many dependencies = overloaded responsibility

```
import { useEffect } from "react";

export function Bad8({ a,b,c,d,e }: any) {
  useEffect(() => {
    // Mixed responsibilities
  }, [a,b,c,d,e]);
}
```

✅ Correct Example: Split logic into smaller effects

```
import { useEffect } from "react";

export function Good8({ a,b,c,d,e }: any) {
  useEffect(() => { /* a,b logic */ }, [a,b]);
  useEffect(() => { /* c,d logic */ }, [c,d]);
  useEffect(() => { /* e logic */ }, [e]);
}
```

---

## **9. A component should use ≤3 direct useState ; total hooks + states ≤5**

❌ Wrong Example: Too many states → hard to maintain

```
import { useState } from "react";

export function Bad9() {
  const [a,setA] = useState(0);
  const [b,setB] = useState("");
  const [c,setC] = useState(false);
  const [d,setD] = useState<number|null>(null);
  const [e,setE] = useState<string[]>([]);
  return <>{a}{b}{c.toString()}{d}{e.join(",")}</>;
}
```

✅ Correct Example: Use useReducer or custom hook to group

```
import { useReducer } from "react";

type State = { a:number; b:string; c:boolean };
function reducer(s: State, act: any): State {
  switch (act.type) {
    case "incA": return { ...s, a: s.a + 1 };
    case "setB": return { ...s, b: act.b };
    case "toggleC": return { ...s, c: !s.c };
  }
}

export function Good9() {
  const [state, dispatch] = useReducer(reducer, { a:0, b:"", c:false });
  return <button onClick={() => dispatch({ type:"incA" })}>{state.a}</button>;
}
```

---

## **10. Custom hooks must return state (and optionally actions)**

❌ Wrong Example: Side-effect only, no returned state

```
import { useEffect } from "react";

function usePageLoggerBad(page: string) {
  useEffect(() => { console.log("enter", page); }, [page]);
}
```

✅ Correct Example: Return state + optional action

```
import { useEffect, useState, useCallback } from "react";

function usePageLoggerGood(page: string) {
  const [enteredAt, setEnteredAt] = useState<number|null>(null);
  useEffect(() => { setEnteredAt(Date.now()); }, [page]);
  const markLeave = useCallback(() => console.log("leave", page), [page]);
  return { enteredAt, markLeave };
}
```
