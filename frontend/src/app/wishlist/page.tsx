'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Heart,
  ShoppingCart,
  X,
  Star,
  Sparkles,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  Eye,
  Share2,
  ArrowLeft,
  TrendingUp,
  Package
} from 'lucide-react';
import Navigation from '@/components/ui/Navigation';

// Mock product type - adjust according to your actual product structure
type WishlistProduct = {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  addedAt: string; // ISO date string
};

// Mock data - replace with actual API calls
const mockWishlistItems: WishlistProduct[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
    stock: 15,
    rating: 4.8,
    reviews: 124,
    addedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Clothing',
    stock: 8,
    rating: 4.5,
    reviews: 89,
    addedAt: '2024-01-10T14:22:00Z'
  },
  {
    id: '3',
    name: 'Smart Fitness Watch',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
    stock: 0,
    rating: 4.7,
    reviews: 256,
    addedAt: '2024-01-08T09:15:00Z'
  },
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    category: 'Home & Kitchen',
    stock: 12,
    rating: 4.6,
    reviews: 67,
    addedAt: '2024-01-05T16:45:00Z'
  }
];

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high' | 'name'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setWishlistItems(mockWishlistItems);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (productId: string) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    // Add to cart logic here
    toast.success('Added to cart!');
  };

  const handleClearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    }
  };

  const sortedItems = [...wishlistItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const filteredItems = selectedCategory 
    ? sortedItems.filter(item => item.category === selectedCategory)
    : sortedItems;

  const categories = [...new Set(wishlistItems.map(item => item.category))];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation cartCount={0} user={null} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/20">
              <Heart className="h-12 w-12 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Sign in to view your wishlist
            </h2>
            <p className="text-gray-600 mb-8">Create an account or sign in to save your favorite items</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation cartCount={0} user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 mb-4"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-64 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-48 rounded-xl mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-4 rounded-lg"></div>
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-4 rounded-lg w-3/4"></div>
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-6 rounded-lg w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation cartCount={0} user={user} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/20">
              <Heart className="h-16 w-16 text-red-400" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 mb-10 text-lg">
              Start adding items you love to your wishlist and never lose track of them
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Package className="h-5 w-5" />
                Browse Products
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 rounded-full px-4 py-2 mb-3">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">My Favorites</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-gray-600 mt-2">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300"
            >
              Clear All
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Product Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : 'w-full h-48'} overflow-hidden`}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Link href={`/products/${item.id}`}>
                      <button className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110">
                        <Eye className="h-4 w-4 text-blue-600" />
                      </button>
                    </Link>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-110">
                      <Share2 className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-all duration-300"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Stock Badge */}
                {item.stock === 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="mb-3">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm mt-1">{item.category}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">{item.rating} ({item.reviews} reviews)</span>
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${item.price}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    item.stock > 10 
                      ? 'bg-green-100 text-green-700' 
                      : item.stock > 0 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {item.stock > 10 ? 'In Stock' : item.stock > 0 ? `${item.stock} left` : 'Out of Stock'}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item.id)}
                  disabled={item.stock === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default WishlistPage;
