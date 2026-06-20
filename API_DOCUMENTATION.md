# ParkSmart API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Include JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91 9876543210"
}
```

### POST /auth/login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /auth/forgot-password
```json
{ "email": "john@example.com" }
```

### POST /auth/reset-password
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### POST /auth/verify-email
```json
{ "token": "verification_token" }
```

### GET /auth/profile (Auth Required)

### PUT /auth/profile (Auth Required)
```json
{
  "name": "Updated Name",
  "phone": "+91 9876543210",
  "address": "123 Main St",
  "preferences": { "theme": "dark", "notifications": true }
}
```

---

## Parking Endpoints

### GET /parking/slots
Query params: `zone`, `status`, `type`

### GET /parking/slots/stats

### GET /parking/slots/:id

### GET /parking/dashboard (Auth Required)

### POST /parking/bookings (Auth Required)
```json
{
  "slotId": "mongo_slot_id",
  "date": "2026-06-20",
  "startTime": "10:00",
  "duration": 2,
  "vehicleId": "optional",
  "vehicleNumber": "DL01AB1234"
}
```

### GET /parking/bookings (Auth Required)

### PUT /parking/bookings/:id/cancel (Auth Required)

### POST /parking/check-in (Auth Required)
```json
{ "bookingId": "BK123ABC" }
```

### POST /parking/check-out (Auth Required)
```json
{ "bookingId": "BK123ABC" }
```

### POST /parking/scan-qr (Auth Required)
```json
{ "qrData": "{\"bookingId\":\"BK123\"}" }
```

### GET /parking/search?q=query (Auth Required)

### GET /parking/recommendations (Auth Required)

---

## Vehicle Endpoints (Auth Required)

### GET /vehicles
### POST /vehicles
```json
{
  "vehicleNumber": "DL01AB1234",
  "vehicleType": "car",
  "brand": "Toyota",
  "model": "Camry",
  "color": "White",
  "isEV": false
}
```

### PUT /vehicles/:id
### DELETE /vehicles/:id

---

## Payment Endpoints (Auth Required)

### POST /payments/create
```json
{
  "bookingId": "booking_mongo_id",
  "method": "razorpay"
}
```

### POST /payments/verify
```json
{
  "paymentId": "payment_mongo_id",
  "razorpayPaymentId": "pay_xxx"
}
```

### GET /payments
### GET /payments/:id/invoice (Returns PDF)

---

## Notification Endpoints (Auth Required)

### GET /notifications
### PUT /notifications/:id/read
### PUT /notifications/read-all

---

## Traffic Endpoints

### GET /traffic
### GET /traffic/heatmap?type=occupancy
### GET /traffic/routes?from=lat,lng&to=lat,lng
### GET /traffic/:id

---

## Analytics Endpoints

### GET /analytics?period=daily (Auth Required)
### GET /analytics/predictions (Auth Required)
### GET /analytics/admin/stats (Admin)
### GET /analytics/admin/users (Admin)
### GET /analytics/export?format=csv|excel|json (Admin)

---

## WebSocket Events

Connect to: `http://localhost:5000`

### Client → Server
- `join` — `{ userId }`
- `subscribeDashboard`
- `subscribeTraffic`

### Server → Client
- `slotUpdate` — `{ slotId, status, slot }`
- `dashboardUpdate` — Dashboard statistics
- `trafficUpdate` — Road traffic data
- `trafficAlert` — Traffic alert notification
- `notification` — User notification
- `heatMapUpdate` — Heat map data array

---

## Health Check
### GET /api/health
