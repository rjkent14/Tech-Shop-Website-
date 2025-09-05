import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="bg-muted/50 mt-16">
      <div className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mx-auto" style={{ marginLeft: '1rem' }}>
          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-2">TechStore</h3>
            <p className="text-muted-foreground mb-2">
              Your one-stop shop for the latest technology and gadgets. Quality products, competitive prices, and excellent customer service.
            </p>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Laptops</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Smartphones</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Audio</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gaming</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div style={{ marginLeft: '-1rem' }}>
            <h3 className="font-semibold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-2">
              Subscribe to our newsletter for the latest deals and product updates.
            </p>
            <div className="flex space-x-2" style={{ maxWidth: '320px' }}>
              <Input placeholder="Enter your email" className="flex-1 min-w-0" style={{ minWidth: '0', width: '180px' }} />
              <Button style={{ minWidth: '90px' }}>Subscribe</Button>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>support@techstore.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>1-800-TECH-STORE</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>123 Tech Street, Digital City</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 TechStore. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}