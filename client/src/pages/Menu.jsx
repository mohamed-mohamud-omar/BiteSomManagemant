import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, SlidersHorizontal, Star, Heart, ShoppingCart, Plus, Check } from 'lucide-react';
import api from '../services/api.js';
import { addToCart } from '../features/cartSlice.js';
import { addToWishlist, removeFromWishlist } from '../features/wishlistSlice.js';
import { FoodCardSkeleton } from '../components/Skeleton.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useLanguage();

  // Wishlist items selector to show active hearts
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync category or search from URL parameters
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setSelectedCategory(urlCategory);
    
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearchVal(urlSearch);
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Foods on Filter changes
  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 8,
          search: searchVal,
          category: selectedCategory,
          minPrice,
          maxPrice,
          minRating,
          sortBy
        };

        const res = await api.get('/foods', { params });
        setFoods(res.data.foods);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error('Error fetching foods:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [searchVal, selectedCategory, minPrice, maxPrice, minRating, sortBy, page]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSearchParams({ category: catId });
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('newest');
    setSearchParams({});
    setPage(1);
  };

  const isItemInWishlist = (foodId) => {
    return wishlistItems.some((item) => item.foodId === foodId);
  };

  const handleWishlistToggle = (food) => {
    if (isItemInWishlist(food._id)) {
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

  const handleAddToCart = (food) => {
    dispatch(addToCart({
      foodId: food._id,
      name: food.name,
      price: food.price,
      image: food.image,
      discountPercentage: food.discountPercentage,
      restaurantId: food.restaurant._id
    }));
  };

  const isItemInCart = (foodId) => {
    return cartItems.some((item) => item.foodId === foodId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 1. FILTER SIDEBAR */}
        <aside className="w-full md:w-64 glass-card p-6 flex flex-col gap-6 md:sticky md:top-20 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/40">
            <span className="flex items-center gap-2 font-black text-lg">
              <SlidersHorizontal className="w-4 h-4 text-brand" /> Filter Menu
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-2xs font-extrabold text-brand hover:underline uppercase tracking-wide"
            >
              Reset
            </button>
          </div>

          {/* Search bar inside filter */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Search</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Dishes, desserts..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Categories select options */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Categories</label>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-2">
              <button
                onClick={() => handleCategorySelect('')}
                className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  selectedCategory === '' 
                    ? 'bg-brand/10 text-brand' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat._id)}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                    selectedCategory === cat._id 
                      ? 'bg-brand/10 text-brand' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range selectors */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Price ($)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Rating filter options */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>

          {/* Sort selection */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none"
            >
              <option value="newest">Newest Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Average Rating</option>
            </select>
          </div>
        </aside>

        {/* 2. FOODS GRID PANEL */}
        <main className="flex-1 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <FoodCardSkeleton key={i} />
              ))}
            </div>
          ) : foods.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500 max-w-md mx-auto">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-1">No dishes found</h3>
              <p className="text-sm">Try resetting your filters or modifying your search terms.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-4 px-6 py-2 bg-brand text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {foods.map((food) => {
                  const hasDiscount = food.discountPercentage > 0;
                  const priceAfterDiscount = food.price * (1 - food.discountPercentage / 100);
                  const isWishlisted = isItemInWishlist(food._id);
                  const isInCart = isItemInCart(food._id);

                  return (
                    <div key={food._id} className="glass-card overflow-hidden group flex flex-col justify-between">
                      {/* Image section */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {/* Wishlist Heart Toggle */}
                        <button
                          onClick={() => handleWishlistToggle(food)}
                          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-full shadow-sm text-slate-600 hover:text-red-500 transition duration-150"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                        </button>
                        {/* Discount flag */}
                        {hasDiscount && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-rose-500 text-white text-2xs font-extrabold rounded-lg">
                            {food.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      {/* Info body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-3xs font-extrabold text-brand uppercase tracking-wider">
                              {food.category?.name}
                            </span>
                            <span className="flex items-center gap-0.5 text-2xs font-extrabold text-amber-500">
                              <Star className="w-3 h-3 fill-amber-500" /> {food.rating.toFixed(1)}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                            {food.name}
                          </h3>
                          <p className="text-slate-400 text-xs line-clamp-2">
                            {food.description}
                          </p>
                          <span className="block text-4xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">
                            By {food.restaurant?.name}
                          </span>
                        </div>

                        {/* Price & Add button */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-baseline gap-1.5">
                            {hasDiscount ? (
                              <>
                                <span className="text-lg font-black text-slate-900 dark:text-white">${priceAfterDiscount.toFixed(2)}</span>
                                <span className="text-xs text-slate-400 line-through">${food.price.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-lg font-black text-slate-900 dark:text-white">${food.price.toFixed(2)}</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCart(food)}
                            className={`p-2 rounded-xl transition duration-150 flex items-center justify-center gap-1 ${
                              isInCart 
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                                : 'bg-brand text-white hover:bg-brand-700'
                            }`}
                            title="Add to Cart"
                          >
                            {isInCart ? <Check className="w-4.5 h-4.5" /> : <Plus className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. PAGINATION BUTTONS */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-sm font-bold text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Menu;
