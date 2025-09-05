import React, { useState } from "react";
import "../styles/globals.css";
import { CartItem } from "./ShoppingCart";
import { Button } from "./ui/button";

interface CheckoutPageProps {
  cartItems: CartItem[];
  shippingFee: number;
  onBack?: () => void;
}

export default function CheckoutPage({ cartItems, shippingFee, onBack }: CheckoutPageProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;
  const logistics = "FastExpress";
  const eta = "3-5 business days";
  const shopAddress = "123 Tech Street, Digital City";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background animate-fade-in">
      <form className="bg-card p-6 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-6 border border-border animate-slide-up mx-auto">
        <h2 className="text-xl font-bold text-center mb-2">Checkout</h2>
        <div className="space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-4 items-center border-b pb-2">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.category}</div>
                <div className="text-sm">Qty: {item.quantity}</div>
                <div className="font-semibold">${item.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
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
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Shipping Address</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded bg-input-background focus:outline-none focus:ring focus:border-primary text-sm"
            placeholder="Enter your shipping address"
            value={shippingAddress}
            onChange={e => setShippingAddress(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Logistics</label>
          <div className="w-full px-3 py-2 border rounded bg-input-background text-sm">{logistics}</div>
          <div className="text-xs text-muted-foreground">ETA: {eta}</div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Payment Option</label>
          <select
            className="w-full px-3 py-2 border rounded bg-input-background text-sm"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            <option value="card">Card</option>
            <option value="gcash">GCash</option>
            <option value="cod">Cash on Delivery (COD)</option>
            <option value="applepay">Apple Pay</option>
          </select>
        </div>
        <Button className="btn-gradient-primary w-full mt-4" type="submit">Place Order</Button>
        {onBack && (
          <Button className="btn-gradient-secondary w-full mt-2" type="button" onClick={onBack}>Continue Shopping </Button>
        )}
      </form>
    </div>
  );
}
