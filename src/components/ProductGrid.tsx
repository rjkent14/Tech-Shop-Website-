import { useState } from "react";
import { ProductCard, Product } from "./ProductCard";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(4); // Show only one row (4 products)

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => 
    selectedCategory === "all" || product.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const productsToShow = sortedProducts.slice(0, visibleCount);

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Desktop Category Buttons */}
            <div className="hidden sm:flex gap-2 relative">
              <div className="w-full py-4 px-2 rounded-xl mb-8 category-container-animated" style={{ background: 'linear-gradient(90deg, #6c757d 0%, #adb5bd 50%, #ced4da 100%)', boxShadow: '0 2px 8px rgba(33,37,41,0.08)' }}>
                <div className="flex gap-2 justify-center items-center relative">
                  {categories.map((category, idx) => {
                    const isSelected = selectedCategory === category;
                    return (
                      <Button
                        key={category}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={`capitalize font-bold text-base py-3 px-6 rounded-lg shadow transition-all duration-500 focus:scale-110 active:scale-95 motion-safe:animate-fade-in bg-[#ced4da] text-[#212529] ${isSelected ? 'ring-2 ring-primary slide-category' : ''}`}
                        style={isSelected ? {
                          background: 'linear-gradient(90deg, #343a40 0%, #ced4da 100%)',
                          color: '#f8f9fa',
                          fontFamily: 'Orbitron, Roboto, Arial, sans-serif',
                          fontWeight: 700,
                          fontSize: '1rem',
                          boxShadow: '0 2px 8px rgba(33,37,41,0.18)',
                          borderRadius: '8px',
                          zIndex: 10,
                          transition: 'all 0.5s cubic-bezier(.4,2,.3,1)',
                        } : {
                          transition: 'all 0.5s cubic-bezier(.4,2,.3,1)',
                        }}
                      >
                        {category === "all" ? "All" : category}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Mobile Category Dropdown */}
            <div className="sm:hidden">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {productsToShow.map((product, idx) => (
            <div
              key={product.id}
              className="product-card home-animate"
              style={{
                animation: `fadeUp 0.6s cubic-bezier(.4,2,.3,1) ${idx * 0.08}s both`
              }}
            >
              <div className="home-animate-text" style={{ animation: `fadeUp 0.7s cubic-bezier(.4,2,.3,1) ${idx * 0.12}s both` }}>
                {/* ...existing product card text/details code... */}
              </div>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>

        {visibleCount < sortedProducts.length && (
          <div className="flex justify-center mt-16 gap-2">
            <Button variant="ghost" size="sm" className="px-4 py-1 text-xs" onClick={() => setVisibleCount(visibleCount + 4)}>
              Show More
            </Button>
            {visibleCount > 4 && (
              <Button variant="ghost" size="sm" className="px-4 py-1 text-xs" onClick={() => setVisibleCount(4)}>
                Show Less
              </Button>
            )}
          </div>
        )}
        {visibleCount >= sortedProducts.length && visibleCount > 4 && (
          <div className="flex justify-center mt-16">
            <Button variant="ghost" size="sm" className="px-4 py-1 text-xs" onClick={() => setVisibleCount(4)}>
              Show Less
            </Button>
          </div>
        )}

        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}