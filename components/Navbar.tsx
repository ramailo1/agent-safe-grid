
import React, { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { APP_NAME } from '../constants';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  onLogin?: () => void;
  activePage?: string;
  simpleMode?: boolean; // Used for Auth page to avoid recursive navigation issues
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onLogin, activePage, simpleMode = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'docs', label: 'Documentation' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      // Fallback if no handler (e.g. on Auth page, maybe redirect to root)
      window.location.href = '/'; 
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 group">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">{APP_NAME}</span>
          </button>

          {/* Desktop Nav */}
          {!simpleMode && (
            <nav className="hidden md:flex gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`text-sm font-medium transition-colors ${
                    activePage === item.id 
                      ? 'text-emerald-400' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
             {simpleMode ? (
                <span className="text-sm text-slate-400">Already have an account?</span>
             ) : (
                <button 
                  onClick={onLogin}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
             )}
            <button 
              onClick={onLogin}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40"
            >
              {simpleMode ? 'Log In' : 'Start Free Trial'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          {!simpleMode && (
            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && !simpleMode && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`block w-full text-left px-3 py-3 rounded-lg text-base font-medium ${
                  activePage === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 flex flex-col gap-3 border-t border-slate-800 mt-4">
              <button onClick={onLogin} className="w-full text-center py-2 text-slate-300 font-medium border border-slate-700 rounded-lg">
                Log In
              </button>
              <button onClick={onLogin} className="w-full text-center py-2 bg-emerald-600 text-white font-bold rounded-lg">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
