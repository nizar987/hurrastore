# StoreOnline - Fullstack Ecommerce Application

A modern, fullstack ecommerce application built with Next.js, Express.js, TypeScript, and Tailwind CSS. This project demonstrates a complete ecommerce solution with user authentication, product management, shopping cart functionality, and order processing.

## 🚀 Features

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **User Authentication**: Login/Register with JWT token management
- **Product Catalog**: Browse products with search, filtering, and pagination
- **Shopping Cart**: Add/remove items, update quantities, view cart total
- **Checkout Process**: Secure order placement with shipping information
- **Order Management**: View order history and track order status
- **Admin Panel**: Product management for administrators

### Backend (Express.js + TypeScript + Prisma)
- **RESTful API**: Well-structured API endpoints
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: SQLite with Prisma ORM for easy development
- **Product Management**: CRUD operations for products
- **Cart Management**: Persistent shopping cart functionality
- **Order Processing**: Complete order lifecycle management
- **Security**: CORS, Helmet, input validation, and error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling with validation
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Express.js** - Web framework for Node.js
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern database ORM
- **SQLite** - Lightweight database for development
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation middleware
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd store-online
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Environment
Create a `.env.local` file in the `frontend` directory:
```bash
cd frontend
cp env.example .env.local
```

Edit the `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Setup
```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx ts-node src/seed.ts
```

### 5. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
# From the root directory
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### Individual Services
```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

## 🎯 Usage

### Default Accounts
The seed script creates two default accounts:

**Admin Account:**
- Email: `admin@storeonline.com`
- Password: `admin123`
- Role: Admin (can manage products)

**Customer Account:**
- Email: `customer@storeonline.com`
- Password: `customer123`
- Role: Customer (can shop and place orders)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Products
- `GET /api/products` - Get all products (with pagination, search, filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/categories/list` - Get product categories

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

#### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/create` - Create order from cart
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

## 🏗️ Project Structure

```
store-online/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/     # Reusable components
│   │   ├── contexts/        # React contexts
│   │   └── lib/            # API utilities and helpers
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── package.json            # Root package.json with scripts
└── README.md
```

## 🔧 Development Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend
- `npm run start` - Start both frontend and backend in production mode
- `npm run install:all` - Install dependencies for all packages

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Backend Deployment
1. Build the backend: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Update API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with filters
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode theme

---

**Happy Shopping! 🛒**
