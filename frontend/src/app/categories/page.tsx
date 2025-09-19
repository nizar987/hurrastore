'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  Star,
  Package,
  Zap,
  Award,
  Grid3X3
} from 'lucide-react';
import Navigation from '@/components/ui/Navigation';
import { useAuth } from '@/contexts/AuthContext';

// Mock categories data - replace with actual API calls
const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets, smartphones, laptops, and tech accessories',
    itemCount: 1250,
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
    color: 'from-blue-500 to-blue-600',
    icon: '📱',
    trending: true
  },
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    description: 'Trendy outfits, shoes, accessories for men, women, and kids',
    itemCount: 2100,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    color: 'from-pink-500 to-rose-600',
    icon: '👕',
    trending: false
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    description: 'Furniture, appliances, decor, and kitchen essentials',
    itemCount: 890,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    color: 'from-green-500 to-emerald-600',
    icon: '🏠',
    trending: false
  },
  {
    id: 'beauty-health',
    name: 'Beauty & Health',
    description: 'Skincare, makeup, wellness products, and health supplements',
    itemCount: 650,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    color: 'from-purple-500 to-violet-600',
    icon: '💄',
    trending: true
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    description: 'Workout gear, sports equipment, and fitness accessories',
    itemCount: 420,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    color: 'from-orange-500 to-red-600',
    icon: '⚽',
    trending: false
  },
  {
    id: 'books-media',
    name: 'Books & Media',
    description: 'Books, magazines, movies, music, and educational content',
    itemCount: 780,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    color: 'from-indigo-500 to-blue-600',
    icon: '📚',
    trending: false
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Car accessories, parts, tools, and maintenance products',
    itemCount: 320,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',
    color: 'from-gray-500 to-slate-600',
    icon: '🚗',
    trending: false
  },
  {
    id: 'toys-games',
    name: 'Toys & Games',
    description: 'Fun toys, board games, puzzles, and entertainment for all ages',
    itemCount: 560,
    image: 'https://images.unsplash.com/photo-1558877385-99d2b1b06de3?w=400&h=300&fit=crop',
    color: 'from-yellow-500 to-orange-600',
    icon: '🎮',
    trending: true
  }
];

const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const trendingCategories = categories.filter(cat => cat.trending);
  const totalProducts = categories.reduce((sum, cat) => sum + cat.itemCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation cartCount={0} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-4">
            <Grid3X3 className="h-4 w-4" />
            <span className="text-sm font-medium">Explore Our Collection</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Shop by Category
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our wide range of carefully curated products across {categories.length} categories with over {totalProducts.toLocaleString()} items
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{totalProducts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{trendingCategories.length}</div>
              <div className="text-sm text-gray-600">Trending</div>
            </div>
          </div>
        </div>

        {/* Trending Categories */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group block"
              >
                <div 
                  className="relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Background Image */}
                  <div className="relative h-64">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl">{category.icon}</span>
                      <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-300 font-semibold">
                        {category.itemCount.toLocaleString()} items
                      </span>
                      <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Categories */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Package className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              All Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group block"
              >
                <div 
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    
                    {/* Icon */}
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                    </div>

                    {/* Trending Badge */}
                    {category.trending && (
                      <div className="absolute top-4 right-4">
                        <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Hot
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-700">
                          {category.itemCount.toLocaleString()} items
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                        Browse
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Award className="h-5 w-5" />
                <span className="font-medium">Premium Quality</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Contact our expert team for personalized recommendations and special orders
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/contact">
                  <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
                    Contact Us
                  </button>
                </Link>
                <Link href="/products">
                  <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 border border-white/20">
                    View All Products
                  </button>
                </Link>
              </div>
            </div>
          </div>
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

export default CategoriesPage;
