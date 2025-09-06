# Adaptive Learning Platform

A modern full-stack adaptive learning platform built with FastAPI backend and React frontend.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PraveenGulipalli/adaptive-learning.git
   cd adaptive-learning
   ```

2. **Install all dependencies**
   ```bash
   npm run setup
   ```
   This will install:
   - Root dependencies (concurrently)
   - Frontend dependencies (React, etc.)
   - Backend dependencies (FastAPI, SQLAlchemy, etc.)

3. **Run the application**
   ```bash
   npm run dev
   ```
   This starts both frontend and backend concurrently.

### Alternative Setup

**Manual installation:**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && pip install -r requirements.txt
```

**Run services separately:**
```bash
# Backend only
npm run backend
# or
cd backend && python3 run.py

# Frontend only
npm run frontend
# or
cd frontend && npm start
```

## 📁 Project Structure

```
adaptive-learning/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Development server
├── frontend/               # React frontend
│   ├── public/            # Static assets
│   ├── src/               # React components
│   ├── package.json       # Frontend dependencies
│   └── README.md          # Frontend documentation
├── package.json           # Root package.json with scripts
└── README.md              # This file
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 🛠️ Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run backend` - Start backend only
- `npm run frontend` - Start frontend only
- `npm run setup` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm run test` - Run frontend tests
- `npm run test-backend` - Run backend tests

## 🔧 Development

The application uses:
- **Backend**: FastAPI with SQLAlchemy, Alembic for migrations
- **Frontend**: React with modern hooks and functional components
- **Database**: PostgreSQL (configured via environment variables)
- **Authentication**: JWT tokens with bcrypt password hashing

## 📝 Environment Setup

Copy `backend/env.example` to `backend/.env` and configure your environment variables:

```bash
cp backend/env.example backend/.env
```

## 🐳 Docker Support

The project includes Docker configuration for containerized deployment:

```bash
# Build and run with Docker Compose
cd backend
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.