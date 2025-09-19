import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().trim(),
  query('subcategory').optional().trim(),
  query('brand').optional().trim(),
  query('search').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt', 'rating', 'popularity']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('featured').optional().isBoolean(),
  query('bestseller').optional().isBoolean(),
  query('newArrival').optional().isBoolean(),
  query('inStock').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string;
    const subcategory = req.query.subcategory as string;
    const brand = req.query.brand as string;
    const search = req.query.search as string;
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const featured = req.query.featured === 'true';
    const bestseller = req.query.bestseller === 'true';
    const newArrival = req.query.newArrival === 'true';
    const inStock = req.query.inStock === 'true';
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (subcategory) {
      where.subcategory = { contains: subcategory, mode: 'insensitive' };
    }

    if (brand) {
      where.brand = { contains: brand, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } }
        // Note: JSON search for tags can be added with raw queries if needed
      ];
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      where.price = {};
      if (!isNaN(minPrice)) where.price.gte = minPrice;
      if (!isNaN(maxPrice)) where.price.lte = maxPrice;
    }

    if (featured) where.isFeatured = true;
    if (bestseller) where.isBestSeller = true;
    if (newArrival) where.isNewArrival = true;
    if (inStock) where.stock = { gt: 0 };

    // Build sort object
    let orderBy: any = {};
    switch (sortBy) {
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'rating':
        orderBy.rating = sortOrder;
        break;
      case 'popularity':
        orderBy.reviewCount = sortOrder;
        break;
      default:
        orderBy.createdAt = sortOrder;
    }

    const [products, total, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { isActive: true }
      }),
      prisma.product.findMany({
        select: { brand: true },
        distinct: ['brand'],
        where: { isActive: true, brand: { not: null } }
      })
    ]);

    // Add computed fields
    const enhancedProducts = products.map(product => ({
      ...product,
      reviewCount: product._count?.reviews || 0,
      isOnSale: product.originalPrice && product.originalPrice > product.price,
      discountPercent: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
    }));

    res.json({
      products: enhancedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        categories: categories.map(c => c.category),
        brands: brands.map(b => b.brand).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create product (Admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().notEmpty().isLength({ min: 2, max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('price').isFloat({ min: 0.01 }),
  body('originalPrice').optional().isFloat({ min: 0.01 }),
  body('category').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('subcategory').optional().trim().isLength({ max: 100 }),
  body('brand').optional().trim().isLength({ max: 100 }),
  body('sku').optional().trim().isLength({ max: 50 }),
  body('stock').isInt({ min: 0 }),
  body('minStock').optional().isInt({ min: 0 }),
  body('image').optional().trim().isURL(),
  body('images').optional().isArray(),
  body('images.*').optional().isURL(),
  body('weight').optional().isFloat({ min: 0 }),
  body('dimensions').optional().trim(),
  body('tags').optional().isArray(),
  body('tags.*').optional().trim(),
  body('isFeatured').optional().isBoolean(),
  body('isBestSeller').optional().isBoolean(),
  body('isNewArrival').optional().isBoolean(),
  body('metaTitle').optional().trim().isLength({ max: 160 }),
  body('metaDescription').optional().trim().isLength({ max: 320 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      sku,
      stock,
      minStock,
      image,
      images,
      weight,
      dimensions,
      tags,
      isFeatured,
      isBestSeller,
      isNewArrival,
      metaTitle,
      metaDescription
    } = req.body;

    // Check if SKU already exists
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      });
      if (existingSku) {
        return res.status(400).json({ message: 'SKU already exists' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        category,
        subcategory,
        brand,
        sku,
        stock,
        minStock: minStock || 5,
        image,
        images: images ? images : null,
        weight,
        dimensions,
        tags: tags ? tags : null,
        isFeatured: isFeatured || false,
        isBestSeller: isBestSeller || false,
        isNewArrival: isNewArrival || true,
        metaTitle,
        metaDescription
      }
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim().notEmpty(),
  body('stock').optional().isInt({ min: 0 }),
  body('image').optional().trim(),
  body('isActive').optional().isBoolean()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const updateData = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });

    const enhancedProducts = products.map(product => ({
      ...product,
      reviewCount: product._count?.reviews || 0,
      isOnSale: product.originalPrice && product.originalPrice > product.price,
      discountPercent: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
    }));

    res.json({ products: enhancedProducts });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get bestseller products
router.get('/bestsellers', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isBestSeller: true
      },
      take: 8,
      orderBy: { reviewCount: 'desc' },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });

    const enhancedProducts = products.map(product => ({
      ...product,
      reviewCount: product._count?.reviews || 0,
      isOnSale: product.originalPrice && product.originalPrice > product.price,
      discountPercent: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
    }));

    res.json({ products: enhancedProducts });
  } catch (error) {
    console.error('Get bestseller products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get new arrival products
router.get('/new-arrivals', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isNewArrival: true
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });

    const enhancedProducts = products.map(product => ({
      ...product,
      reviewCount: product._count?.reviews || 0,
      isOnSale: product.originalPrice && product.originalPrice > product.price,
      discountPercent: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
    }));

    res.json({ products: enhancedProducts });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get low stock products (Admin only)
router.get('/low-stock', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    // Get products where stock is less than or equal to their minStock value
    const products = await prisma.$queryRaw`
      SELECT * FROM products 
      WHERE isActive = true 
      AND stock <= minStock 
      ORDER BY stock ASC
    `;

    res.json({ products });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk update products (Admin only)
router.patch('/bulk', authenticateToken, requireAdmin, [
  body('productIds').isArray({ min: 1 }),
  body('productIds.*').isString(),
  body('updates').isObject()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productIds, updates } = req.body;

    const result = await prisma.product.updateMany({
      where: {
        id: {
          in: productIds
        }
      },
      data: updates
    });

    res.json({
      message: `${result.count} products updated successfully`,
      count: result.count
    });
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get product statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [totalProducts, activeProducts, featuredProducts, lowStockProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isFeatured: true, isActive: true } }),
      prisma.product.count({ 
        where: { 
          isActive: true,
          stock: { lte: 5 }
        }
      })
    ]);

    const categoryCounts = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { category: true }
    });

    res.json({
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      featuredProducts,
      lowStockProducts,
      categories: categoryCounts.map(item => ({
        category: item.category,
        count: item._count.category
      }))
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get product categories
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true, subcategory: true },
      distinct: ['category'],
      where: { isActive: true }
    });

    const brands = await prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand'],
      where: { isActive: true, brand: { not: null } }
    });

    res.json({
      categories: categories.map((c: any) => c.category),
      brands: brands.map((b: any) => b.brand).filter(Boolean)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
