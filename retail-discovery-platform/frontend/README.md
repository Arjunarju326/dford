# Retail Discovery Platform - Frontend

A modern, responsive Next.js frontend for the D4D-style retail discovery and offer comparison platform.

## Overview

This is a production-ready Next.js application built with:
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form handling
- **TanStack Query** - Data fetching
- **Zustand** - State management

## Features

- Location-aware retail discovery
- Browse stores and categories
- Search products and offers
- View detailed offer information
- Flyer viewer
- Save favorite offers and stores
- Shopping list management
- Responsive design (mobile & desktop)
- SEO-friendly pages
- Analytics integration

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Testing**: Vitest
- **Linting**: ESLint
- **Formatting**: Prettier

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (main)/            # Main app pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   ├── forms/            # Form components
│   │   └── cards/            # Card components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   │   └── api-client.ts     # API client
│   ├── types/                 # TypeScript types
│   ├── styles/               # Global styles
│   └── utils/                # Helper utilities
├── public/                    # Static assets
├── tests/                     # Test files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Running Django backend API

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Create .env.local from example**
```bash
cp .env.example .env.local
```

3. **Update environment variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

4. **Install dependencies**
```bash
npm install
# or
yarn install
```

### Development

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

The app will automatically reload when you make changes.

### Building

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Code Quality

```bash
# Run linting
npm run lint

# Check types
npm run type-check

# Format code
npm run format

# Check formatting without changes
npm run format:check

# Run tests
npm test

# Run tests with UI
npm test:ui
```

## Environment Variables

Create a `.env.local` file with:

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Google Analytics
NEXT_PUBLIC_GA_TRACKING_ID=

# App Configuration
NEXT_PUBLIC_APP_NAME=Retail Discovery
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Key Features Implementation

### Authentication
- JWT-based authentication
- Secure token storage
- Login/Register/Logout
- Protected routes

### Location Management
- Dynamic location selection
- City/locality filtering
- GPS-based location (future)

### Store Browsing
- Store listing with filters
- Branch locations
- Store details and ratings
- Operating hours

### Product & Offer Discovery
- Category-based browsing
- Product search
- Offer filtering
- Price comparisons
- Discount highlights

### Flyer Viewer
- PDF flyer display
- Page navigation
- Product extraction

### Shopping Lists
- Create multiple lists
- Add/remove items
- Mark items as purchased
- Share lists

### Favorites
- Save offers
- Favorite stores
- Favorite products
- Quick access

## API Integration

The frontend uses a centralized API client (`lib/api-client.ts`) that:
- Handles authentication
- Manages token refresh
- Provides type-safe methods
- Includes error handling
- Supports pagination

Example usage:
```typescript
// Get offers
const offers = await apiClient.offers.list({ 
  city_id: 1,
  discount_min: 10
});

// Save an offer
await apiClient.offers.save(offerId);

// Get user's shopping lists
const lists = await apiClient.shopping.lists();
```

## Styling

Uses Tailwind CSS with:
- Custom color scheme
- Dark mode support
- Responsive breakpoints
- Custom animations
- Safe area insets for mobile

## Performance Optimization

- Image optimization with Next.js Image
- Code splitting
- Lazy loading components
- Query caching with TanStack Query
- CDN-ready assets

## Mobile Support

- Responsive design
- Touch-friendly UI
- Safe area handling
- Mobile navigation patterns
- Viewport optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- offers.test.ts

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t retail-frontend .

# Run container
docker run -p 3000:3000 retail-frontend
```

### Manual (Node.js)

```bash
# Build
npm run build

# Start
npm start
```

## Common Issues

### Port Already in Use
```bash
# On macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### API Connection Error
- Check backend is running on correct URL
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in Django backend

### TypeScript Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

## Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and lint
4. Submit a pull request

## Performance Checklist

- [ ] Images are optimized
- [ ] Code splitting is working
- [ ] Bundle size is under 500KB
- [ ] Core Web Vitals are good
- [ ] Mobile performance is good
- [ ] SEO is configured

## Security

- XSS protection headers
- CSRF tokens for forms
- Secure token storage
- Input validation
- Output escaping
- Content Security Policy

## License

Proprietary - All Rights Reserved

## Support

For issues and questions, please contact the development team.
