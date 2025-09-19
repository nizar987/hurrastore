# Store Online - Backend API

A comprehensive ecommerce REST API built with Node.js, Express, TypeScript, and Prisma.

## 🚀 Features

### Authentication & Authorization
- User registration with comprehensive validation
- JWT-based authentication
- Role-based access control (Admin, Customer, Moderator)
- Password hashing with bcrypt
- Account deactivation support

### User Management
- Enhanced user profiles with ecommerce fields:
  - Phone number with international validation
  - Date of birth with age verification (18+)
  - Gender selection (inclusive options)
  - Marketing email preferences
  - Activity tracking (last login)

### Product Management
- CRUD operations for products
- Advanced filtering and sorting
- Pagination with metadata
- Product categories and brands
- Multi-image support
- Inventory management
- Featured/Bestseller/New Arrival flags
- SEO-friendly fields (meta title/description)
- Product reviews and ratings
- Bulk operations for admin

### API Endpoints

#### Authentication Routes (`/api/auth`)
```
POST /register     - Register new user
POST /login        - User login
GET  /me          - Get current user profile
```

#### Product Routes (`/api/products`)
```
GET    /                  - Get all products (with filtering)
GET    /:id              - Get single product
POST   /                 - Create product (Admin only)
PUT    /:id              - Update product (Admin only)
DELETE /:id              - Delete product (Admin only)

GET    /featured         - Get featured products
GET    /bestsellers      - Get bestseller products
GET    /new-arrivals     - Get new arrival products
GET    /low-stock        - Get low stock products (Admin only)
GET    /stats            - Get product statistics (Admin only)
GET    /categories/list  - Get categories and brands
PATCH  /bulk            - Bulk update products (Admin only)
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL database
- npm or yarn package manager

### Installation Steps

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   - Set your MySQL database URL
   - Generate a secure JWT secret
   - Configure other optional settings

4. **Database setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # (Optional) View database with Prisma Studio
   npm run prisma:studio
   ```

5. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production build and start
   npm run build
   npm start
   ```

The server will be running on `http://localhost:5001`

## 📚 API Usage Examples

### User Registration
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "marketingEmails": true,
  "agreeToTerms": true
}
```

### User Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

### Get Products with Filtering
```javascript
GET /api/products?page=1&limit=12&category=electronics&minPrice=100&maxPrice=1000&sortBy=price&sortOrder=asc&featured=true&inStock=true
```

### Create Product (Admin only)
```javascript
POST /api/products
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Premium Headphones",
  "description": "High-quality wireless headphones",
  "price": 299.99,
  "originalPrice": 399.99,
  "category": "Electronics",
  "subcategory": "Audio",
  "brand": "TechBrand",
  "sku": "TB-HP001",
  "stock": 50,
  "minStock": 10,
  "image": "https://example.com/headphones.jpg",
  "images": [
    "https://example.com/headphones1.jpg",
    "https://example.com/headphones2.jpg"
  ],
  "weight": 0.3,
  "dimensions": "20x18x8 cm",
  "tags": ["wireless", "bluetooth", "premium"],
  "isFeatured": true,
  "isBestSeller": false,
  "isNewArrival": true,
  "metaTitle": "Premium Wireless Headphones - TechBrand",
  "metaDescription": "Experience premium sound quality with our wireless headphones."
}
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options including:
- Database connection
- JWT configuration
- CORS settings
- Optional integrations (email, payment, cloud storage)

### Database Schema
The API uses Prisma ORM with the following main models:
- **User** - User accounts with ecommerce fields
- **Product** - Product catalog with advanced features
- **Order** - Order management with detailed tracking
- **CartItem** - Shopping cart functionality
- **ProductReview** - Product reviews and ratings

### Security Features
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- Rate limiting capabilities
- Input validation with express-validator
- Password hashing with bcrypt
- JWT token-based authentication

## 📊 Advanced Features

### Product Filtering & Sorting
- Filter by category, brand, price range
- Sort by name, price, rating, popularity
- Search across name, description, brand, tags
- Filter by stock status, featured items
- Pagination with metadata

### Bulk Operations
- Bulk update multiple products
- Inventory management
- Category management

### Analytics & Reporting
- Product statistics dashboard
- Low stock alerts
- Category distribution analysis
- Sales performance tracking

## 🚦 Status Codes & Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation errors
- `401` - Unauthorized / Invalid credentials
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `500` - Internal server error

Error responses include detailed messages:
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🔄 Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure
```
src/
├── index.ts              # Main application entry
├── middleware/
│   └── auth.ts          # Authentication middleware
├── routes/
│   ├── auth.ts          # Authentication routes
│   ├── products.ts      # Product management routes
│   ├── cart.ts          # Shopping cart routes
│   └── orders.ts        # Order management routes
└── seed.ts              # Database seeding script

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migration files
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.
