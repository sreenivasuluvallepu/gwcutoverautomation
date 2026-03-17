# API Contracts

Base URL: `/api`

## Traffic modes

- `POST /traffic/mirror`
  - Body: `{ endpointIds: string[], mirrorPercent: number, sampling: string, logResponses: boolean, environment?: string, sourceGatewayName?: "SDP(Onestream)"|"EASE"|"UK Partner", applyToAlb?: boolean }`
- `POST /traffic/shadow`
  - Body: `{ endpointIds: string[], shadowPercent: number, anomalyDetect: boolean, storeResponses: boolean, environment?: string, sourceGatewayName?: string, applyToAlb?: boolean }`
- `POST /traffic/parallel`
  - Body: `{ endpointIds: string[], rule: "exact"|"schema"|"tolerance", tolerance: number, environment?: string, sourceGatewayName?: string, applyToAlb?: boolean }`
- `POST /traffic/canary`
  - Body: `{ endpointIds: string[], canaryPercent: number, schedule?: number[], environment?: string, sourceGatewayName?: string, applyToAlb?: boolean }`
- `POST /traffic/progressive`
  - Body: `{ endpointIds: string[], targetPercent: number, schedule: number[], environment?: string, sourceGatewayName?: string, applyToAlb?: boolean }`
- `POST /traffic/cutover`
  - Body: `{ endpointIds: string[], environment?: string, sourceGatewayName?: string, applyToAlb?: boolean }`
- `POST /traffic/rollback`
  - Body: `{ endpointIds: string[], environment?: string, sourceGatewayName?: string, applyToAlb?: boolean }`

When `applyToAlb: true`, response includes `albApplied` with applied listener/rule/weights and selected path patterns.

## Comparison

- `GET /compare/results`
- `GET /compare/diff?endpointId=<id>`

## Routing / actions

- `POST /actions/execute`
  - Body: `{ action: string, endpointIds: string[], environment: string }`

## Dashboard / inventory

- `GET /dashboard/summary`
- `GET /dashboard/traffic-split`
- `GET /dashboard/mode-distribution`
- `GET /dashboard/migration-trend`
- `GET /endpoints/legacy`
- `GET /endpoints/kong`
- `GET /endpoints/mapping`

## Governance / observability

- `GET /logs?mode=<mirror|shadow|parallel|canary|cutover>`
- `GET /approvals`
- `POST /approvals/request`
- `POST /approvals/decide`

## Simulation

- `POST /simulate`
  - Body: `{ mode: "canary"|"parallel"|"shadow", percent: number, endpointCount: number }`
