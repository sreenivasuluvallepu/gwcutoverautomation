# Gateway Migration Control Center UI

Production-style UI application for managing migration and cutover from Legacy OpenResty/Janus gateway to Kong Gateway Enterprise.

## What is implemented

- Enterprise shell with left navigation, top environment selector, global search, and dark/light mode.
- Executive dashboard for migration KPIs, rollout status, health summaries, and activity timeline.
- Migration inventory/service catalog with filterable grid and readiness/eligibility states.
- Cutover control center with strategy selection, traffic controls, risk/guardrail preview, and approval modal.
- Parallel test console with side-by-side comparison summary and confidence scoring.
- Canary management screen with percentage controls, threshold monitoring, and promotion actions.
- Progressive shift manager with staged stepper, pause/resume, and fallback rules.
- Rollback center with one-click rollback flow, scope targeting, and rollback history.
- Environment manager with drift comparison and deployment history views.
- Observability page with streaming log panel, latency/error trend charts, and health metrics.
- Audit/governance page with immutable-trail style records and evidence-pack generation flow.

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Run with Docker

```bash
docker compose up --build -d
```

Open:

- http://localhost:8080

## Notes

- Data is mocked but modeled after enterprise cutover workflows.
- The app is structured so backend APIs, WebSocket streams, and real workflow/orchestration services can be plugged in with minimal page rewrite.
