import React, { useEffect, useState } from "react";
import OrderProductDetail, { OrderItem } from "./OrderDetail";
import { Filter, ChevronDown, Check, Package, XCircle, RefreshCw, CheckCircle, Loader2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Order {
  order_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  delivery_address?: string;
  cancellation_reason?: string;
  refund_reason?: string;
}

interface OrdersProps {
  onViewProduct?: (productId: number) => void;
}

const Orders: React.FC<OrdersProps> = ({ onViewProduct }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("Pending");
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  const [showRefundModal, setShowRefundModal] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Simplified status options (only Pending, Completed, Cancelled, Refunded)
  const statusOptions = [
    { value: "Pending", label: "Pending Orders", icon: <Package className="w-4 h-4" />, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { value: "Completed", label: "Completed Orders", icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600", bgColor: "bg-green-50" },
    { value: "Cancelled", label: "Cancelled Orders", icon: <XCircle className="w-4 h-4" />, color: "text-red-600", bgColor: "bg-red-50" },
    { value: "Refunded", label: "Refunded Orders", icon: <RefreshCw className="w-4 h-4" />, color: "text-purple-600", bgColor: "bg-purple-50" }
  ];

  // Common reasons for cancellation and refund
  const cancellationReasons = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Delivery time too long",
    "Ordered by mistake",
    "Product specifications not matching",
    "Other reason"
  ];

  const refundReasons = [
    "Product damaged/defective",
    "Wrong item received",
    "Item not as described",
    "Late delivery",
    "Changed my mind (within return window)",
    "Other issue"
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/orders/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const grouped: Record<number, Order> = {};
        data.forEach((row: any) => {
          if (!grouped[row.order_id]) {
            grouped[row.order_id] = {
              order_id: row.order_id,
              total_amount: row.total_amount,
              status: row.status || "Pending",
              created_at: row.created_at,
              delivery_address: row.delivery_address,
              cancellation_reason: row.cancellation_reason,
              refund_reason: row.refund_reason,
              items: [],
            };
          }
          grouped[row.order_id].items.push({
            product_id: row.product_id,
            quantity: row.quantity,
            price: row.price,
            name: row.name,
            image: row.image,
          });
        });

        const ordersArray = Object.values(grouped);
        setOrders(ordersArray);
        setFilteredOrders(ordersArray.filter(order => order.status === "Pending"));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      });
  };

  // Filter orders by status
  useEffect(() => {
    if (selectedStatus === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

// Function to update order status with reason
const updateOrderStatus = async (orderId: number, newStatus: string, reason?: string) => {
  if (updatingOrderId === orderId) return;
  
  setUpdatingOrderId(orderId);
  
  try {
    const payload: any = { status: newStatus };
    if (reason) {
      if (newStatus === "Cancelled") {
        payload.cancellation_reason = reason;
      } else if (newStatus === "Refunded") {
        payload.refund_reason = reason;
      }
    }

    console.log("Sending update request:", { orderId, payload });

    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log("Update response:", responseData);

    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to update order status');
    }

    // Update local state with reason
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.order_id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              ...(reason && newStatus === "Cancelled" ? { cancellation_reason: reason } : {}),
              ...(reason && newStatus === "Refunded" ? { refund_reason: reason } : {})
            }
          : order
      )
    );

    toast.success(`Order #${orderId} marked as ${newStatus.toLowerCase()}`);
    
    // Close modals
    setShowCancelModal(null);
    setShowRefundModal(null);
    setCancelReason("");
    setRefundReason("");

    // If current filter doesn't include this status, remove from filtered view
    if (selectedStatus !== "all" && selectedStatus !== newStatus) {
      setFilteredOrders(prev => prev.filter(order => order.order_id !== orderId));
    }

  } catch (error) {
    console.error('Error updating order status:', error);
  } finally {
    setUpdatingOrderId(null);
  }
};

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) {
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
          {status}
        </span>
      );
    }
    
    return (
      <div className="flex items-center gap-2">
        {option.icon}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${option.bgColor} ${option.color}`}>
          {status}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDownloadInvoice = (orderId: number) => {
    toast.info(`Invoice for Order #${orderId} would be downloaded`);
  };

  const handleContactSupport = (orderId: number) => {
    toast.info(`Contacting support for Order #${orderId}`);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4 text-6xl">📦</div>
          <p className="text-gray-600 text-lg mb-2">You have no orders yet.</p>
          <p className="text-gray-500">Start shopping to see your orders here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage all your purchases</p>
        </div>
        
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setShowStatusFilter(!showStatusFilter)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>
              {statusOptions.find(opt => opt.value === selectedStatus)?.label || "Pending Orders"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showStatusFilter && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowStatusFilter(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50 py-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setShowStatusFilter(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={option.color}>{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    {selectedStatus === option.value && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Quick Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setSelectedStatus(option.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedStatus === option.value 
                ? `${option.bgColor} ${option.color} border ${option.color.replace('text', 'border')}`
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {option.icon}
            <span className="font-medium">{option.value}</span>
            <span className="text-sm opacity-75">
              ({orders.filter(order => order.status === option.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing <span className="font-semibold">{filteredOrders.length}</span> {selectedStatus.toLowerCase()} order{filteredOrders.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <div className="text-gray-400 mb-4 text-5xl">
              {selectedStatus === "Pending" ? "📦" : 
               selectedStatus === "Completed" ? "✅" :
               selectedStatus === "Cancelled" ? "❌" : "🔄"}
            </div>
            <p className="text-gray-600 text-lg mb-2">
              No {selectedStatus.toLowerCase()} orders found
            </p>
            <p className="text-gray-500">
              {selectedStatus === "Pending" 
                ? "All your pending orders will appear here."
                : selectedStatus === "Completed"
                ? "Completed orders will appear here once delivered."
                : selectedStatus === "Cancelled"
                ? "Cancelled orders will appear here."
                : "Refunded orders will appear here."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.order_id}
              className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-lg font-semibold">Order #{order.order_id}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Placed on {formatDate(order.created_at)}
                  </p>
                  
                  {/* Show cancellation/refund reason if exists */}
                  {order.cancellation_reason && (
                    <div className="mt-3 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 shadow-inner">
                      <div className="flex items-center gap-2 text-red-700 mb-1">
                        <XCircle className="w-4 h-4" />
                        <span className="font-medium">Cancellation Reason:</span>
                      </div>
                      <p className="text-red-600 text-sm">{order.cancellation_reason}</p>
                    </div>
                  )}
                  
                  {order.refund_reason && (
                    <div className="mt-3 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 shadow-inner">
                      <div className="flex items-center gap-2 text-purple-700 mb-1">
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Refund Reason:</span>
                      </div>
                      <p className="text-purple-600 text-sm">{order.refund_reason}</p>
                    </div>
                  )}

                  {order.delivery_address && (
                    <p className="text-sm text-gray-600 mt-2">
                      📍 {order.delivery_address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total amount</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-700 mb-4">Order Items ({order.items.length})</h3>
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li
                      key={`${order.order_id}-${item.product_id}`}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg mr-4 border"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm text-gray-600">Price: ${item.price.toFixed(2)} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button 
                          className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProduct && onViewProduct(item.product_id);
                          }}
                        >
                          View Product →
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Actions */}
              <div className="border-t pt-6 mt-6">
                <div className="flex flex-wrap gap-3">
                  {order.status === "Pending" && (
                    <>
                      <button 
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={() => updateOrderStatus(order.order_id, "Completed")}
                        disabled={updatingOrderId === order.order_id}
                      >
                        {updatingOrderId === order.order_id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Mark as Completed"
                        )}
                      </button>
                      <button 
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        onClick={() => setShowCancelModal(order.order_id)}
                        disabled={updatingOrderId === order.order_id}
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === "Completed" && (
                    <button 
                      className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      onClick={() => setShowRefundModal(order.order_id)}
                      disabled={updatingOrderId === order.order_id}
                    >
                      Request Refund
                    </button>
                  )}
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => handleDownloadInvoice(order.order_id)}
                  >
                    Download Invoice
                  </button>
                  <button 
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => handleContactSupport(order.order_id)}
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedItem && (
        <OrderProductDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onViewProduct={onViewProduct}
        />
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-100 z-[9999] overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cancel Order #{showCancelModal}</h3>
                  <p className="text-gray-600 mt-1">Please select a reason for cancellation</p>
                </div>
                <button
                  onClick={() => {
                    setShowCancelModal(null);
                    setCancelReason("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* FIXED: Radio button selection */}
              <div className="space-y-3 mb-6">
                {cancellationReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                      cancelReason === reason
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      cancelReason === reason 
                        ? "bg-red-500" 
                        : "bg-white border-2 border-gray-400"
                    }`}>
                      {cancelReason === reason && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{reason}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(null);
                    setCancelReason("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    if (!cancelReason) {
                      toast.error("Please select a cancellation reason");
                      return;
                    }
                    updateOrderStatus(showCancelModal, "Cancelled", cancelReason);
                  }}
                  disabled={!cancelReason || updatingOrderId === showCancelModal}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {updatingOrderId === showCancelModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-gray-100 z-[9999] overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Request Refund for Order #{showRefundModal}</h3>
                  <p className="text-gray-600 mt-1">Please select a reason for refund</p>
                </div>
                <button
                  onClick={() => {
                    setShowRefundModal(null);
                    setRefundReason("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* FIXED: Radio button selection */}
              <div className="space-y-3 mb-6">
                {refundReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setRefundReason(reason)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                      refundReason === reason
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      refundReason === reason 
                        ? "bg-purple-500" 
                        : "bg-white border-2 border-gray-400"
                    }`}>
                      {refundReason === reason && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{reason}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRefundModal(null);
                    setRefundReason("");
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={() => {
                    if (!refundReason) {
                      toast.error("Please select a refund reason");
                      return;
                    }
                    updateOrderStatus(showRefundModal, "Refunded", refundReason);
                  }}
                  disabled={!refundReason || updatingOrderId === showRefundModal}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                >
                  {updatingOrderId === showRefundModal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Request Refund"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;