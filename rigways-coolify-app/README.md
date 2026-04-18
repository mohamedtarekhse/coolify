# Rigways Coolify App

Fresh starter for the rebuilt Rigways stack in a separate folder.

## Stack

- `web`: React + Vite + TypeScript + Tailwind CSS
- `api`: Node.js + TypeScript
- `worker`: Node.js + TypeScript background worker
- `database`: MySQL 8
- `cache`: Redis

## Why TypeScript Was Added

TypeScript is the only critically-needed extra language here. It makes the shared domain models, API payloads, and role-based logic much safer to maintain than plain JavaScript.

## Folder Layout

```text
rigways-coolify-app/
  apps/
    web/
    api/
    worker/
  docker-compose.local.yml
  package.json
```

## Local Start

```powershell
npm install
npm run dev:web
npm run dev:api
npm run dev:worker
```

## Coolify Shape

- Create one Coolify app for `apps/web`
- Create one Coolify app for `apps/api`
- Create one Coolify app for `apps/worker`
- Attach MySQL and Redis resources

This folder is only the new starter scaffold. It does not replace the current production-like app in the repo root.
