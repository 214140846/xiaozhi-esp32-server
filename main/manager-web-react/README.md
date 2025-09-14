# Manager Web React Runtime Docker (pnpm, Lightweight)

Runtime-only Nginx image for the React SPA. The image contains only compiled static assets — no source code.

## Build assets with pnpm

From the project root `main/manager-web-react`:

1) `pnpm install`
2) `pnpm build` (Vite outputs to `dist/` by default)
3) Copy output into docker context:
   - `cp -R dist docker/www`

Or use helper from the docker folder:

- `cd docker`
- `./build-with-pnpm.sh .. dist`

## Build and run the image

- Build: `docker build -t manager-web-react:latest main/manager-web-react/docker`
- Run: `docker run --rm -p 8080:80 manager-web-react:latest`
- Open: http://localhost:8080

## Notes

- `.dockerignore` ensures only `www/`, `Dockerfile`, `nginx.conf`, README and script enter the build context.
- `nginx.conf` is SPA-ready (fallback to `index.html`), gzip on, and caching for static assets.
- Adjust cache headers to match your asset versioning strategy if needed.

