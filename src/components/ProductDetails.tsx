import { Star, ShoppingCart, Truck, Shield, ArrowLeft, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "./ProductCard";
import { useState } from "react";

interface ProductDetailsProps {
  product: Product | null;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetails({
  product,
  onBack,
  onAddToCart,
}: ProductDetailsProps) {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  
  // Product features - dynamic based on category
  const getFeatures = () => {
    const baseFeatures = [
      "High-performance components",
      "Energy efficient design",
      "Latest generation technology",
      "Premium build quality",
      "Extended warranty included",
      "24/7 customer support"
    ];
    
    // Add category-specific features
    const productType = product.name.toLowerCase();
    if (productType.includes("laptop") || product.category?.toString().includes("1")) {
      return [
        "Powerful processor for multitasking",
        "High-resolution display",
        "Long battery life",
        "Lightweight and portable design",
        "Fast SSD storage",
        "Backlit keyboard"
      ];
    } else if (productType.includes("phone") || product.category?.toString().includes("2")) {
      return [
        "High-quality camera system",
        "Fast charging capability",
        "Water and dust resistant",
        "Large storage capacity",
        "5G connectivity",
        "Face recognition"
      ];
    } else if (productType.includes("headphone") || product.category?.toString().includes("3")) {
      return [
        "Noise cancellation technology",
        "Long battery life",
        "Comfortable ear cushions",
        "Bluetooth 5.0 connectivity",
        "Built-in microphone",
        "Foldable design"
      ];
    }
    
    return baseFeatures;
  };

  const features = getFeatures();

  // Dynamic reviews based on product
  const reviews = [
    { 
      name: "Alex Johnson", 
      rating: 5, 
      date: "2 days ago",
      comment: `Absolutely love this ${product.name}! The performance exceeded my expectations. Delivery was super fast too!`,
      verified: true
    },
    { 
      name: "Sarah Miller", 
      rating: 4, 
      date: "1 week ago",
      comment: `Very good ${product.name} overall. Works perfectly for my needs. Only wish the price was a bit lower.`,
      verified: true
    },
    { 
      name: "David Chen", 
      rating: 5, 
      date: "2 weeks ago",
      comment: `Best ${product.name} purchase I've made this year. Quality is outstanding and the customer service was excellent.`,
      verified: true
    },
    { 
      name: "Emma Wilson", 
      rating: 3, 
      date: "3 weeks ago",
      comment: `Good ${product.name} but took longer to set up than expected. Performance is solid though.`,
      verified: false
    },
  ];

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingCounts = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: (reviews.filter(r => r.rating === star).length / reviews.length) * 100
  }));

  // Single image only
  const productImage = product.image;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Generate dynamic description based on product
  const getDescription = () => {
    const productType = product.name.toLowerCase();
    
    if (productType.includes("laptop")) {
      return `The ${product.name} is a high-performance laptop designed for productivity and creativity. With its powerful processor and stunning display, it handles demanding tasks with ease while providing exceptional battery life for all-day use. Perfect for professionals, students, and creative individuals who need reliable performance.`;
    } else if (productType.includes("phone") || productType.includes("smartphone")) {
      return `Experience next-level mobile technology with the ${product.name}. Featuring an advanced camera system, lightning-fast processor, and vibrant display, this smartphone delivers premium performance for photography, gaming, and productivity. Stay connected with blazing-fast 5G and enjoy all-day battery life.`;
    } else if (productType.includes("headphone") || productType.includes("audio")) {
      return `Immerse yourself in superior sound with the ${product.name}. These premium headphones deliver crystal-clear audio with deep bass and noise-cancellation technology. Designed for comfort during extended listening sessions, they feature long battery life and seamless connectivity for your devices.`;
    } else {
      return `The ${product.name} represents the pinnacle of modern technology, combining innovative features with exceptional performance. Designed for users who demand the best, this product delivers reliable operation, intuitive controls, and premium construction that stands the test of time.`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                TechStore Exclusive
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span>Home</span>
            <span>›</span>
            <span>Products</span>
            <span>›</span>
            <span className="font-medium text-gray-900">Tech</span>
            <span>›</span>
            <span className="font-semibold text-blue-600">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
       {/* Left Column - Image */}
<div className="space-y-6">
  {/* Main Image */}
<div className="bg-gray rounded-2xl shadow-xl overflow-hidden border max-w-md max-h-[100px]">
<div className="relative aspect-square p-8 max-w-[200px] max-h-[200px] mx-auto">
        <div className="w-full h-full flex items-center justify-center">
        <ImageWithFallback
          src={productImage}
          alt={product.name}
          className="max-w-[70%] max-h-[70%] object-contain"
        />
      </div>
                  {discount > 0 && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
                        -{discount}% OFF
                      </Badge>
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="px-3 py-1">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Banner */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">Free Shipping</p>
                    <p className="text-xs text-gray-600">Over $50</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-sm">2 Year Warranty</p>
                    <p className="text-xs text-gray-600">Full coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <Badge variant="outline" className="mb-3">
                  {typeof product.category === 'string' ? product.category : 'Tech Product'}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center bg-gray-50 rounded-full px-3 py-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : i < averageRating
                              ? "fill-yellow-400/50 text-yellow-400/50"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-semibold">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{reviews.length} reviews</span>
                  <span className="text-gray-500">•</span>
                  <span className={`font-medium ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-baseline gap-4">
                  <div>
                    {product.originalPrice && (
                      <p className="text-gray-500 line-through text-lg">
                        ${product.originalPrice.toFixed(2)}
                      </p>
                    )}
                    <p className="text-4xl font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </p>
                    {discount > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        Save ${(product.originalPrice! - product.price).toFixed(2)} ({discount}%)
                      </p>
                    )}
                  </div>
                  {product.stock > 0 && (
                    <div className="ml-auto">
                      <div className="text-sm text-gray-600 mb-1">
                        Only {product.stock} left in stock
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button 
                      className="px-4 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="px-4 py-3 font-semibold w-16 text-center">{quantity}</span>
                    <button 
                      className="px-4 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <Button
                    className="flex-1 btn-gradient-primary text-lg py-6 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      for (let i = 0; i < quantity; i++) {
                        onAddToCart(product);
                      }
                    }}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-5 h-5 mr-3" />
                    {product.inStock ? `Add ${quantity} to Cart` : "Out of Stock"}
                  </Button>
                </div>

                <p className="text-sm text-gray-600 text-center">
                  <Check className="w-4 h-4 inline mr-1 text-green-500" />
                  Free returns within 30 days • Secure payment • 24/7 support
                </p>
              </div>

              {/* Features */}
              <div className="border rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <div className="text-gray-700 leading-relaxed space-y-4">
                  <p>
                    {getDescription()}
                  </p>
                  <p>
                    With its sleek design and intuitive interface, the {product.name} is perfect for both 
                    beginners and experienced users. The durable construction ensures long-lasting performance 
                    even under demanding conditions, making it a reliable choice for daily use.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 border-t pt-12">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Rating Overview */}
              <div className="lg:w-1/3">
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                    <div className="flex justify-center mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.floor(averageRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">Based on {reviews.length} reviews</p>
                  </div>
                  
                  <div className="space-y-3">
                    {ratingCounts.map(({ star, count, percentage }) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-gray-600">{star} star</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-sm text-gray-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:w-2/3">
                <div className="grid gap-6">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold">{review.name}</h4>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}