# 🔒 Lockr — Personal Finance Tracker

> A full-stack MERN personal finance management app to track expenses, income, savings, and financial goals — all in one place.

***

## 📋 Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [How It Works](#how-it-works)
- [App Flow](#app-flow)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)

***

## Description

**Lockr** is a personal finance tracker built with the MERN stack. It lets you record expenses and income, lock away savings (general or goal-linked), set financial goals with deadlines, and visualize your money across an interactive dashboard — all behind a secure JWT-authenticated account.

The name *Lockr* reflects the core idea: locking money away intentionally, whether into a goal or general savings, so you can track where every rupee goes.

***

## ✨ Features

### 💰 Expenses
- Add, edit, and delete expense entries
- Categorize expenses (Food, Transport, Shopping, etc.)
- Filter by search, category, and date range
- Summary bar: total, this month, top category, average per day

### 📈 Income
- Track income from multiple sources
- Filter by label and date range
- Summary: total income, this month, largest entry

### 🐷 Savings
- Lock money away as general savings or link to a specific goal
- Filter by type (general / goal-linked) and date range
- Summary: total locked, goal-linked, general, saved this month

### 🎯 Goals
- Create savings goals with a target amount and optional deadline
- Track progress with a visual progress bar
- Status tabs: Active / Completed / Abandoned
- Mark goals as completed when 100% reached, or abandon them
- Days-left countdown with overdue alerts

### 📊 Dashboard
- Overview of net balance, total income, expenses, and savings
- Recent transactions list
- Monthly trend charts
- Quick-add actions

### ⚙️ Settings
- Update profile (name, email)
- Currency preference (INR, USD, EUR, GBP, JPY, AUD)
- Theme toggle (Light / Dark / System)
- Change password with strength indicator
- Sign out

### 🔐 Auth
- JWT-based authentication (register / login)
- Passwords hashed with bcrypt
- Protected routes — all data is per-user

***

## 🛠 Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React 18, React Router v6            |
| Styling    | Inline styles with CSS variables     |
| Icons      | Lucide React                         |
| Toasts     | React Hot Toast                      |
| HTTP       | Axios                                |
| Backend    | Node.js, Express.js                  |
| Database   | MongoDB + Mongoose                   |
| Auth       | JWT + bcrypt                         |
| Dev Tools  | Vite, Nodemon, dotenv                |

***

## 📁 Folder Structure

```
lockr/
├── client/                        # React frontend (Vite)
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── api/
│   │   │   └── services.js        # Axios API calls (authAPI, expenseAPI, etc.)
│   │   ├── components/
│   │   │   └── shared/
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Spinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state (user, setUser, logout)
│   │   ├── hooks/
│   │   │   ├── useFetch.js        # Generic data fetching hook
│   │   │   └── useWindowWidth.js  # Responsive breakpoint hook
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Income.jsx
│   │   │   ├── Savings.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx                # Routes + layout
│   │   ├── main.jsx
│   │   └── index.css              # CSS variables (themes, colors)
│   ├── index.html
│   └── vite.config.js
│
├── server/                        # Express backend
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── expense.controller.js
│   │   ├── income.controller.js
│   │   ├── saving.controller.js
│   │   └── goal.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Saving.js
│   │   └── Goal.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── expense.routes.js
│   │   ├── income.routes.js
│   │   ├── saving.routes.js
│   │   └── goal.routes.js
│   ├── .env
│   └── index.js                   # Express app entry point
│
└── README.md
```

***

## ⚙️ How It Works

### Authentication
1. User registers with name, email, and password
2. Password is hashed with **bcrypt** before storing
3. On login, server verifies credentials and returns a **JWT**
4. JWT is stored in memory (AuthContext) and sent as `Authorization: Bearer <token>` on every API call
5. Protected routes on both frontend (React Router) and backend (middleware) guard all data

### Data Ownership
Every document (Expense, Income, Saving, Goal) stores a `userId` field. All queries are scoped to `{ userId: req.user._id }` — users can only access their own data.

### Savings ↔ Goals Link
When a saving is created with a `goalId`, the server automatically increments `goal.savedAmount`. When the saving is deleted, `savedAmount` is decremented. This keeps goal progress always in sync without a separate sync step.

### Theme
The active theme (`light` / `dark` / `system`) is stored in `localStorage` under `lockr-theme`. On load, the app reads this value and sets `data-theme` on `<html>`, switching the full CSS variable palette.

***

## 🔄 App Flow

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   Login / Register  │
              │   (JWT returned)    │
              └──────────┬──────────┘
                         │  token stored in AuthContext
                         │
              ┌──────────▼──────────┐
              │      Dashboard      │◄─── overview of all data
              └──────────┬──────────┘
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
┌───────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
│   Expenses   │  │   Income    │  │   Savings   │
│ CRUD + filter│  │ CRUD+filter │  │ CRUD+filter │
└──────────────┘  └─────────────┘  └──────┬──────┘
                                          │ optional goalId link
                                   ┌──────▼──────┐
                                   │    Goals    │
                                   │ progress,   │
                                   │ deadline,   │
                                   │ status tabs │
                                   └─────────────┘
                         │
              ┌──────────▼──────────┐
              │      Settings       │
              │  profile, theme,    │
              │  currency, password │
              └─────────────────────┘
```

### Request Lifecycle

```
React Page
    │
    ├─ useFetch() / direct call
    │
    ▼
api/services.js  (Axios instance with JWT header)
    │
    ▼
Express Router  →  auth.middleware (verify JWT)
    │
    ▼
Controller  →  Mongoose Model  →  MongoDB
    │
    ▼
JSON Response  →  React state update  →  UI re-render
```

***

## 🔌 API Reference

All routes require `Authorization: Bearer <token>` except `/api/auth/register` and `/api/auth/login`.

### Auth
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | `/api/auth/register`        | Create account       |
| POST   | `/api/auth/login`           | Login, get JWT       |
| GET    | `/api/auth/me`              | Get current user     |
| PUT    | `/api/auth/me`              | Update profile       |
| PUT    | `/api/auth/change-password` | Change password      |

### Expenses / Income / Savings / Goals
Each resource follows the same REST pattern:

| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| GET    | `/api/:resource`     | Get all (user)    |
| POST   | `/api/:resource`     | Create new entry  |
| PUT    | `/api/:resource/:id` | Update entry      |
| DELETE | `/api/:resource/:id` | Delete entry      |

Where `:resource` is one of: `expenses`, `income`, `savings`, `goals`.

***

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/lockr.git
cd lockr
```

### 2. Setup the server
```bash
cd server
npm install
```

Create a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lockr
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Setup the client
```bash
cd client
npm install
npm run dev
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Open in browser
```
http://localhost:5173
```

***

## 🌐 Environment Variables

| Variable     | Description                    | Example                           |
|--------------|--------------------------------|-----------------------------------|
| `PORT`       | Express server port            | `5000`                            |
| `MONGO_URI`  | MongoDB connection string      | `mongodb://localhost:27017/lockr` |
| `JWT_SECRET` | Secret key for signing JWTs    | `mysecretkey123`                  |

***

## 📄 License

MIT © 2026 Lockr
