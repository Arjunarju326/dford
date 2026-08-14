# Retail Discovery Platform

A comprehensive D4D-style retail offers and flyer discovery platform built with modern web technologies.

## 📋 Overview

This project is a production-ready platform for discovering, comparing, and managing retail offers and promotions across multiple stores and locations. It features a robust backend API and a responsive frontend application.

**Key Features:**
- 🗺️ Location-aware retail discovery
- 🏪 Store and branch management
- 🛍️ Product catalog and search
- 🎁 Offer management and comparisons
- 📄 Flyer upload and viewing
- ❤️ Favorites and shopping lists
- 📊 Analytics and tracking
- 📱 Responsive mobile design
- 🔐 Secure authentication

## 🏗️ Architecture

```
Retail Discovery Platform
├── Backend (Django + DRF)
│   ├── PostgreSQL Database
│   ├── Redis Cache/Celery
│   └── Cloudinary Storage
└── Frontend (Next.js)
    ├── TypeScript
    ├── Tailwind CSS
    └── TanStack Query
```

## 📁 Project Structure

```
retail-discovery-platform/
├── backend/                    # Django REST Framework API
│   ├── config/                # Django configuration
│   ├── apps/                  # Django applications
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment template
│   ├── manage.py             # Django CLI
│   └── README.md             # Backend documentation
├── frontend/                  # Next.js application
│   ├── src/                  # Source code
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   ├── .env.example          # Environment template
│   ├── tailwind.config.ts    # Tailwind configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── README.md             # Frontend documentation
├── startup.sh               # Automated startup script
├── docker-compose.yml       # Docker compose (future)
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- pip, npm/yarn

### Automated Setup (Recommended)

The easiest way to get started is using the automated startup script:

```bash
# Navigate to project root
cd retail-discovery-platform

# Make startup script executable (if needed)
chmod +x startup.sh

# Run startup script
./startup.sh
```

This will:
1. ✓ Check all prerequisites
2. ✓ Create Python virtual environment
3. ✓ Install backend dependencies
4. ✓ Create backend configuration files
5. ✓ Run database migrations
6. ✓ Install frontend dependencies
7. ✓ Start both servers automatically

### Manual Setup

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Update .env with your configuration
nano .env

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Create environment file
cp .env.example .env.local

# Update .env.local with API URL
nano .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🌐 Access Points

Once running, access the platform at:

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:3000 | User interface |
| Backend API | http://localhost:8000 | REST API |
| API Documentation | http://localhost:8000/api/docs/ | Swagger UI |
| Admin Panel | http://localhost:8000/admin | Django admin |
| API Schema | http://localhost:8000/api/schema/ | OpenAPI schema |

## ⚙️ Environment Configuration

### Backend (.env)

```bash
# Essential
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=retail_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_GA_TRACKING_ID=your_tracking_id
```

## 🗄️ Database Schema

The platform uses 10+ Django apps with interconnected models:

- **accounts**: User authentication and profiles
- **locations**: Geographic hierarchy (Country → State → City → Locality)
- **stores**: Retail stores and branches
- **catalog**: Products, categories, and brands
- **offers**: Promotions and pricing
- **flyers**: Flyer management and page extraction
- **shopping**: Shopping lists and items
- **favorites**: User favorites system
- **notifications**: Alert system
- **analytics**: Usage tracking and analytics

See backend [README.md](./backend/README.md) for detailed schema documentation.

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/user/` - Get current user

### Stores
- `GET /api/stores/` - List stores
- `GET /api/stores/{id}/` - Store details
- `GET /api/stores/{id}/branches/` - Store branches

### Offers
- `GET /api/offers/` - List offers
- `GET /api/offers/{id}/` - Offer details
- `POST /api/offers/{id}/save/` - Save offer
- `DELETE /api/offers/{id}/unsave/` - Unsave offer

### Products
- `GET /api/catalog/products/` - List products
- `GET /api/catalog/products/{id}/` - Product details
- `GET /api/catalog/categories/` - List categories

### Flyers
- `GET /api/flyers/` - List flyers
- `GET /api/flyers/{id}/` - Flyer details
- `GET /api/flyers/{id}/pages/` - Flyer pages

See full documentation at `/api/docs/` when running.

## 🧪 Testing

### Backend
```bash
cd backend
pytest                    # Run all tests
pytest apps/offers/      # Test specific app
pytest --cov=apps        # With coverage
```

### Frontend
```bash
cd frontend
npm test                  # Run tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage
```

## 📦 Building for Production

### Backend
```bash
cd backend
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🐳 Docker (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation

- [Backend README](./backend/README.md) - API documentation and setup
- [Frontend README](./frontend/README.md) - UI documentation and setup
- [Implementation Plan](./docs/implementation-plan.md) - Full project specification
- [API Documentation](http://localhost:8000/api/docs/) - Interactive API docs (when running)

## 🔒 Security Checklist

- [ ] Update `SECRET_KEY` in production
- [ ] Set `DEBUG=False` in production
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set secure CORS origins
- [ ] Update allowed hosts
- [ ] Configure HTTPS certificates
- [ ] Enable rate limiting
- [ ] Set up monitoring/logging
- [ ] Regular backups configured
- [ ] Security headers configured

## 📊 Performance Tips

- Use Redis for caching
- Enable CDN for static files
- Optimize database queries
- Use pagination for large datasets
- Compress images with Cloudinary
- Enable gzip compression
- Use connection pooling
- Monitor with Sentry/NewRelic

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8000    # Backend
lsof -i :3000    # Frontend

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check PostgreSQL is running and accessible
psql -U postgres

# Update credentials in .env
```

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend && pip install -r requirements.txt
cd frontend && npm install
```

## 📖 Development Workflow

1. Create feature branch
2. Make changes
3. Run tests: `pytest` or `npm test`
4. Run linting: `flake8` or `npm run lint`
5. Type checking: `mypy` or `npm run type-check`
6. Commit with clear messages
7. Submit pull request
8. Code review and merge

## 🚢 Deployment

### Recommended Platforms

**Backend:**
- Heroku
- DigitalOcean
- AWS EC2
- Google Cloud

**Frontend:**
- Vercel (recommended for Next.js)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Deployment Steps

1. Build both applications
2. Configure production environment variables
3. Set up CI/CD pipeline
4. Deploy to hosting platform
5. Configure DNS
6. Monitor in production

## 📝 Requirements & Dependencies

### Backend
```
Django==4.2.7
djangorestframework==3.14.0
psycopg2-binary==2.9.9
redis==5.0.1
celery==5.3.4
cloudinary==1.36.0
```

### Frontend
```
next@^14.0.0
react@^18.2.0
react-dom@^18.2.0
typescript@^5.2.0
tailwindcss@^3.3.5
zustand@^4.4.2
```

## 📄 License

Proprietary - All Rights Reserved

## 👥 Support & Contact

For issues, feature requests, or questions:
- Create an issue in the repository
- Contact the development team
- Check existing documentation

## 🎯 Roadmap

### Phase 1 (MVP) ✓
- [x] Core data model
- [x] Authentication system
- [x] Store management
- [x] Offer system
- [x] Flyer viewer

### Phase 2
- [ ] OCR flyer extraction
- [ ] Advanced search
- [ ] Notifications system
- [ ] Admin panel refinements

### Phase 3
- [ ] AI-assisted categorization
- [ ] Personalized recommendations
- [ ] Mobile app
- [ ] Multi-language support

### Phase 4
- [ ] Retailer portal
- [ ] Advanced analytics
- [ ] Advertising platform
- [ ] Price history tracking

## 🙏 Acknowledgments

Built following the D4D-style retail platform concept and modern web development best practices.

---

**Last Updated:** August 2026  
**Version:** 0.1.0-beta  
**Status:** Active Development
