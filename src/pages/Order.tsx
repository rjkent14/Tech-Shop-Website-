import React, { useEffect, useState } from "react";
import OrderProductDetail, { OrderItem } from "./OrderDetail";

interface Order {
  order_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

  useEffect(() => {
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
              status: row.status,
              created_at: row.created_at,
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

        setOrders(Object.values(grouped));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading orders...</p>;
  if (orders.length === 0) return <p className="p-6 text-gray-600">You have no orders yet.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.map((order) => (
        <div
          key={order.order_id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold">Order #{order.order_id}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <p
                className={`text-sm ${
                  order.status === "Shipped"
                    ? "text-green-600"
                    : order.status === "Processing"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                {order.status}
              </p>
            </div>
            <div className="font-bold">${order.total_amount.toFixed(2)}</div>
          </div>

          <ul className="divide-y">
            {order.items.map((item) => (
              <li
                key={item.product_id}
                className="flex py-2 items-center cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setSelectedItem(item)}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {selectedItem && (
        <OrderProductDetail
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Orders;
