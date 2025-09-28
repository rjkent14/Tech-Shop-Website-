import React, { useEffect, useState } from "react";
import { toast } from "sonner";

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
  items: OrderItem[];
}

interface User {
  user_id: number;
  name: string;
  email: string;
}

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "users">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterUser, setFilterUser] = useState<string>("All");

  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  // Fetch orders
  const fetchOrders = async () => {
    try {
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

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  // Update order status
  const updateStatus = async (orderId: number, status: string) => {
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
    }
  };

  // Create user
  const createUser = async () => {
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
      toast.success("User created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create user.");
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      toast.success("User deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user.");
    }
  };

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  const filteredOrdersByUser = filteredOrders.filter(
    (order) => filterUser === "All" || order.user_id === Number(filterUser)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administrator Dashboard</h1>

      {/* Tabs */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "orders" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "users" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <>
          <div className="mb-4 flex gap-4 flex-wrap">
            <div>
              <label className="mr-2 font-medium">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="mr-2 font-medium">Filter by user:</label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border rounded px-3 py-1"
              >
                <option value="All">All</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingOrders ? (
            <p className="text-center text-gray-500">Loading orders...</p>
          ) : filteredOrdersByUser.length === 0 ? (
            <p>No orders found.</p>
          ) : (
         <div className="overflow-x-auto w-full">
  <table className="w-[1500px] border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 border w-40">Order ID</th>
        <th className="p-2 border w-64">User</th>
        <th className="p-2 border w-96">Items</th>
        <th className="p-2 border w-32">Total</th>
        <th className="p-2 border w-32">Status</th>
        <th className="p-2 border w-48">Update Status</th>
      </tr>
    </thead>
                <tbody>
                  {filteredOrdersByUser.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50">
                      <td className="p-2 border">{order.order_id}</td>
                      <td className="p-2 border">
                        {users.find((u) => u.user_id === order.user_id)?.name ||
                          order.user_id}
                      </td>
                      <td className="p-2 border">
                        {order.items.map((item) => (
                          <div key={item.product_id}>
                            {item.name} x {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="p-2 border">${order.total_amount.toFixed(2)}</td>
                      <td className="p-2 border">{order.status}</td>
                      <td className="p-2 border">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order.order_id, e.target.value)
                          }
                          className="border rounded px-2 py-1"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          {/* Create user */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="border rounded px-2 py-1"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="border rounded px-2 py-1"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="border rounded px-2 py-1"
            />
            <button
              onClick={createUser}
              className="px-3 py-1 bg-green-500 text-white rounded"
            >
              Create User
            </button>
          </div>

          {loadingUsers ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div className="overflow-x-auto w-full">
  <table className="min-w-[1200px] border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2 border text-left">Order ID</th>
        <th className="p-2 border text-left">User</th>
        <th className="p-2 border text-left">Items</th>
        <th className="p-2 border text-left">Total</th>
        <th className="p-2 border text-left">Status</th>
        <th className="p-2 border text-left">Update Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredOrdersByUser.map((order) => (
        <tr key={order.order_id} className="hover:bg-gray-50">
          <td className="p-2 border">{order.order_id}</td>
          <td className="p-2 border">
            {users.find((u) => u.user_id === order.user_id)?.name || order.user_id}
          </td>
          <td className="p-2 border">
            {order.items.map((item) => (
              <div key={item.product_id}>
                {item.name} x {item.quantity}
              </div>
            ))}
          </td>
          <td className="p-2 border">${order.total_amount.toFixed(2)}</td>
          <td className="p-2 border">{order.status}</td>
          <td className="p-2 border">
            <select
              value={order.status}
              onChange={(e) => updateStatus(order.order_id, e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
