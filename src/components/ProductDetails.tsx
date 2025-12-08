import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "./ProductCard";

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

  // Hard-coded reviews for demonstration
  const reviews = [
    { name: "Alice", rating: 5, comment: "Excellent product!" },
    { name: "Bob", rating: 4, comment: "Very good, but a bit pricey." },
    { name: "Charlie", rating: 3, comment: "Average quality." },
  ];

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-6xl mx-auto px-11 py-12 pt-40">
      {/* Back Button */}
      <Button
        variant="outline"
        className="mb-8 flex items-center gap-2 sticky top-24 z-50 bg-white"
        onClick={onBack}
      >
        ← Back to Products
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="flex justify-center md:justify-start">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full max-w-md h-96 object-cover rounded-xl shadow-lg"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6 flex flex-col justify-start">
          {/* Name */}
          <h1 className="text-4xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center space-x-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-500">({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-3">
            <p className="text-3xl font-semibold text-blue-600">
              ${product.price.toFixed(2)}
            </p>
            {product.originalPrice && (
              <p className="text-gray-400 line-through text-lg">
                ${product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>

          {/* Stock */}
          <p
            className={`font-medium ${
              product.inStock ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.inStock
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </p>

          {/* Description */}
          <div className="text-gray-700 leading-relaxed">
            <p>
              This high-quality tech product is carefully designed for excellent
              performance and reliability. Ideal for everyday use, work,
              entertainment, and productivity.
            </p>
          </div>

          {/* Add to Cart */}
          <Button
            className="btn-gradient-primary w-full md:w-auto px-8 py-4 text-lg mt-4"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
          >
            Add to Cart
          </Button>

          {/* Hard-coded Review Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
            {reviews.map((r, idx) => (
              <div key={idx} className="border-b border-gray-200 py-3">
                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < r.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{r.name}</span>
                </div>
                <p className="text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
