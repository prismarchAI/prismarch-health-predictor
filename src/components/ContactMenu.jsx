import React from 'react';

export default function ContactMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop that closes the menu when clicking anywhere else on screen */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />

      {/* Premium Minimalist Menu Container */}
      <div className="absolute right-4 top-16 w-72 bg-white border border-neutral-200/80 rounded-2xl shadow-xl p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200 font-sans text-neutral-950">
        
        {/* Profile Card Header */}
        <div className="flex justify-between items-start border-b border-neutral-100 pb-4 mb-4">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block">Lead Architect</span>
            <h3 className="text-base font-bold tracking-tight mt-0.5">Goutham Jayan</h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">AI Engineer</p>
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-bold text-neutral-400 hover:text-neutral-950 px-1.5 py-0.5 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        {/* Professional Channels */}
        <div className="space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">Channels</span>
          
          <a 
            href="https://www.instagram.com/prismarchai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-xs text-neutral-600 hover:text-neutral-950 font-medium transition-colors py-1.5 px-2 rounded-lg hover:bg-neutral-50"
          >
            Instagram →
          </a>
          
          <a 
            href="https://www.linkedin.com/company/prismarch-ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-xs text-neutral-600 hover:text-neutral-950 font-medium transition-colors py-1.5 px-2 rounded-lg hover:bg-neutral-50"
          >
            LinkedIn Network →
          </a>

          <a 
            href="mailto:prismarchlabs@gmail.com"
            className="block text-xs text-neutral-600 hover:text-neutral-950 font-medium transition-colors py-1.5 px-2 rounded-lg hover:bg-neutral-50"
          >
            Direct Email Line →
          </a>
        </div>

        {/* Technical Footer Location Stamp */}
        <div className="border-t border-neutral-100 pt-4 mt-4 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
          Location: Trivandrum, Kerala, India
        </div>

      </div>
    </>
  );
}