This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


This project need to config broker to support with WSS if you want to use with website.



# Project File Tree

- `.env.example`
- `.gitignore`
- `eslint.config.mjs`
- `next-env.d.ts`
- `next.config.ts`
- `package.json`
- `postcss.config.mjs`
- `README.md`
- `tsconfig.json`
- `.next/`
  - `app-build-manifest.json`
  - `build-manifest.json`
  - `fallback-build-manifest.json`
  - `package.json`
  - `trace`
  - `transform.js`
  - `transform.js.map`
  - `build/`
    - `chunks/`
  - `cache/`
    - `.rscinfo`
  - `server/`
    - `app-paths-manifest.json`
    - `interception-route-rewrite-manifest.js`
  - `static/`
- `types/`
- `public/`
  - `file.svg`
  - `globe.svg`
  - `next.svg`
  - `vercel.svg`
  - `window.svg`
- `src/`
  - `.env`
  - `app/`
    - `components/`
    - `hooks/`