import { Globe, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-8 text-blue-400" />
              <span className="text-xl text-white">NRITAX<span className="text-blue-400">.AI</span></span>
            </div>
            <p className="text-sm">
              AI-powered tax solutions for Non-Resident Indians navigating global tax complexities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Services</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tax Updates</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">AI Tax Assistant</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">CPA Consultation</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">DTAA Guidance</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tax Planning</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <a href="mailto:support@nritax.ai" className="hover:text-blue-400 transition-colors">
                  support@nritax.ai
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>+91 80 1234 5678</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5" />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} NRITAX.AI. All rights reserved.</p>
          <p className="mt-2 text-xs text-gray-500">
            ICAI Registered | DTAA Compliant | SOC 2 Certified
          </p>
        </div>
      </div>
    </footer>
  );
}
