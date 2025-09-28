import React, { useState } from "react";
import "./styles/stretch-effect.css";
import "./stretch-effect.js";
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

	export default function App() {
		const [cartItems, setCartItems] = useState<CartItem[]>([]);
		const [products, setProducts] = useState<Product[]>([]);
		const [isCartOpen, setIsCartOpen] = useState(false);
		const [cartClosing, setCartClosing] = useState(false);
		const [route, setRoute] = useState(() => {
  const storedLogin = localStorage.getItem("isLoggedIn") === "true";
  const storedAdmin = localStorage.getItem("isAdmin") === "true";
  if (storedLogin && storedAdmin) return "admin";
  if (storedLogin) return "home";
  return "login";
});
		const [isLoggedIn, setIsLoggedIn] = useState(() => {
  return localStorage.getItem("isLoggedIn") === "true";
});
		const [showProfile, setShowProfile] = useState(false);
		const [searchTerm, setSearchTerm] = useState("");
			

		React.useEffect(() => {
  fetch("http://localhost:5000/api/products")
    .then((res) => res.json())
    .then((data) => {
      setProducts(
        data.map((row: any) => ({
          id: String(row.product_id),
          name: row.name,
          price: row.price,
          originalPrice: row.price * 1.05, // or null if you don’t track it
          rating: row.rating,
          reviewCount: row.review_count,
          image: row.image, // already like `/Images/...`
          category: row.category_id, // you can join with categories if needed
          inStock: row.stock > 0,
		  stock: row.stock,  // 👈 add this
        }))
      );
    })
    .catch((err) => console.error("Error fetching products:", err));
}, []);
		// Filter products by search term
		const filteredProducts = searchTerm.trim()
			? products.filter((p) =>
					p.name.toLowerCase().includes(searchTerm.toLowerCase())
				)
			: products;

		// Count by category for filtered products
		const productTypeCount = filteredProducts.length > 0 && searchTerm.trim()
			? filteredProducts.reduce((acc, p) => {
					acc[p.category] = (acc[p.category] || 0) + 1;
					return acc;
				}, {} as Record<string, number>)
			: null;

		// Listen for login/signup/checkout/home button events
		React.useEffect(() => {
			const showLogin = () => setRoute("login");
			const showSignup = () => setRoute("signup");
			const showHome = () => setRoute("home");
			const showCheckout = () => {
				if (isLoggedIn) {
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
			// Sync login state from localStorage on mount
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
			// eslint-disable-next-line
		}, [isLoggedIn]);

		
		// Handle adding items to the cart
const addToCart = (product: Product) => {
  setCartItems((prev) => {
    const existingItem = prev.find((item) => item.product_id === Number(product.id));
    if (existingItem) {
      return prev.map((item) =>
        item.product_id === Number(product.id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
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
          stock: product.stock,   // 👈 FIX: include stock from DB
          quantity: 1,
        },
      ];
    }
  });
  toast.success(`${product.name} added to cart!`);
};


const updateQuantity = (productId: number, quantity: number) => {
  setCartItems((prev) =>
    prev.map((item) => {
      if (item.product_id === productId) {
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} left in stock.`);
          return item; // don’t update
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

const removeFromCart = (productId: number) => {
  setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
  toast.success("Item removed from cart");
};

		// Calculate total cart items
		const cartItemsCount = cartItems.reduce(
			(sum, item) => sum + item.quantity,
			0
		);

		// --- JSX must be returned from the function body ---
		return (
			<div className="min-h-screen flex flex-col">
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
				<div
					className="flex-1 overflow-y-auto"
					id="main-scroll-wrapper"
					style={{ WebkitOverflowScrolling: "touch" }}
				>
					<main
						className="transition-transform duration-300"
						id="main-content"
					>
						{route === "login" ? (
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
								cartItems={cartItems}
								shippingFee={
									cartItems.length > 0 &&
									cartItems.reduce(
										(sum, item) => sum + item.price * item.quantity,
										0
									) > 50
										? 0
										: 9.99
								}
								onBack={() => setRoute("home")}
							/>

) : route === "admin" ? (
  <AdminPage />  
) : (
  <>
    <Hero />
    <ProductGrid
      products={filteredProducts}
      onAddToCart={addToCart}
    />
  </>
)}

					</main>
				</div> 
				<Footer />
				{(isCartOpen || cartClosing) && (
					<ShoppingCart
						isOpen={isCartOpen}
						onClose={() => {
							setCartClosing(true);
							setTimeout(() => {
								setIsCartOpen(false);
								setCartClosing(false);
							}, 400);
						}}
						cartItems={cartItems}
						onUpdateQuantity={updateQuantity}
						onRemoveItem={removeFromCart}
						  onClearCart={() => setCartItems([])}   // 👈 add this
					/>
				)}
				{isLoggedIn && showProfile && (
					<ProfileSection
  onClose={() => setShowProfile(false)}
  onLogout={() => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    setShowProfile(false);
    setRoute("home");
    toast.success("Logged out successfully!");
  }}
/>

				)}
			</div>
		);
}