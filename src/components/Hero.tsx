import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative h-96 md:h-[500px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1629800986269-203f349859cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNoJTIwZ2FkZ2V0cyUyMGJhbm5lcnxlbnwxfHx8fDE3NTY5MTAxNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Tech gadgets banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Latest Tech at Unbeatable Prices
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200">
          Discover the newest gadgets, from smartphones to laptops, all with free shipping
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <div className="hero-btn-container p-6 rounded-xl">
            <Button 
              size="lg" 
              className="shop-3d-btn font-bold text-2xl py-5 px-10 shadow-lg"
              style={{ minHeight: '64px', minWidth: '200px' }}
              onClick={() => window.dispatchEvent(new CustomEvent("show-login"))}
            >
              Shop Now
            </Button>
          </div>
          <div className="hero-btn-container p-6 rounded-xl">
            <Button 
              size="lg" 
              className="shop-3d-btn font-bold text-2xl py-5 px-10 shadow-lg"
              style={{ minHeight: '64px', minWidth: '200px' }}
              onClick={() => window.dispatchEvent(new CustomEvent("show-deals"))}
            >
              View Deals
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}