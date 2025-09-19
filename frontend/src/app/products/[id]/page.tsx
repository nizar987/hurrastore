'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Share2,
  CheckCircle,
  Clock,
  Package,
  Award,
  Sparkles,
  TrendingUp,
  Home,
  Users,
  MessageCircle,
  ThumbsUp,
  Facebook,
  Twitter,
  Copy
} from 'lucide-react';
import { productsAPI, Product } from '@/lib/products';
import { cartAPI } from '@/lib/cart';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Navigation from '@/components/ui/Navigation';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductDetail() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getProduct(id);
      setProduct(response);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await productsAPI.getProducts({ 
        category: product?.category,
        limit: 5
      });
      // Filter out the current product
      const filteredProducts = response.products.filter(p => p.id !== id);
      setRelatedProducts(filteredProducts.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await cartAPI.addToCart({ productId: id, quantity });
      toast.success('Product added to cart!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    // Redirect to checkout
    window.location.href = '/checkout';
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const images = product?.image ? [product.image] : [];
  const discountPercentage = product && product.price > 50 ? 10 : 0;
  const discountedPrice = product ? product.price * (1 - discountPercentage / 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation cartCount={0} user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="aspect-square bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                <div className="flex space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                  <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
                  <div className="flex gap-4">
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation cartCount={0} user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Back to Products
                </Button>
              </Link>
              <Link href="/">
                <Button className="border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation cartCount={0} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-blue-600 transition-colors">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-blue-600 font-medium">{product.category}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative aspect-square bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden group border border-white/20">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className={`object-cover transition-transform duration-500 cursor-zoom-in ${
                    isZoomed ? 'scale-150' : 'group-hover:scale-110'
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <span className="text-gray-500 text-lg font-medium">No Image Available</span>
                  </div>
                </div>
              )}
              
              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                <ZoomIn className="h-5 w-5 text-gray-700" />
              </div>

              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  -{discountPercentage}% OFF
                </div>
              )}
              
              {/* Trending Badge */}
              {product.stock > 10 && (
                <div className="absolute top-4 right-20 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Hot
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                      selectedImage === index
                        ? 'border-blue-500 ring-4 ring-blue-200 shadow-lg'
                        : 'border-gray-200 hover:border-gray-400 shadow-md'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Product Title */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight">
                  {product.name}
                </h1>
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    isWishlisted 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-6">
                <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                  {product.category}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  product.stock > 10 
                    ? 'bg-green-100 text-green-700' 
                    : product.stock > 0 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock > 10 
                    ? '✓ In Stock' 
                    : product.stock > 0 
                      ? `⚡ Only ${product.stock} left` 
                      : '❌ Out of Stock'
                  }
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-xs font-medium">
                  SKU: {product.id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${discountedPrice.toFixed(2)}
                </span>
                {discountPercentage > 0 && (
                  <div className="flex flex-col">
                    <span className="text-xl text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 font-bold">
                      You save ${(product.price - discountedPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">Price includes all taxes • Free shipping on orders over $50</p>
            </div>

            {/* Ratings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`} />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">4.8</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600 font-medium">128 reviews</span>
                <span className="text-gray-600">•</span>
                <span className="text-blue-600 font-medium">248 sold</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">12 people viewing</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Product Description
              </h3>
              <p className="text-gray-700 leading-relaxed text-base">
                {product.description || 'This premium product offers exceptional quality and value. Carefully crafted with attention to detail, it provides excellent performance and durability for your everyday needs.'}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-gray-900">Quantity:</span>
                <span className="text-sm text-green-600 font-medium">
                  {product.stock} units available
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-l-xl"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="px-6 py-3 text-lg font-bold min-w-[4rem] text-center bg-blue-50 text-blue-700">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-r-xl"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="text-gray-700">
                  <span className="text-2xl font-bold">${(discountedPrice * quantity).toFixed(2)}</span>
                  <span className="text-sm text-gray-500 ml-1">total</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 py-4 text-lg font-bold rounded-2xl"
                >
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 py-4 text-lg font-bold rounded-2xl"
                >
                  ⚡ Buy Now
                </Button>
              </div>
              
              {product.stock <= 5 && product.stock > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-3 rounded-xl border border-orange-200">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Only {product.stock} left in stock - order soon!</span>
                </div>
              )}
            </div>

            {/* Additional Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isWishlisted 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span className="font-medium">{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="font-medium">Share</span>
                  </button>
                  
                  {showShareMenu && (
                    <div className="absolute top-12 left-0 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-10">
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Facebook className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors">
                          <Twitter className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <Copy className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span>Questions? Ask us</span>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Why Choose This Product?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Free Shipping</h4>
                    <p className="text-xs text-gray-600">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Secure Payment</h4>
                    <p className="text-xs text-gray-600">100% protected</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <RotateCcw className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Easy Returns</h4>
                    <p className="text-xs text-gray-600">30-day guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-6">
              {[
                { id: 'details', label: 'Product Details', icon: Package },
                { id: 'reviews', label: 'Reviews', icon: Star },
                { id: 'shipping', label: 'Shipping Info', icon: Truck }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            {activeTab === 'details' && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Product Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Category</span>
                      <span className="font-semibold text-gray-900">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Stock</span>
                      <span className="font-semibold text-gray-900">{product.stock} units</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Price</span>
                      <span className="font-semibold text-gray-900">${product.price}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">SKU</span>
                      <span className="font-semibold text-gray-900">SKU-{product.id.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Availability</span>
                      <span className="font-semibold text-green-600">In Stock</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Warranty</span>
                      <span className="font-semibold text-gray-900">1 Year</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">4.8 out of 5</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            U{review}
                          </div>
                          <span className="font-medium text-gray-900">User {review}</span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Great product! Exactly as described. Fast shipping and excellent quality. 
                        Would definitely recommend to others.
                      </p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {review} day{review > 1 ? 's' : ''} ago
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-6 text-gray-900">Shipping Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Truck className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Free Shipping</h4>
                        <p className="text-sm text-gray-600">Free shipping on orders over $50</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Delivery Time</h4>
                        <p className="text-sm text-gray-600">2-3 business days</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-purple-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Secure Packaging</h4>
                        <p className="text-sm text-gray-600">Items are carefully packaged</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900">Tracking</h4>
                        <p className="text-sm text-gray-600">Real-time tracking available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Related Products</h2>
              <Link href="/products">
                <Button variant="outline" className="shadow-sm hover:shadow-md">
                  View All Products
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={() => toast.success('Added to wishlist!')}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
