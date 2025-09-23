# Repository Guidelines
所有文件要注意不能超过 300 行，超过 300 行就要尝试封装到新文件中
## Project Structure & Module Organization
- `main/xiaozhi-server/` is the Python real-time engine; config in `config/`, plugins in `core/`, test utilities in `test/`.
- `main/manager-api/` is the Spring Boot backend; domain modules sit in `src/main/java/com/xiaozhi/modules` and Liquibase changelog files in `resources/db`.
- `main/manager-web/` (Vue CLI) and `main/manager-web-react/` (React + Vite) host the consoles; static files remain in `public/`.
- `main/manager-mobile/` contains the uni-app client; shared deployment notes and scripts live in the repository root and `docs/`.

## Build, Test, and Development Commands
- Python service: `cd main/xiaozhi-server && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && python app.py`.
- Containers: `cd main/xiaozhi-server && docker-compose up -d`.
- Manager API: `cd main/manager-api && mvn clean package`; run locally with `mvn spring-boot:run`.
- Vue admin: `cd main/manager-web && npm install && npm run serve`; React console: `cd main/manager-web-react && npm install && npm run dev`.
- Regenerate React API clients after OpenAPI updates via `npm run generate:openapi`.

## Coding Style & Naming Conventions
- Python follows PEP 8 (4 spaces, snake_case); await async handlers and log with `loguru`.
- Java uses UpperCamelCase classes, `com.xiaozhi.*` packages, and constructor injection in services; keep DTOs inside their module package.
- Vue SFCs and React components use PascalCase filenames, while hooks/utilities stay camelCase; run `npm run lint` (React) or rely on Vue CLI formatting before pushes.
- Keep secrets out of VCS: extend `config/config.yaml` or `.env.local`, and avoid committing `.env` values or access keys.

## Testing Guidelines
- Execute `cd main/manager-api && mvn test` and add new `@SpringBootTest` or mapper tests under `src/test/java`.
- Python changes should include `pytest`/`unittest` coverage in `main/xiaozhi-server/test/` (name files `test_*.py`) and exercise websocket flows with `test_page.html` when relevant.
- For frontends, run `npm run lint` (React) or `npm run build` (Vue) to catch regressions; add vitest/cypress specs for behaviour-heavy changes.
- Document manual device verification (ESP32 pairing, OTA fetch) in the PR when automation is impractical.

## Commit & Pull Request Guidelines
- Keep commit subjects descriptive, optionally prefixing component names, e.g. `manager-api: 调整设备鉴权`.
- Limit subjects to ~72 characters, describe migrations or feature flags in the body, and squash unrelated fixes.
- PRs should link issues, summarise scope, list touched services, attach UI screenshots when applicable, and record the commands run from the testing section.
