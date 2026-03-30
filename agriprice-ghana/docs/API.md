# AgriPrice Ghana API

Base URL: `http://localhost:5000/api`

## Health
- `GET /health`

## Auth
- `POST /auth/register`
  - body: `{ fullName, email, password }`
- `POST /auth/login`
  - body: `{ email, password }`
- `POST /auth/google`
  - body: `{ idToken }`
- `GET /auth/me` (Bearer token)

## Prices
- `GET /prices?crop=&region=&limit=`
- `GET /prices/history?crop=&region=&days=30`
- `GET /prices/compare?crop=Maize`
- `GET /prices/predict?crop=Maize&region=Accra`
- `PATCH /prices/:id` (admin only)
- `DELETE /prices/:id` (admin only)

## Submissions
- `POST /submissions` (auth)
  - body: `{ crop, region, market, unit, price }`
- `GET /submissions?status=pending|approved|rejected|all` (admin)
- `PATCH /submissions/:id/review` (admin)
  - body: `{ decision: "approved"|"rejected", reviewComment? }`

## Subscriptions
- `GET /subscriptions` (auth)
- `POST /subscriptions` (auth)
  - body: `{ crop, region, thresholdPercent }`
- `DELETE /subscriptions/:id` (auth)

## Users (Admin)
- `GET /users`
- `PATCH /users/:id/role`
  - body: `{ role: "user"|"admin" }`

## Donations
- `POST /donations/initialize`
  - body: `{ donorName?, email, amount }`
- `GET /donations/verify/:reference`

## Typical Error Format
```json
{
  "message": "Validation failed",
  "details": [
    {
      "msg": "Invalid value",
      "path": "email"
    }
  ]
}
```
