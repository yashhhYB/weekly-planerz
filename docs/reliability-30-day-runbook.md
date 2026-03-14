# 30-Day Reliability Runbook

## Objectives

- Keep API and frontend reachable and functional for 30 days
- Detect and respond to failures early
- Protect database availability and integrity

## Daily Checks

- `GET /health` returns HTTP 200
- Frontend loads without CORS errors
- Basic create/read flow succeeds end-to-end

## Weekly Checks

- Review Railway service logs and restart history
- Verify Vercel deployment status and build logs
- Confirm database file volume health and storage limits

## Incident Priorities

- Sev-1: Full outage (API unavailable)
- Sev-2: Degraded service (partial failures)
- Sev-3: Non-critical defects

## Response Basics

- Capture timestamp and error context
- Confirm whether issue is frontend, backend, or database
- Roll forward with minimal safe fix
- Re-validate health and user flow
