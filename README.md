# Adaptive Learning Platform

A modern full-stack adaptive learning platform built with FastAPI backend and React frontend, featuring intelligent content delivery, user progress tracking, and personalized learning experiences.

## 🚀 Features

### Backend (FastAPI)
- **FastAPI Framework**: High-performance, modern web framework for building APIs
- **SQLAlchemy ORM**: Database abstraction layer with support for multiple databases
- **JWT Authentication**: Secure token-based authentication
- **Pydantic Models**: Data validation and serialization
- **CORS Support**: Cross-origin resource sharing configuration
- **Database Migrations**: Alembic for database schema management
- **Comprehensive API**: Full CRUD operations for users, items, and learning content
- **Error Handling**: Custom exception handling and standardized responses
- **Security**: Password hashing, token validation, and permission-based access

### Frontend (React)
- **Modern React**: Built with Create React App and latest React features
- **Responsive Design**: Mobile-first, adaptive UI components
- **State Management**: Efficient state handling for learning progress
- **API Integration**: Seamless connection to FastAPI backend
- **Interactive Learning**: Dynamic content delivery and progress tracking

## 📁 Project Structure

```
adaptive-learning/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── api_v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py
│   │   │       │   ├── users.py
│   │   │       │   └── items.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── item.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── item.py
│   │   ├── services/
│   │   │   ├── user_service.py
│   │   │   └── item_service.py
│   │   ├── utils/
│   │   │   ├── exceptions.py
│   │   │   └── response.py
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   ├── run.py
│   ├── env.example
│   ├── Dockerfile
│   └── docker-compose.yml
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7+
- Node.js 16+ (18+ recommended)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Run the backend**
   ```bash
   python run.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🌐 Access Points

### Backend API
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Frontend Application
- **React App**: http://localhost:3000
- **Development Server**: Auto-reloads on changes

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users/` - Get all users (admin only)
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user (admin only)

### Items/Learning Content
- `GET /api/v1/items/` - Get user's items
- `POST /api/v1/items/` - Create new item
- `GET /api/v1/items/{item_id}` - Get item by ID
- `PUT /api/v1/items/{item_id}` - Update item
- `DELETE /api/v1/items/{item_id}` - Delete item

## 🔧 Environment Variables

### Backend (.env)
| Variable                      | Description                          | Default                                              |
| ----------------------------- | ------------------------------------ | ---------------------------------------------------- |
| `DATABASE_URL`                | Database connection string           | `sqlite:///./app.db`                                 |
| `SECRET_KEY`                  | JWT secret key                       | `your-secret-key-change-this-in-production`          |
| `ALGORITHM`                   | JWT algorithm                        | `HS256`                                              |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time                | `30`                                                 |
| `ENVIRONMENT`                 | Environment (development/production) | `development`                                        |
| `DEBUG`                       | Debug mode                           | `True`                                               |
| `ALLOWED_ORIGINS`             | CORS allowed origins                 | `["http://localhost:3000", "http://localhost:8080"]` |

## 🗄️ Database

The application uses SQLAlchemy ORM with support for:
- SQLite (default for development)
- PostgreSQL (recommended for production)
- MySQL
- Other SQLAlchemy-supported databases

### Database Models
- **User**: User accounts with authentication and learning progress
- **Item**: Learning content and materials with CRUD operations

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (admin/user)
- CORS configuration
- Input validation with Pydantic
- Secure API endpoints

## 🧪 Development

### Running Tests

**Backend Tests**
```bash
cd backend
pytest
```

**Frontend Tests**
```bash
cd frontend
npm test
```

### Database Migrations

```bash
cd backend
# Initialize Alembic (if not already done)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Code Formatting

**Backend**
```bash
cd backend
pip install black isort
black app/
isort app/
```

**Frontend**
```bash
cd frontend
npm install --save-dev prettier
npx prettier --write src/
```

## 🚀 Production Deployment

### Backend
1. Set `ENVIRONMENT=production` and `DEBUG=False`
2. Use a production database (PostgreSQL recommended)
3. Set a strong `SECRET_KEY`
4. Configure proper CORS origins
5. Use a production ASGI server like Gunicorn with Uvicorn workers

```bash
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
cd frontend
npm run build
# Serve the build folder with a web server like nginx
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/adaptive-learning/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Learning! 🎓**# adaptive-learning
