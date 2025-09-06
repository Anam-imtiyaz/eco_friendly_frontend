import React from 'react';
import { Leaf } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <div className="bg-green-600 p-3 rounded-full">
            <Leaf className="h-8 w-8 text-white" />
          </div>
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;