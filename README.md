# Gaming Store — BNS-style starter

A responsive Free Fire likes-store website starter with a homepage, instant likes form, AutoLikes UI, coupon packages, player-tool cards, support section, Express API and optional MongoDB integration.

## Important
This is an independently built starter inspired by the publicly visible feature set of BNS Gaming Store. It does not contain their private source code, branding assets, API, or payment credentials. Real likes delivery, recurring AutoLikes, payment processing, player lookups and account tools are intentionally not faked; connect providers you are authorized to use.

## Run locally
1. Install Node.js 18 or newer.
2. Extract the ZIP and open a terminal in this folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Set `MONGODB_URI` to your MongoDB Atlas connection string and set a long random `ADMIN_KEY`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

The homepage can be previewed without MongoDB. Live coupons/stats require MongoDB. The send endpoint refuses to claim successful delivery until an authorized provider adapter is implemented.

## Admin coupon endpoint
After MongoDB is connected, send a POST request to `/api/admin/coupons` with JSON body `{"likes":210}` and header `x-admin-key: YOUR_ADMIN_KEY`. Protect this endpoint further before public production use. Do not expose the admin key in browser JavaScript.

## Before production
- Add real user/admin authentication, CSRF/rate limiting, validation and audit logs.
- Integrate a payment gateway using server-side order creation and verified webhooks/signatures. Never trust a browser redirect as payment proof.
- Implement the likes provider adapter using its documented API and handle provider limits, retries and idempotency.
- Use a worker/cron scheduler for AutoLikes; persist schedules and delivery results in MongoDB.
- Replace sample package prices and support links.
- Deploy on a Node-compatible host; set environment variables in the hosting dashboard and use HTTPS.
