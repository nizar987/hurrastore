import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface StickyCartProps {
  itemCount: number;
  total: number;
  onCheckout?: () => void;
  className?: string;
}

const StickyCart: React.FC<StickyCartProps> = ({
  itemCount,
  total,
  onCheckout,
  className,
}) => {
  if (itemCount === 0) return null;

  return (
    <div className={cn('sticky-bottom bg-white border-t border-neutral-200 shadow-lg', className)}>
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Cart Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
              <p className="text-lg font-bold text-primary-600">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link href="/cart">
              <Button variant="outline" size="sm">
                View Cart
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={onCheckout}
              className="flex items-center gap-2"
            >
              Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyCart;
