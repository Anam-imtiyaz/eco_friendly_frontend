import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Edit, Trash2, Eye, AlertCircle } from 'lucide-react';

const MyListingsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/user/my-products');
      setProducts(response.data);
    } catch (error) {
      setError('Failed to load your products');
      console.error('Error fetching my products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeletingId(productId);
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(product => product._id !== productId));
    } catch (error) {
      setError('Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">Manage your product listings</p>
          </div>
          
          <Link
            to="/add-product"
            className="inline-flex justify-center items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="space-y-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="md:flex">
                {/* Product Image */}
                <div className="md:w-48 md:flex-shrink-0">
                  <div className="h-48 md:h-full bg-gray-100">
                    <img
                      src={product.images[0] || 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {product.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isAvailable ? 'Available' : 'Sold'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          {product.category}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{product.views || 0} views</span>
                        </div>
                        <span>{formatDate(product.createdAt)}</span>
                      </div>
                      
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {product.description}
                      </p>
                      
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    {/* <button
                      onClick={() => navigate(`/edit-product/${product._id}`)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-md transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button> */}
                    
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{deletingId === product._id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed yet</h3>
            <p className="text-gray-500 mb-6">
              Start selling by adding your first product to the marketplace!
            </p>
            <Link
              to="/add-product"
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Product</span>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      {products.length > 0 && (
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.filter(p => p.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => !p.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600">Sold</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;