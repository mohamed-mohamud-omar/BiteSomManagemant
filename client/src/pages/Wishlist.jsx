import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../features/wishlistSlice.js';
import { addToCart } from '../features/cartSlice.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const handleMoveToCart = (item) => {
    dispatch(addToCart({
      foodId: item.foodId,
      name: item.name,
      price: item.price,
      image: item.image,
      discountPercentage: item.discountPercentage,
      restaurantId: item.restaurantId
    }));
    dispatch(removeFromWishlist(item.foodId));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black">Your Wishlist is Empty</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Save your favorite dishes while browsing our menus so you can quickly find them later.
        </p>
        <Link 
          to="/menu" 
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-brand text-white font-bold rounded-xl shadow-md hover:bg-brand-700 transition text-sm"
        >
          <span>Explore Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black mb-8 tracking-tight">{t('wishlist')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => {
          const hasDiscount = item.discountPercentage > 0;
          const priceAfterDiscount = item.price * (1 - item.discountPercentage / 100);

          return (
            <div key={item.foodId} className="glass-card overflow-hidden group flex flex-col justify-between">
              {/* Image */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                />
                <button
                  onClick={() => dispatch(removeFromWishlist(item.foodId))}
                  className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-full shadow-sm text-rose-500 hover:bg-white transition"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base leading-snug">{item.name}</h3>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    {hasDiscount ? (
                      <>
                        <span className="text-sm font-black">${priceAfterDiscount.toFixed(2)}</span>
                        <span className="text-xs text-slate-400 line-through">${item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-black">${item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full py-2.5 bg-brand text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow hover:bg-brand-700 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
