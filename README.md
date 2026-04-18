# Rooftop Restaurant ERP

Full-stack restaurant management system with two access roles.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + MySQL + JWT + Socket.io
- **Auth**: JWT + bcryptjs, role-based access

## Roles

| Role | Access |
|---|---|
| **Manager** | Full access — dashboard, tables, orders, reservations, billing, menu, users |
| **Staff** | Operational — tables, orders, reservations only |

## Demo Users

| Email | Password | Role |
|---|---|---|
| manager@rooftop.local | rooftop@123 | manager |
| staff@rooftop.local | rooftop@123 | staff |

## Setup

```bash
git clone <repo-url>
cd rooftop-restaurant-erp
npm run install:all
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## API Routes

| Method | Path | Role | Description |
|---|---|---|---|
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | any | Current user |
| GET | /api/dashboard | manager | Metrics |
| GET/POST | /api/orders | any | List / create |
| PUT/DELETE | /api/orders/:id | any / manager | Update / delete |
| GET/POST | /api/reservations | any | List / create |
| PUT/DELETE | /api/reservations/:id | any | Update / delete |
| GET | /api/tables | any | List tables |
| PUT | /api/tables/:id | any | Update status |
| GET | /api/meta/menu | any | Menu items |
