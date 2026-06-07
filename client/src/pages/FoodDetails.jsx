import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, ShoppingCart, Heart, Send, ShieldAlert, ArrowLeft, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api.js';
import { addToCart } from '../features/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../features/wishlistSlice.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const FoodDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');
  
  // Add Review Form hook
  const { register, handleSubmit, reset } = useForm();

  const fetchFoodDetails = async () => {
    try {
      const res = await api.get(`/foods/${id}`);
      setFood(res.data.food);

      // Get reviews
      const revRes = await api.get(`/reviews/food/${id}`);
      setReviews(revRes.data.reviews);
    } catch (err) {
      console.error('Error fetching food details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
    dispatch(addToCart({
      foodId: food._id,
      name: food.name,
      price: food.price,
      image: food.image,
      discountPercentage: food.discountPercentage,
      restaurantId: food.restaurant._id
    }));
  };

  const isItemInWishlist = () => {
    return food && wishlistItems.some((item) => item.foodId === food._id);
  };

  const handleWishlistToggle = () => {
    if (!food) return;
    if (isItemInWishlist()) {
      dispatch(removeFromWishlist(food._id));
    } else {
      dispatch(addToWishlist({
        foodId: food._id,
        name: food.name,
        price: food.price,
        image: food.image,
        discountPercentage: food.discountPercentage,
        restaurantId: food.restaurant._id
      }));
    }
  };

  const handleReviewSubmit = async (data) => {
    setReviewError('');
    try {
      await api.post('/reviews', {
        foodId: food._id,
        restaurantId: food.restaurant._id,
        rating: data.rating,
        comment: data.comment
      });
      reset();
      fetchFoodDetails(); // reload food rating and reviews
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500">
        <Clock className="w-8 h-8 animate-spin mx-auto text-brand mb-4" />
        <span>Loading food details...</span>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto py-16 text-center text-slate-500 space-y-4">
        <h1 className="text-xl font-bold">Food item not found.</h1>
        <button onClick={() => navigate('/menu')} className="px-6 py-2 bg-brand text-white rounded-xl text-xs">Return to Menu</button>
      </div>
    );
  }

  const hasDiscount = food.discountPercentage > 0;
  const priceAfterDiscount = food.price * (1 - food.discountPercentage / 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back button */}
      <button 
        onClick={() => navigate('/menu')}
        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Menu
      </button>

      {/* Main Details Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Food Image */}
        <div className="relative rounded-3xl overflow-hidden shadow-md max-h-[380px] bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30">
          <img
            src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          {hasDiscount && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow">
              {food.discountPercentage}% Qiimo Dhimis!
            </span>
          )}
        </div>

        {/* Food Info */}
        <div className="space-y-6 text-left">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-brand uppercase tracking-widest">{food.category?.name}</span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">{food.name}</h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" /> {food.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">({food.numReviews} Customer reviews)</span>
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
            {food.description}
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-xs text-slate-500">
            <span className="block font-bold">Kitchen merchant:</span>
            <span className="block text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5">{food.restaurant?.name}</span>
            <span className="block mt-0.5">{food.restaurant?.address}</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 pb-2">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-black text-slate-900 dark:text-white">${priceAfterDiscount.toFixed(2)}</span>
                <span className="text-sm text-slate-400 line-through">${food.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-3xl font-black text-slate-900 dark:text-white">${food.price.toFixed(2)}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-6 bg-brand text-white font-bold rounded-2xl hover:bg-brand-700 transition flex items-center justify-center gap-2 shadow-lg shadow-brand/10"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleWishlistToggle}
              className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 hover:text-rose-500 dark:hover:bg-slate-900 transition"
              title="Save to favorites"
            >
              <Heart className={`w-5 h-5 ${isItemInWishlist() ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Reviews & Feedback Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        
        {/* Left Side: Add Review form (Only for logged-in Customers) */}
        <div className="glass-card p-6 h-fit text-left space-y-4">
          <h3 className="font-bold text-lg">Leave a Review</h3>
          {user?.role === 'customer' ? (
            <form onSubmit={handleSubmit(handleReviewSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rating Stars</label>
                <select
                  required
                  {...register('rating')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star (Terrible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Comment</label>
                <textarea
                  required
                  rows={3}
                  {...register('comment')}
                  placeholder="How did the food taste? Was it delivered fresh?"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
                ></textarea>
              </div>

              {reviewError && (
                <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold leading-snug">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-brand text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 hover:bg-brand-700 transition shadow"
              >
                <Send className="w-3.5 h-3.5" /> Submit Review
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Only registered customers who ordered this item can submit reviews.
            </p>
          )}
        </div>

        {/* Right Side: Reviews lists */}
        <div className="md:col-span-2 space-y-6 text-left">
          <h3 className="font-bold text-lg">Customer Reviews ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <p className="text-slate-500 text-sm">No reviews posted yet. Be the first to leave a review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="glass-card p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{rev.customer?.fullName}</span>
                    <span className="flex items-center gap-0.5 text-2xs font-extrabold text-amber-500">
                      {Array(rev.rating).fill(0).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{rev.comment}</p>
                  <span className="block text-4xs text-slate-400 font-semibold uppercase">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
};

export default FoodDetails;
