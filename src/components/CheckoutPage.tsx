import React, { useState, useEffect } from "react";
import "../styles/globals.css";
import { CartItem } from "./ShoppingCart";
import { Button } from "./ui/button";
import { toast } from "sonner"; // ✅ feedback

interface CheckoutPageProps {
  cartItems: CartItem[];
  shippingFee: number;
  onBack?: () => void;
  onClearCart: () => void;
}

export default function CheckoutPage({
  cartItems,
  shippingFee,
  onBack,
    onClearCart,  // <-- add this
}: CheckoutPageProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
const [paymentStatus, setPaymentStatus] = useState("Pending"); // 👈 NEW
  useEffect(() => {
   // const userId = Number(localStorage.getItem("userId"));
   
    // ✅ Preload saved address from localStorage (Settings)
    const savedAddress = localStorage.getItem("userAddress");
    if (savedAddress) {
      setShippingAddress(savedAddress);
    }
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingFee;
  const logistics = "FastExpress";
  const eta = "3-5 business days";
  const shopAddress = "123 Tech Street, Digital City";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const userId = Number(localStorage.getItem("userId"));

  try {
    const res = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        cartItems,
        deliveryAddress: shippingAddress,
        paymentMethod,
        paymentStatus,
        total,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Order placed successfully!");
      onClearCart();  // ✅ clear cart in App
      setShippingAddress("");
      if (onBack) onBack();  // optional: navigate back or home
    } else {
      toast.error(data.error || "Failed to place order");
    }
  } catch (err) {
    toast.error("Network error");
    console.error(err);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6 border border-border animate-slide-up mx-auto"
      >
        <h2 className="text-xl font-bold text-center mb-2">Checkout</h2>

        {/* Cart items */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product_id}
              className="flex gap-4 items-center border-b pb-2"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.category}
                </div>
                <div className="text-sm">Qty: {item.quantity}</div>
                <div className="font-semibold">${item.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Fee</span>
            <span>${shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2 mb-2">
          <span>Shop Address: {shopAddress}</span>
        </div>

        {/* Shipping address */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Shipping Address</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded bg-input-background focus:outline-none focus:ring focus:border-primary text-sm"
            placeholder="Enter your shipping address"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            required
          />
        </div>

        {/* Logistics */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Logistics</label>
          <div className="w-full px-3 py-2 border rounded bg-input-background text-sm">
            {logistics}
          </div>
          <div className="text-xs text-muted-foreground">ETA: {eta}</div>
        </div>

        {/* Payment method */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Payment Option</label>
          <select
            className="w-full px-3 py-2 border rounded bg-input-background text-sm"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="card">Card</option>
            <option value="gcash">GCash</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="applepay">Apple Pay</option>
          </select>
        </div>
          {/* Payment status */}
<div className="flex flex-col gap-2">
  <label className="font-medium text-sm">Payment Status</label>
  <select
    className="w-full px-3 py-2 border rounded bg-input-background text-sm"
    value={paymentStatus}
    onChange={(e) => setPaymentStatus(e.target.value)}
  >
    <option value="Pending">Pending</option>
    <option value="Paid">Paid</option>
  </select>
</div>
        {/* Buttons */}
        <Button className="btn-gradient-primary w-full mt-4" type="submit">
          Place Order
        </Button>
        {onBack && (
          <Button
            className="btn-gradient-secondary w-full mt-2"
            type="button"
            onClick={onBack}
          >
            Continue Shopping
          </Button>
        )}
      </form>
    </div>
  );
}
