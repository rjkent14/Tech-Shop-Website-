import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Package,
  Truck,
  UserPlus,
  Download,
  RefreshCw,
  Plus,
  Warehouse,
  BarChart3,
  DollarSign,
  Package2
} from "lucide-react";

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  order_id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
  cancellation_reason?: string;
  refund_reason?: string;
  items: OrderItem[];
}

interface User {
  user_id: number;
  name: string;
  email: string;
}

interface Product {
  product_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  category_id?: number;
  review_count?: number;
  rating?: number;
}

interface Category {
  category_id: number;
  name: string;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "users" | "inventory">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterUser, setFilterUser] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [modalType, setModalType] = useState<"cancellation" | "refund">("cancellation");
  const [reasonText, setReasonText] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category_id: "",
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch("http://localhost:5000/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories.");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProducts();
    fetchCategories();
  }, []);

  // Update order status with reason
  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingStatus(orderId);
    
    if (status === "Cancelled") {
      setSelectedOrder(orders.find(o => o.order_id === orderId) || null);
      setModalType("cancellation");
      setReasonText("");
      setShowReasonModal(true);
      setUpdatingStatus(null);
      return;
    }
    
    if (status === "Refunded") {
      setSelectedOrder(orders.find(o => o.order_id === orderId) || null);
      setModalType("refund");
      setReasonText("");
      setShowReasonModal(true);
      setUpdatingStatus(null);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, status } : o))
      );
      toast.success("Order status updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order status.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Submit status update with reason
  const submitStatusWithReason = async () => {
    if (!selectedOrder || !reasonText.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      const body: any = { 
        status: modalType === "cancellation" ? "Cancelled" : "Refunded" 
      };
      
      if (modalType === "cancellation") {
        body.cancellation_reason = reasonText;
      } else {
        body.refund_reason = reasonText;
      }

      const res = await fetch(`http://localhost:5000/api/orders/${selectedOrder.order_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error("Failed to update status");

      setOrders((prev) =>
        prev.map((o) => 
          o.order_id === selectedOrder.order_id 
            ? { 
                ...o, 
                status: body.status,
                cancellation_reason: body.cancellation_reason,
                refund_reason: body.refund_reason
              } 
            : o
        )
      );
      
      toast.success(`Order ${modalType === "cancellation" ? "cancelled" : "refunded"} successfully!`);
      setShowReasonModal(false);
      setReasonText("");
      setSelectedOrder(null);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${modalType} order.`);
    }
  };

  // Create user
  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const created = await res.json();
      setUsers((prev) => [...prev, created]);
      setNewUser({ name: "", email: "", password: "" });
      toast.success("User created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create user.");
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    }
  };

  // Create product
  const createProduct = async () => {
    const productData = {
      name: newProduct.name,
      description: newProduct.description || "",
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      image: newProduct.image || "/Images/default-product.jpg",
      category_id: newProduct.category_id ? parseInt(newProduct.category_id) : undefined,
    };

    if (!productData.name || !productData.price || !productData.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (!res.ok) throw new Error("Failed to create product");
      
      const created = await res.json();
      setProducts((prev) => [...prev, created]);
      toast.success("Product created successfully!");
      setShowProductModal(false);
      resetProductForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product.");
    }
  };

  // Update product
  const updateProduct = async () => {
    if (!editingProduct) return;

    const productData = {
      name: newProduct.name,
      description: newProduct.description || "",
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      image: newProduct.image || "/Images/default-product.jpg",
      category_id: newProduct.category_id ? parseInt(newProduct.category_id) : undefined,
    };

    if (!productData.name || !productData.price || !productData.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/products/${editingProduct.product_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      
      if (!res.ok) throw new Error("Failed to update product");
      
      // Cast the result to Product[] to fix TypeScript error
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === editingProduct.product_id
            ? { ...p, ...productData }
            : p
        ) as Product[]
      );
      toast.success("Product updated successfully!");
      setShowProductModal(false);
      resetProductForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    }
  };

  // Delete product
  const deleteProduct = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete product");
      }
      
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  // Edit product
  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || "",
      category_id: product.category_id?.toString() || "",
    });
    setShowProductModal(true);
  };

  // Reset product form
  const resetProductForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stock: "",
      image: "",
      category_id: "",
    });
    setEditingProduct(null);
  };

  // Filter and search logic for orders
  const filteredOrders = orders
    .filter((order) => filterStatus === "All" || order.status === filterStatus)
    .filter((order) => filterUser === "All" || order.user_id === Number(filterUser))
    .filter((order) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        order.order_id.toString().includes(searchLower) ||
        order.delivery_address.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.name.toLowerCase().includes(searchLower))
      );
    });

  // Filter products
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Refunded": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate inventory stats
  const inventoryStats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock < 10).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage orders, users, and inventory</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (activeTab === "orders") fetchOrders();
                else if (activeTab === "users") fetchUsers();
                else fetchProducts();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            {activeTab === "inventory" && (
              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Product
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === "Pending").length}
                </p>
              </div>
              <Package className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{inventoryStats.totalProducts}</p>
              </div>
              <Warehouse className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold">{inventoryStats.lowStock}</p>
              </div>
              <BarChart3 className="text-red-500" size={24} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
              activeTab === "orders"
                ? "bg-white border-t border-l border-r border-gray-300 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Orders Management
          </button>
          <button
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
              activeTab === "users"
                ? "bg-white border-t border-l border-r border-gray-300 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users Management
          </button>
          <button
            className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
              activeTab === "inventory"
                ? "bg-white border-t border-l border-r border-gray-300 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory Management
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-lg border p-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search orders by ID, address, product, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Users</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          {loadingOrders ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 text-lg">No orders found</p>
              {searchQuery && (
                <p className="text-gray-400">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.order_id}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                          {order.cancellation_reason && (
                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-100">
                              <p className="text-xs font-medium text-red-800">Cancellation Reason:</p>
                              <p className="text-xs text-red-600">{order.cancellation_reason}</p>
                            </div>
                          )}
                          {order.refund_reason && (
                            <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-100">
                              <p className="text-xs font-medium text-orange-800">Refund Reason:</p>
                              <p className="text-xs text-orange-600">{order.refund_reason}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {users.find((u) => u.user_id === order.user_id)?.name || `User #${order.user_id}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {users.find((u) => u.user_id === order.user_id)?.email || "No email"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.product_id} className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/Images/default-product.jpg";
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order.order_id, e.target.value)}
                            disabled={updatingStatus === order.order_id}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Mark as Completed</option>
                            <option value="Cancelled">Cancel Order</option>
                            <option value="Refunded">Issue Refund</option>
                          </select>
                          {updatingStatus === order.order_id && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              Updating...
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={createUser}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus size={16} />
                Create User
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loadingUsers ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{user.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => deleteUser(user.user_id)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-xl shadow-lg border p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => {
                resetProductForm();
                setShowProductModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4 md:mt-0"
            >
              <Plus size={16} />
              Add New Product
            </button>
          </div>

          {/* Inventory Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-blue-900">{inventoryStats.totalProducts}</p>
                </div>
                <Package2 className="text-blue-500" size={24} />
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Low Stock (&lt;10)</p>
                  <p className="text-2xl font-bold text-yellow-900">{inventoryStats.lowStock}</p>
                </div>
                <BarChart3 className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-800 font-medium">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-900">{inventoryStats.outOfStock}</p>
                </div>
                <XCircle className="text-red-500" size={24} />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${inventoryStats.totalValue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="text-green-500" size={24} />
              </div>
            </div>
          </div>

          {/* Products Table */}
          {loadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 text-lg">No products found</p>
              <button
                onClick={() => {
                  resetProductForm();
                  setShowProductModal(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || "/Images/default-product.jpg"}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/Images/default-product.jpg";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {product.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">{product.stock}</p>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full ${
                                product.stock === 0
                                  ? "bg-red-500"
                                  : product.stock < 10
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.stock === 0
                              ? "bg-red-100 text-red-800"
                              : product.stock < 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock < 10
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-bold text-gray-900">
                          ${(product.price * product.stock).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editProduct(product)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                            title="Edit Product"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.product_id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {modalType === "cancellation" ? "Cancellation Reason" : "Refund Reason"}
            </h3>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder={`Enter ${modalType === "cancellation" ? "cancellation" : "refund"} reason...`}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReasonText("");
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusWithReason}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full pl-8 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter stock quantity"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_id} - {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Available categories: {categories.map(c => `${c.category_id}: ${c.name}`).join(", ")}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg or /Images/product.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default image
                </p>
                <div className="mt-2">
                  
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? updateProduct : createProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;