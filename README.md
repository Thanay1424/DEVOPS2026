# 🔍 Crime Index Analytics Dashboard

A full-stack DevOps-ready web application for monitoring, analyzing, and managing crime statistics with real-time dashboards, interactive charts, and role-based access control.

---

## 🚀 Quick Start (Recommended)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd crime-index-dashboard
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed — defaults work out-of-the-box for local development
```

### 3. Start the App

```bash
npm start
```

Open your browser at **http://localhost:5000**

> The database is automatically seeded with 12 months of sample data and two demo accounts on first run.

---

## 🔐 Demo Login Credentials

| Role      | Email                       | Password      |
|-----------|-----------------------------|---------------|
| Admin     | admin@crimeindex.com        | Admin@1234    |
| Analyst   | analyst@crimeindex.com      | Analyst@1234  |

---

## 📁 Project Structure

```
crime-index-dashboard/
├── server.js                    # Express app entry point
├── package.json
├── .env                         # Environment variables (local)
├── .env.example                 # Environment template
├── Dockerfile                   # Production Docker image
├── docker-compose.yml           # Full stack Docker Compose
├── .dockerignore
├── .gitignore
│
├── config/
│   └── db.js                    # MongoDB connection
│
├── models/
│   ├── User.js                  # User schema (bcrypt password hashing)
│   └── CrimeStats.js            # Crime statistics schema
│
├── controllers/
│   ├── authController.js        # Register, login, profile
│   └── crimeStatsController.js  # CRUD + analytics
│
├── routes/
│   ├── authRoutes.js            # /api/register, /api/login, /api/me
│   └── crimeStatsRoutes.js      # /api/crime-stats
│
├── middleware/
│   ├── auth.js                  # JWT protect + adminOnly
│   └── errorHandler.js          # Global error handler
│
├── services/
│   └── seedService.js           # Auto-seeds demo data
│
├── public/
│   ├── index.html               # Login page
│   ├── css/
│   │   ├── main.css             # Global styles & variables
│   │   ├── login.css            # Login page styles
│   │   └── dashboard.css        # Dashboard layout & components
│   ├── js/
│   │   ├── api.js               # Fetch wrapper + auth utilities
│   │   ├── ui.js                # Toast, helpers, clock
│   │   ├── login.js             # Login form logic
│   │   ├── dashboard.js         # Charts + metric cards
│   │   ├── reports.js           # Reports & insights
│   │   └── admin.js             # Admin CRUD operations
│   └── pages/
│       ├── dashboard.html       # Main analytics dashboard
│       ├── reports.html         # Reports & summaries page
│       └── admin.html           # Admin management panel
│
└── .github/
    └── workflows/
        └── ci-cd.yml            # GitHub Actions CI/CD pipeline
```

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint       | Access  | Description          |
|--------|---------------|---------|----------------------|
| POST   | /api/register | Public  | Register new user    |
| POST   | /api/login    | Public  | Login & get JWT      |
| GET    | /api/me       | Auth    | Get current user     |
| GET    | /api/users    | Admin   | List all users       |

### Crime Statistics

| Method | Endpoint                         | Access | Description               |
|--------|----------------------------------|--------|---------------------------|
| GET    | /api/crime-stats                 | Auth   | Get all stats (paginated) |
| POST   | /api/crime-stats                 | Auth   | Add new crime stats       |
| GET    | /api/crime-stats/:id             | Auth   | Get single stat record    |
| PUT    | /api/crime-stats/:id             | Admin  | Update stat record        |
| DELETE | /api/crime-stats/:id             | Admin  | Delete stat record        |
| GET    | /api/crime-stats/analytics/summary | Auth | Full analytics summary  |

### Other

| Method | Endpoint     | Description       |
|--------|-------------|-------------------|
| GET    | /api/health | API health check  |

### Example Requests (Postman / Thunder Client)

**Register:**
```json
POST /api/register
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "Password@1234",
  "role": "user"
}
```

**Login:**
```json
POST /api/login
{
  "email": "admin@crimeindex.com",
  "password": "Admin@1234"
}
```

**Add Crime Stats (requires Bearer token):**
```json
POST /api/crime-stats
Authorization: Bearer <token>

{
  "theft": 210,
  "assault": 95,
  "fraud": 60,
  "cybercrime": 40,
  "crimeIndex": 72,
  "region": "National",
  "notes": "Monthly report"
}
```

---

## 🐳 Docker Deployment

### Option 1: Docker Compose (Full Stack)

```bash
# Start MongoDB + App
docker-compose up -d

# With Mongo Express UI (dev only)
docker-compose --profile dev up -d
```

- App:           http://localhost:5000
- Mongo Express: http://localhost:8081 (dev profile)

### Option 2: Build Image Manually

```bash
docker build -t crime-index-dashboard .
docker run -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/crimeIndexDB \
  -e JWT_SECRET=your_secret_key \
  crime-index-dashboard
```

---

## ⚙️ Environment Variables

| Variable       | Default                              | Description                    |
|---------------|---------------------------------------|--------------------------------|
| PORT           | 5000                                 | Server port                    |
| MONGO_URI      | mongodb://localhost:27017/crimeIndexDB | MongoDB connection string    |
| JWT_SECRET     | (required)                           | JWT signing secret             |
| JWT_EXPIRES_IN | 7d                                   | Token expiry duration          |
| NODE_ENV       | development                          | Environment mode               |

---

## 🔄 GitHub Actions CI/CD

The pipeline at `.github/workflows/ci-cd.yml` automatically:

1. **On every push / PR:** Runs syntax checks and a server health check
2. **On push:** Builds Docker image with layer caching
3. **On push to `main`:** Triggers deployment stage

To enable registry push, add your `DOCKER_USERNAME` and `DOCKER_PASSWORD` as GitHub repository secrets and uncomment the relevant lines in the workflow.

---

## 🛠 Development Mode

```bash
npm run dev    # Uses nodemon for hot-reload
```

---

## 📊 Features

- **Login / Register** with bcrypt password hashing and JWT tokens
- **Dashboard** with 5 metric cards, doughnut, bar, and line charts (Chart.js)
- **Reports** with analytics insights and full historical table
- **Admin Panel** — add, edit, delete crime statistics; view all users
- **Protected routes** — role-based access (admin vs analyst)
- **Auto-seed** — 12 months of sample data on first run
- **Docker-ready** with multi-stage build and health checks
- **CI/CD** via GitHub Actions

---

## 📝 License

MIT — free to use, modify, and distribute.
