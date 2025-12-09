import React, { useState, useEffect } from "react";
import "./styles/stretch-effect.css";
import "./stretch-effect.js";
import Settings from "./pages/Settings";
import Orders from "./pages/Order";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import CheckoutPage from "./components/CheckoutPage";
import { Header } from "./components/Header";
import ProfileSection from "./components/ProfileSection";
import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { ShoppingCart, CartItem } from "./components/ShoppingCart";
import { Footer } from "./components/Footer";
import { Product } from "./components/ProductCard";
import { toast } from "sonner";
import AdminPage from "./pages/AdminPage";
import ProductDetails from "./components/ProductDetails";

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartClosing, setCartClosing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );
  const [route, setRoute] = useState(() => {
    const storedLogin = localStorage.getItem("isLoggedIn") === "true";
    const storedAdmin = localStorage.getItem("isAdmin") === "true";
    if (storedLogin && storedAdmin) return "admin";
    if (storedLogin) return "home";
    return "login";
  });
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(
          data.map((row: any) => ({
            id: String(row.product_id),
            name: row.name,
            price: row.price,
            originalPrice: row.price * 1.05,
            rating: row.rating,
            reviewCount: row.review_count,
            image: row.image,
            category: row.category_id,
            inStock: row.stock > 0,
            stock: row.stock,
          }))
        );
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Handle viewing product from order
  const handleViewProductFromOrder = async (productId: number) => {
    try {
      // First, check if product is already in our list
      const existingProduct = products.find(p => String(p.id) === String(productId));
      if (existingProduct) {
        setSelectedProduct(existingProduct);
        setRoute("product");
        return;
      }

      // If not in list, fetch from API
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      if (response.ok) {
        const productData = await response.json();
        // Convert to Product type
        const product: Product = {
          id: String(productData.product_id),
          name: productData.name,
          price: productData.price,
          originalPrice: productData.price * 1.05,
          rating: productData.rating || 4.0,
          reviewCount: productData.review_count || 0,
          image: productData.image,
          category: productData.category_id.toString(),
          inStock: productData.stock > 0,
          stock: productData.stock,
        };
        setSelectedProduct(product);
        setRoute("product");
      } else {
        toast.error("Product not found in catalog");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product details");
    }
  };

  // Filter products by search term
  const filteredProducts = searchTerm.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const productTypeCount =
    filteredProducts.length > 0 && searchTerm.trim()
      ? filteredProducts.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : null;

  // Navigation events
  useEffect(() => {
    const showLogin = () => setRoute("login");
    const showSignup = () => setRoute("signup");
    const showHome = () => setRoute("home");
    const showCheckout = () => {
      if (isLoggedIn) {
        setCheckoutItems([...cartItems]);
        setRoute("checkout");
      } else {
        setRoute("login");
        toast.error("Please log in to proceed to checkout.");
      }
    };

    window.addEventListener("show-login", showLogin);
    window.addEventListener("show-signup", showSignup);
    window.addEventListener("show-home", showHome);
    window.addEventListener("show-checkout", showCheckout);

    const syncLogin = () => {
      const stored = localStorage.getItem("isLoggedIn");
      if (stored === "true" && !isLoggedIn) setIsLoggedIn(true);
      if (stored !== "true" && isLoggedIn) setIsLoggedIn(false);
    };
    window.addEventListener("storage", syncLogin);

    return () => {
      window.removeEventListener("show-login", showLogin);
      window.removeEventListener("show-signup", showSignup);
      window.removeEventListener("show-home", showHome);
      window.removeEventListener("show-checkout", showCheckout);
      window.removeEventListener("storage", syncLogin);
    };
  }, [isLoggedIn, cartItems]);

  // Add to cart
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === Number(product.id));
      if (existing) {
        return prev.map((i) =>
          i.product_id === Number(product.id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          product_id: Number(product.id),
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          rating: product.rating,
          reviewCount: product.reviewCount,
          image: product.image,
          category: product.category,
          inStock: product.inStock,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
    toast.success(`${product.name} added to cart!`);
  };

  // Update quantity
  const updateQuantity = (productId: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          if (quantity > item.stock) {
            toast.error(`Only ${item.stock} left in stock.`);
            return item;
          }
          if (quantity <= 0) {
            toast.error("Quantity must be at least 1.");
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    toast.success("Item removed from cart");
  };

  const handleCartClose = () => {
    setCartClosing(true);
    setTimeout(() => {
      setCartClosing(false);
      setIsCartOpen(false);
    }, 400);
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
     {/* Only show header if NOT login/signup */}
  {route !== "login" && route !== "signup" && (
    <Header
      cartItemsCount={cartItemsCount}
      onCartClick={() => {
        setIsCartOpen(true);
        setCartClosing(false);
      }}
      isLoggedIn={isLoggedIn}
      onProfileClick={() => setShowProfile(true)}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      productTypeCount={productTypeCount}
    />
  )}

      <div className="flex-1 overflow-y-auto">
        <main className="transition-transform duration-300">
          {route === "orders" ? (
            <Orders onViewProduct={handleViewProductFromOrder} />
          ) : route === "settings" ? (
            <Settings />
          ) : route === "login" ? (
            <LoginPage
              onLogin={(isAdmin: boolean, userId: string) => {
                setIsLoggedIn(true);
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
                localStorage.setItem("userId", userId);
                setRoute(isAdmin ? "admin" : "home");
              }}
            />
          ) : route === "signup" ? (
            <SignUpPage onLogin={() => setRoute("login")} />
          ) : route === "checkout" ? (
            <CheckoutPage
              cartItems={checkoutItems}
              shippingFee={
                checkoutItems.reduce((sum, i) => sum + i.price * i.quantity, 0) > 50
                  ? 0
                  : 9.99
              }
              onBack={() => setRoute("home")}
              onClearCart={() => setCartItems([])}
            />
          ) : route === "admin" ? (
            <AdminPage />
          ) : route === "product" ? (
            <ProductDetails
              product={selectedProduct}
              onBack={() => setRoute("home")}
              onAddToCart={addToCart}
            />
          ) : (
            <>
              <Hero />
              <ProductGrid
                products={filteredProducts}
                onAddToCart={addToCart}
                onProductClick={(product) => {
                  setSelectedProduct(product);
                  setRoute("product");
                }}
              />
            </>
          )}
        </main>
      </div>
  {route !== "login" && route !== "signup" && <Footer />}
      
      
      {(isCartOpen || cartClosing) && (
        <ShoppingCart
          isOpen={isCartOpen}
          onClose={handleCartClose}
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={() => {
            setCheckoutItems([...cartItems]);
            setRoute("checkout");
            setIsCartOpen(false);
          }}
          userAddress={localStorage.getItem("userAddress") || ""}
        />
      )}

      {isLoggedIn && showProfile && (
        <ProfileSection
          onClose={() => setShowProfile(false)}
          onSeeOrders={() => {
            setShowProfile(false);
            setRoute("orders");
          }}
          onSettings={() => {
            setShowProfile(false);
            setRoute("settings");
          }}
          onLogout={() => {
            setIsLoggedIn(false);
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("isAdmin");
            localStorage.removeItem("userId");
            localStorage.removeItem("userAddress");
            setShowProfile(false);
            setRoute("home");
            toast.success("Logged out successfully!");
          }}
        />
      )}
    </div>
  );
}