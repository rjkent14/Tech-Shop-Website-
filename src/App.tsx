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

// Mock product data
const mockProducts: Product[] = [
	{
		id: "1",
		name: "MacBook Pro 16-inch with M3 Chip",
		price: 2499.99,
		originalPrice: 2699.99,
		rating: 4.8,
		reviewCount: 324,
		image:
			"https://images.unsplash.com/photo-1754928864131-21917af96dfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NTY4MjcwNjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "Laptops",
		inStock: true,
	},
	{
		id: "2",
		name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
		price: 349.99,
		originalPrice: 399.99,
		rating: 4.7,
		reviewCount: 892,
		image:
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGhlYWRwaG9uZXN8ZW58MXx8fHwxNzU2ODc3MDUxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "Audio",
		inStock: true,
	},
	{
		id: "3",
		name: "iPhone 15 Pro Max 256GB",
		price: 1199.99,
		rating: 4.6,
		reviewCount: 567,
		image:
			"https://images.unsplash.com/photo-1675953935267-e039f13ddd79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydHBob25lJTIwbW9iaWxlJTIwcGhvbmV8ZW58MXx8fHwxNzU2ODU3ODI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "Phones",
		inStock: true,
	},
	{
		id: "4",
		name: "Canon EOS R6 Mark II Mirrorless Camera",
		price: 2499.99,
		rating: 4.9,
		reviewCount: 156,
		image:
			"https://images.unsplash.com/photo-1580050815120-3862a5833e0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY2FtZXJhJTIwcGhvdG9ncmFpaHl8ZW58MXx8fHwxNzU2ODc0Mjk5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "Cameras",
		inStock: false,
	},
	{
		id: "5",
		name: "PlayStation 5 Console",
		price: 499.99,
		rating: 4.5,
		reviewCount: 1203,
		image:
			"https://images.unsplash.com/photo-1655976796204-308e6f3deaa8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBjb25zb2xlJTIwY29udHJvbGxlcnxlbnwxfHx8fDE3NTY4Nzg1NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "Gaming",
		inStock: true,
	},
	{
		id: "6",
		name: "Apple Watch Series 9 GPS + Cellular 45mm",
		price: 499.99,
		originalPrice: 529.99,
		rating: 4.4,
		reviewCount: 789,
		image:
			"https://images.unsplash.com/photo-1716234479503-c460b87bdf98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHdhdGNoJTIwd2VhcmFibGV8ZW58MXx8fHwxNzU2ODYyNjIyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "Wearables",
		inStock: true,
	},
];

export default function App() {
	const [cartItems, setCartItems] = useState([]);
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [cartClosing, setCartClosing] = useState(false);
	const [route, setRoute] = useState("home");
	const [isLoggedIn, setIsLoggedIn] = useState(() => {
		// Check localStorage for persisted login state
		const stored = localStorage.getItem("isLoggedIn");
		return stored === "true";
	});
	const [showProfile, setShowProfile] = useState(false);

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
			const existingItem = prev.find((item) => item.id === product.id);
			if (existingItem) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			} else {
				return [...prev, { ...product, quantity: 1 }];
			}
		});
		toast.success(`${product.name} added to cart!`);
	};

	// Handle updating cart item quantity
	const updateQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}
		setCartItems((prev) =>
			prev.map((item) =>
				item.id === productId ? { ...item, quantity } : item
			)
		);
	};

	// Handle removing items from the cart
	const removeFromCart = (productId: string) => {
		setCartItems((prev) => prev.filter((item) => item.id !== productId));
		toast.success("Item removed from cart");
	};

	// Calculate total cart items
	const cartItemsCount = cartItems.reduce(
		(sum, item) => sum + item.quantity,
		0
	);

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
										onLogin={() => {
											setIsLoggedIn(true);
											localStorage.setItem("isLoggedIn", "true");
											setRoute("home");
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
					) : (
						<>
							<Hero />
							<ProductGrid
								products={mockProducts}
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
						/>
					)}
							{isLoggedIn && showProfile && (
								<ProfileSection
									onClose={() => setShowProfile(false)}
									onLogout={() => {
										setIsLoggedIn(false);
										localStorage.setItem("isLoggedIn", "false");
										setShowProfile(false);
										setRoute("home");
									}}
								/>
							)}
				</div>
			);
}