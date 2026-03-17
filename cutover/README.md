# Cutover Migration Control Plane

Production-style React + Node control plane to manage GWLite -> Kong Gateway endpoint migration with:

- Mirror testing
- Shadow traffic
- Parallel testing
- Canary rollouts
- Progressive shifts
- Full cutover and rollback

## Stack

- React + TypeScript + Vite
- Tailwind CSS (shadcn-style primitives)
- React Flow (topology)
- Recharts (analytics)
- TanStack Table (endpoint workspace)
- Zustand (global control-plane state)
- TanStack Query (data fetching/mutations)
- Framer Motion (animated dashboard cards)
- Express backend + Excel ingest (`xlsx`)

## Data input

Place files in either:

- `cutover/data/gwlite_endpoints.xlsx`
- `cutover/data/Kong_gateway.xlsx`

or repo root:

- `data/gwlite_endpoints.xlsx`
- `data/Kong_gateway.xlsx`

If files are missing, the backend auto-loads realistic seeded data so the app remains fully functional.

## Run

```bash
cd cutover
npm install
npm run dev
```

- Web UI: `http://localhost:5180`
- API: `http://localhost:8787`

## Run with Docker

```bash
cd cutover
docker compose up --build -d
```

Open:

- `http://localhost:8081`

## Direct AWS ALB apply on Execute

Cutover Actions `Execute` now calls `/api/traffic/*` with `applyToAlb: true`, and backend applies ALB rule changes immediately.

Set these env vars before `docker compose up` (or in shell for local run):

- `AWS_REGION` (default `us-east-1`)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional)
- `ALB_LISTENER_ARN`
- `ALB_TG_KONG_ARN`
- `ALB_TG_SDP_ONESTREAM_ARN`
- `ALB_TG_EASE_ARN`
- `ALB_TG_UK_PARTNER_ARN`
- `ALB_RULE_PRIORITY_BASE` (optional, default `1000`)

Behavior:

- `Canary/Progressive/Cutover/Rollback` apply weighted forwarding to GWLite/Kong target groups.
- `Mirror/Shadow/Parallel` keep live routing on GWLite at ALB (100/0); advanced duplication/comparison still requires gateway/plugin layer.
- Rules are created/updated on the configured ALB listener using path conditions from selected endpoints (up to 5 paths per execution payload).

## Key APIs

- `POST /api/traffic/mirror`
- `POST /api/traffic/shadow`
- `POST /api/traffic/parallel`
- `POST /api/traffic/canary`
- `POST /api/traffic/progressive`
- `POST /api/traffic/cutover`
- `POST /api/traffic/rollback`
- `GET /api/compare/results`
- `GET /api/compare/diff`

## Environment reference integration

The backend exposes environment references for:

- `gwlegacy`
- `kong-api-gateway`

These are used as control-plane environment anchors and can be replaced with real deployment metadata providers.
