import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Heart, Bell, Package } from 'lucide-react';
import Button from './Button';
import NotificationDropdown, { NotificationItem } from './NotificationDropdown';

interface NavigationProps {
  cartCount?: number;
  user?: {
    firstName: string;
    lastName: string;
  } | null;
}

// Mock notification data - replace with actual API calls or context
const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Order Shipped',
    message: 'Your order #12345 has been shipped and is on the way.',
    time: '2h ago',
    read: false,
    type: 'order'
  },
  {
    id: 'n2',
    title: 'Limited Offer!',
    message: 'Get 20% off on selected items this weekend only.',
    time: '5h ago',
    read: false,
    type: 'promo'
  },
  {
    id: 'n3',
    title: 'Review Reminder',
    message: 'Don\'t forget to review your recent purchase.',
    time: '1d ago',
    read: true,
    type: 'review'
  }
];

const Navigation: React.FC<NavigationProps> = ({
  cartCount = 0,
  user,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg">
              <Package className="text-white h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                StoreOnline
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Premium Shopping
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/products" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              All Products
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-blue-50"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Action Icons */}
            <div className="flex items-center space-x-1">
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="relative p-3 text-gray-600 hover:text-red-500 transition-all duration-300 hover:bg-red-50 rounded-xl group">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-xl group"
                >
                  <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-bold shadow-lg">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <NotificationDropdown
                    notifications={notifications}
                    onMarkAllRead={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }}
                  />
                )}
              </div>

              {/* Cart Icon */}
              <Link href="/cart" className="relative p-3 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-xl group">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-3 ml-3">
                <Link href="/orders" className="p-3 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-xl group">
                  <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </Link>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.firstName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    Hi, {user.firstName}!
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-3">
                <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 rounded-lg hover:bg-blue-50">
                  Login
                </Link>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/register">
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 text-gray-600 hover:text-blue-500 transition-all duration-300 hover:bg-blue-50 rounded-xl ml-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-md">
            <div className="space-y-3">
              {/* Mobile Navigation Links */}
              <div className="grid grid-cols-1 gap-2">
                <Link 
                  href="/products" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  All Products
                </Link>
                <Link 
                  href="/categories" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link 
                  href="/about" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* Mobile User Actions */}
              {!user && (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <Link 
                    href="/login" 
                    className="w-full text-center px-4 py-3 text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 rounded-xl hover:bg-blue-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
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
