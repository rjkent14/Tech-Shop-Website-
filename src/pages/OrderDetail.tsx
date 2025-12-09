import React, { useEffect } from "react";
import { X } from "lucide-react";

// Define the type locally
export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
  description?: string;
  category?: string;
  sku?: string;
}

interface OrderProductDetailProps {
  item: OrderItem;
  onClose: () => void;
}

const OrderProductDetail: React.FC<OrderProductDetailProps> = ({ item, onClose }) => {
  const subtotal = item.price * item.quantity;
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
<div className="fixed inset-0 bg-gray-100 z-[9999] overflow-y-auto">      {/* Header - Fixed */}
      <div className="sticky top-0 bg-white border-b shadow-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Product Details</h1>
              <p className="text-gray-600 mt-1">Complete information about your ordered product</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              {/* Product Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 border-b">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-full md:w-40 h-40 bg-white rounded-xl shadow-md border overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                          {item.category || "General Product"}
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{item.name}</h2>
                        <p className="text-gray-600 mb-4">
                          {item.description || "This high-quality tech product is carefully designed for excellent performance and reliability. Ideal for everyday use, work,entertainment, and productivity."}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl md:text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">per unit</div>
                      </div>
                    </div>
                    {item.sku && (
                      <div className="text-sm text-gray-500 mt-4">
                        SKU: <span className="font-mono">{item.sku}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
                {/* Left Column - Order Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Order Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Product ID</span>
                        <span className="font-semibold text-gray-900">#{item.product_id}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Quantity Ordered</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-xl">{item.quantity}</span>
                          <span className="text-gray-500">units</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Unit Price</span>
                        <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Price Calculation</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal ({item.quantity} × ${item.price.toFixed(2)})</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tax (8%)</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-t border-b border-gray-200">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Order Summary</h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-blue-900">Order Status: Confirmed</span>
                      </div>
                      <p className="text-blue-800 text-sm">
                        This product is part of your order. You can track the delivery status from your orders page.
                      </p>
                    </div>
                  </div>

                  {/* Additional Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-sm md:text-base">
                        View Product Page
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
                        Download Invoice
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 md:px-8 py-6 border-t">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                  <div className="flex gap-3 md:gap-4">
                    <button
                      className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                      onClick={onClose}
                    >
                      Back to Orders
                    </button>
                    <button
                      className="px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
                      onClick={onClose}
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border">
                <div className="text-xl md:text-2xl font-bold text-blue-600">${subtotal.toFixed(2)}</div>
                <div className="text-gray-600 mt-1 text-sm md:text-base">Subtotal Value</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border">
                <div className="text-xl md:text-2xl font-bold text-green-600">{item.quantity}</div>
                <div className="text-gray-600 mt-1 text-sm md:text-base">Total Units Ordered</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border">
                <div className="text-xl md:text-2xl font-bold text-purple-600">${total.toFixed(2)}</div>
                <div className="text-gray-600 mt-1 text-sm md:text-base">Final Amount</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderProductDetail;