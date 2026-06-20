# ParkSmart — Smart Parking & Traffic Management System

A production-ready full-stack application for smart parking, real-time traffic management, AI occupancy prediction, and analytics.

![Tech Stack](https://img.shields.io/badge/React-Vite-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101)

## Features

- **Live Dashboard** — Real-time parking stats, revenue, traffic overview, AI predictions
- **Smart Booking** — Slot reservation with QR codes, timer, auto-expiry (₹100/hr)
- **Interactive Parking Layout** — Color-coded slots (Available/Occupied/Reserved/Maintenance)
- **Real-Time Updates** — Socket.io for instant slot, traffic, and notification updates
- **Traffic Management** — Live density, road status, alerts, alternate routes
- **Heat Maps** — Occupancy, traffic, revenue, and movement visualization
- **Interactive Map** — Leaflet map with parking locations and traffic markers
- **Payments** — Razorpay-ready integration with PDF invoices
- **Analytics** — Recharts dashboards for bookings, revenue, occupancy
- **Admin Panel** — User/slot/booking management, report exports
- **AI Predictions** — Python Flask service for occupancy forecasting
- **Dark/Light Mode** — Premium glassmorphism UI with Framer Motion animations

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Leaflet, Socket.io Client |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT, Socket.io |
| AI Service | Python, Flask, NumPy, Scikit-learn |
| Payments | Razorpay (demo mode included) |

## Project Structure

```
lumen_hack/
├── frontend/          # React + Vite frontend
├── backend/           # Express API + Socket.io
├── ai-service/        # Python occupancy prediction
├── package.json       # Root scripts (npm run dev)
└── README.md
```

## Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **Python** 3.9+ (optional, for AI service)

## Quick Start

### 1. Install Dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

Backend config is at `backend/.env` (already created):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_parking
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

Ensure MongoDB is running locally, or update `MONGODB_URI` in `backend/.env`.

### 4. Seed Database (Optional)

```bash
cd backend && npm run seed
```

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartparking.com | admin123 |
| User | user@smartparking.com | user123 |

### 5. Run the Application

From the project root:

```bash
npm run dev
```

This starts:
- **Backend API** → http://localhost:5000
- **Frontend** → http://localhost:5173

### 6. AI Service (Optional)

```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5001

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/verify-email` | Verify email |
| GET | `/auth/profile` | Get profile (auth) |
| PUT | `/auth/profile` | Update profile (auth) |

### Parking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/parking/slots` | List all slots |
| GET | `/parking/slots/stats` | Slot statistics |
| GET | `/parking/dashboard` | Dashboard data |
| POST | `/parking/bookings` | Create booking |
| GET | `/parking/bookings` | List bookings |
| PUT | `/parking/bookings/:id/cancel` | Cancel booking |
| POST | `/parking/check-in` | QR check-in |
| POST | `/parking/check-out` | QR check-out |
| GET | `/parking/search?q=` | Search |
| GET | `/parking/recommendations` | Smart recommendations |

### Traffic
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/traffic` | All traffic data |
| GET | `/traffic/heatmap` | Heat map data |
| GET | `/traffic/routes` | Alternate routes |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create` | Create payment |
| POST | `/payments/verify` | Verify payment |
| GET | `/payments` | Payment history |
| GET | `/payments/:id/invoice` | Download PDF invoice |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Analytics data |
| GET | `/analytics/predictions` | AI predictions |
| GET | `/analytics/admin/stats` | Admin statistics |
| GET | `/analytics/export?format=csv` | Export reports |

## Database Collections

- `users` — User accounts and preferences
- `vehicles` — Registered vehicles
- `parkingslots` — Parking slot inventory
- `bookings` — Reservations and check-in/out
- `payments` — Payment transactions
- `notifications` — User notifications
- `trafficdata` — Road traffic information
- `heatmaps` — Heat map data points
- `analytics` — Aggregated analytics

## Pricing

- **₹100 per hour** (1hr = ₹100, 2hr = ₹200, ... up to 24 hours max)

## Pages

Landing, Login, Register, Dashboard, Book Parking, Parking Layout, Traffic Dashboard, Heat Maps, Live Map, Booking History, Payments, Notifications, Profile, Settings, Analytics, Admin Dashboard, Reports, Search

## License

MIT
