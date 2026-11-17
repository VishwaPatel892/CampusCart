import Link from "next/link";
import { ShoppingBag, Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#090711] border-t border-[#302641] text-[#A1A1AA] pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#302641]/60">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-[#1E1930] p-1.5 rounded-lg text-[#A855F7] border border-[#302641]">
                <ShoppingBag size={20} />
              </div>
              <span className="text-lg font-bold text-[#F8FAFC]">
                Campus<span className="text-[#A855F7]">Cart</span>
              </span>
            </Link>
            <p className="text-xs text-[#71717A] leading-relaxed">
              The premier student-to-student marketplace for textbooks, electronics, dorm essentials, and study gear.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D8B4FE]">
              <Sparkles size={13} className="text-[#A855F7]" />
              <span>Campus verified listings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-[#A855F7] transition">
                  Explore All Products
                </Link>
              </li>
              <li>
                <Link href="/products?type=Free" className="hover:text-[#A855F7] transition">
                  Free Student Giveaways
                </Link>
              </li>
              <li>
                <Link href="/products?type=Exchange" className="hover:text-[#A855F7] transition">
                  Exchange & Barter
                </Link>
              </li>
              <li>
                <Link href="/products?category=Books" className="hover:text-[#A855F7] transition">
                  Textbooks & Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3">
              Student Hub
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/sell" className="hover:text-[#A855F7] transition">
                  List Item for Sale
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#A855F7] transition">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/enquiries" className="hover:text-[#A855F7] transition">
                  My Enquiries & Offers
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#A855F7] transition">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] mb-3">
              Campus Safety
            </h4>
            <div className="space-y-2 text-xs text-[#71717A]">
              <div className="flex items-start gap-1.5">
                <ShieldCheck size={14} className="text-[#22C55E] shrink-0 mt-0.5" />
                <span>Meet in well-lit campus spots (Library, SAC, Canteen).</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Heart size={14} className="text-[#A855F7] shrink-0 mt-0.5" />
                <span>Inspect items in person before finalizing payments.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
          <p>© 2026 CampusCart. Built for college students.</p>
          <p className="text-[11px]">Buy Smart. Sell Easy. Save More on Campus.</p>
        </div>
      </div>
    </footer>
  );
}
