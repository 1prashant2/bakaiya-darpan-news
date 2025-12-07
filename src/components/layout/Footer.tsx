import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { data: categories } = useCategories();

  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="news-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary-foreground">प्रेस दर्पण</h3>
            <p className="text-sm text-background/80 leading-relaxed">
              प्रेस दर्पण एक स्वतन्त्र र निष्पक्ष अनलाइन समाचार पोर्टल हो। हामी सत्य र तथ्यमा आधारित समाचार प्रस्तुत गर्न प्रतिबद्ध छौं।
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-primary-foreground">श्रेणीहरू</h4>
            <ul className="space-y-2 text-sm">
              {categories?.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-background/80 hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-primary-foreground">द्रुत लिंकहरू</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-background/80 hover:text-primary transition-colors">
                  गृहपृष्ठ
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/80 hover:text-primary transition-colors">
                  हाम्रोबारे
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/80 hover:text-primary transition-colors">
                  सम्पर्क
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-background/80 hover:text-primary transition-colors">
                  गोपनीयता नीति
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-primary-foreground">सम्पर्क</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-background/80">बकैया, नेपाल</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-background/80">+९७७-१-XXXXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-background/80">info@bakaiyadarpan.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm text-background/60">
          <p>© {new Date().getFullYear()} प्रेस दर्पण। सर्वाधिकार सुरक्षित।</p>
        </div>
      </div>
    </footer>
  );
}
