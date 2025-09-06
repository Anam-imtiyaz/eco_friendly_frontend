import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ShoppingCart, Trash2, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      setError('Failed to load cart');
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdatingItem(productId);
      const response = await api.put(`/cart/update/${productId}`, {
        quantity: newQuantity
      });
      setCart(response.data.cart);
    } catch (error) {
      setError('Failed to update item quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdatingItem(productId);
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data.cart);
    } catch (error) {
      setError('Failed to remove item');
    } finally {
      setUpdatingItem(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      const response = await api.delete('/cart/clear');
      setCart(response.data.cart);
    } catch (error) {
      setError('Failed to clear cart');
    }
  };

  const checkout = async () => {
    try {
      setCheckingOut(true);
      setError('');
      
      const orderData = {
        shippingAddress: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        paymentMethod: 'cash_on_delivery'
      };

      await api.post('/orders/create', orderData);
      setOrderSuccess(true);
      setCart({ ...cart, items: [] });
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-gray-600 mt-2">Review your selected items</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orderSuccess && (
        <div className="mb-6 flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>Order placed successfully! Redirecting to order history...</span>
        </div>
      )}

      {cart && cart.items && cart.items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Cart Items ({cart.items.length})
              </h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {cart.items.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0] || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      by {item.product.seller?.username}
                    </p>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {item.product.category}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(item.product.price)}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          disabled={updatingItem === item.product._id || item.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          disabled={updatingItem === item.product._id}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.product._id)}
                        disabled={updatingItem === item.product._id}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({cart.items.length})</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <button
                onClick={checkout}
                disabled={checkingOut || orderSuccess}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {checkingOut ? 'Processing...' : orderSuccess ? 'Order Placed!' : 'Checkout'}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Payment: Cash on Delivery</p>
                <p>Free shipping on all orders</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">
              Start shopping to add items to your cart
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;