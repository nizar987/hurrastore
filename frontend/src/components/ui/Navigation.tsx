import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface NavigationProps {
  cartCount?: number;
  user?: {
    firstName: string;
    lastName: string;
  } | null;
  categories?: string[];
}

const Navigation: React.FC<NavigationProps> = ({
  cartCount = 0,
  user,
  categories = [],
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleCategorySelect = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              StoreOnline
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white text-sm"
                />
              </div>
            </form>
          </div>

          {/* Desktop Category Dropdown */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              <span className="font-medium text-gray-700 text-sm">Categories</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isCategoryDropdownOpen && "rotate-180")} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="py-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-2">
            {/* Wishlist Icon */}
            <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-red-500 transition-all duration-300 hover:bg-red-50 rounded-lg group">
              <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </Link>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-lg group">
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
            </button>

            {/* Cart Icon */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-lg group">
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3 ml-3">
                <Link href="/orders" className="p-2 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-lg group">
                  <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </Link>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-3">
                <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm">
                  Login
                </Link>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">
                  <Link href="/register">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-6 bg-gradient-to-b from-white to-gray-50">
            <div className="space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>

              {/* Mobile Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="text-left px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                  >
                    All Categories
                  </button>
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className="text-left px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile User Actions */}
              {!user && (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <Link href="/login" className="w-full text-center px-4 py-3 text-gray-600 hover:text-blue-600 font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
