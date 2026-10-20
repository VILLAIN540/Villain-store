# BNS Gaming starter project

A starter Node.js/Express + MongoDB backend and responsive HTML/CSS/JS frontend.

## Requirements
- Node.js 18 or newer (uses built-in `fetch`)
- MongoDB running locally or a MongoDB Atlas connection string

## Setup
1. Open a terminal in `backend/`.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and edit `MONGODB_URI`, `FRONTEND_ORIGIN`, and provider settings.
4. Start the API: `npm start`
5. Serve the `frontend/` directory with a local static server (for example VS Code Live Server on port 5500).
6. If your frontend uses another port/domain, update `FRONTEND_ORIGIN` in `backend/.env` and `API_BASE` in `frontend/script.js`.

API health check: `http://localhost:3000/api/health`

## Important integration notes
- `.env.example` is a template. Never publish `.env` or commit API keys.
- Payment creation is a starter integration and depends on the actual FamGateway API response format. Verify official provider docs and credentials before live use.
- The payment return URL is not proof of payment. The webhook intentionally returns `501` until official signature verification and payload mapping are implemented. Orders cannot become `paid` automatically in this starter.
- Like delivery is intentionally a placeholder. Configure an authorized API and implement its documented authentication, response handling, retries, and logging before enabling delivery.
- Coupon validation is implemented; authenticated admin coupon creation is not yet implemented.
- Add admin authentication, request rate limiting, input validation, webhook signature verification, HTTPS, and production CORS restrictions before deploying publicly.

## Routes
- `GET /api/health`
- `POST /api/coupons/validate` body: `{ "code": "WELCOME10" }`
- `POST /api/payment/create-order` body: `{ "product": "Normal Likes", "uid": "123456789", "region": "ind", "amount": 10 }`
- `GET /api/payment/status/:orderId`
- `POST /api/payment/webhook` (not enabled; returns 501)
- `POST /api/send` body: `{ "orderId": "...", "uid": "...", "region": "ind" }` (requires verified paid order)
- `GET /api/activity?orderId=...`

## Create a test coupon
Use MongoDB shell or Compass after connecting:
```js
db.coupons.insertOne({
  code: "WELCOME10",
  discountPercent: 10,
  active: true,
  maxUses: 100,
  uses: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```
