
import React from 'react';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';
import { APP_NAME } from '../constants';
import { Navbar } from './Navbar';

interface LandingLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  onLogin: () => void;
  activePage: string;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children, onNavigate, onLogin, activePage }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      
      <Navbar onNavigate={onNavigate} onLogin={onLogin} activePage={activePage} />

      {/* Page Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Shield className="w-5 h-5 text-emerald-500" />
              {APP_NAME}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              The enterprise standard for secure, compliant, and observable AI agent orchestration.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-slate-500 hover:text-white"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-slate-500 hover:text-white"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><button onClick={() => onNavigate('features')} className="hover:text-emerald-400">Features</button></li>
              <li><button onClick={() => onNavigate('pricing')} className="hover:text-emerald-400">Pricing</button></li>
              <li><button onClick={() => onNavigate('docs')} className="hover:text-emerald-400">Documentation</button></li>
              <li><a href="#" className="hover:text-emerald-400">API Reference</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-emerald-400">About Us</a></li>
              <li><a href="#" className="hover:text-emerald-400">Careers</a></li>
              <li><a href="#" className="hover:text-emerald-400">Blog</a></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-emerald-400">Contact</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-emerald-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-400">Security (SOC2)</a></li>
              <li><a href="#" className="hover:text-emerald-400">GDPR</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
