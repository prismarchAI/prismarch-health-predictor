import React, { useState } from 'react'; // Added useState here!
import { Shield, LayoutDashboard, FileText, Menu } from 'lucide-react';
import ContactMenu from './ContactMenu'; // Make sure the path points to where you saved it

function Header() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-neutral-200/50">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="relative flex h-16 items-center justify-between">
      
      {/* Brand Text */}
      <p className="text-neutral-900 font-bold tracking-widest text-sm uppercase">
        PRISMARCH
      </p>

      {/* Interactive Menu Button */}
      <button
      onClick={() => setIsContactOpen(!isContactOpen)}
       className="text-neutral-600 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100/80 transition-all duration-200">
        <Menu className="h-5 w-5" />
      </button>
      {/* 4. PLACE THE COMPONENT RIGHT HERE */}
      <ContactMenu 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />

    </div>
  </div>
</header>
  );
}

export default Header;