# DuckWire (Next.js App Router + Tailwind)

A Ground News–style clone scaffolded with App Router and Tailwind.

## Prereqs
- Node 18+

## Install
```bash
npm install
```

## Run dev
```bash
npm run dev
```

Then open http://localhost:3000

## What’s included
- App Router with shared `app/layout.js`, global header/footer
- Tailwind set up in `app/globals.css` and `tailwind.config.js`
- Placeholder routes:
  - `/` (home), `/article/[slug]`, `/interest/[slug]`, `/search`, `/blindspot`, `/local`, `/my`, `/login`, `/subscribe`
- Basic components: `Header`, `Footer`, `BiasBar`, interest pill scroller

## Next steps
- Flesh out components per:
  - `project-files/pages/homepage.md`
  - `project-files/pages/article-slug-page.md`
  - `project-files/pages/interest-page.md`
- Add wallet connect (wagmi/Web3Modal) targeting DuckChain
- Add route handlers under `app/api/*` and hook to ingestion services
