import React from 'react';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    category: string;
    stock: number;
  };
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist,
  variant = 'default',
  className,
}) => {
  const isOutOfStock = product.stock === 0;

  const variants = {
    default: 'bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group',
    compact: 'bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group h-32',
    featured: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-transparent hover:border-blue-200',
  };

  return (
    <div className={cn(variants[variant], className)}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-lg">No Image</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {onAddToWishlist && (
            <button
              onClick={() => onAddToWishlist(product.id)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-all duration-300 transform hover:scale-110"
            >
              <Heart className="h-4 w-4" />
            </button>
          )}
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-blue-50 hover:text-blue-500 transition-all duration-300 transform hover:scale-110">
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-semibold bg-red-500 px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Quick Add Button (appears on hover) */}
        {onAddToCart && !isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={() => onAddToCart(product.id)}
              className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-lg">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.description || 'No description available'}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2 font-medium">4.8</span>
          <span className="text-sm text-gray-500 ml-1">(128 reviews)</span>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ${product.price}
            </span>
            {product.price > 50 && (
              <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                Save 10%
              </span>
            )}
          </div>
          <span className={cn(
            'text-sm font-medium px-2 py-1 rounded-full',
            product.stock > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          )}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
          </span>
        </div>

        {/* Add to Cart Button */}
        {onAddToCart && (
          <Button
            onClick={() => onAddToCart(product.id)}
            disabled={isOutOfStock}
            className={cn(
              "w-full transition-all duration-300",
              isOutOfStock 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            )}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
