import React, { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "./ProductCard";

export interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export function ShoppingCart({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: ShoppingCartProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;


  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={`fixed top-20 right-0 z-50 w-full sm:w-96 max-w-full bg-card rounded-l-lg shadow-lg p-6 ${isOpen ? 'animate-slide-in' : 'animate-slide-out'}`}
      style={{ transition: 'transform 0.4s cubic-bezier(.4,2,.3,1)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Shopping Cart ({cartItems.length})</h2>
  <Button variant="outline" size="sm" onClick={handleClose} aria-label="Close Cart">✕</Button>
      </div>
        <div className="text-muted-foreground mb-4">
          Review your selected items and proceed to checkout when ready.
        </div>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6" style={{ maxHeight: "340px" }}>
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="font-semibold">${item.price.toFixed(2)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="border-t pt-4 bg-card sticky bottom-0 z-10">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Free shipping on orders over $50
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => { window.dispatchEvent(new CustomEvent("show-checkout")); onClose(); }}>
                Checkout
              </Button>
            </div>
          )}
        </div>
  </div>
  );
}