
import React from 'react';
import { Mail, MessageSquare, MapPin } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-slate-400">We'd love to hear from you. Our team is ready to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                   <MessageSquare className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Chat Support</h3>
                   <p className="text-slate-400 mb-4">Our friendly team is here to help.</p>
                   <a href="#" className="text-emerald-400 font-medium hover:underline">Start a conversation</a>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                   <Mail className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
                   <p className="text-slate-400 mb-4">For general inquiries and sales.</p>
                   <a href="mailto:hello@agentsafe.com" className="text-blue-400 font-medium hover:underline">hello@agentsafe.com</a>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
               <div className="flex items-start gap-4">
                 <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                   <MapPin className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white mb-2">Office</h3>
                   <p className="text-slate-400">
                     100 Security Way<br />
                     San Francisco, CA 94105<br />
                     United States
                   </p>
                 </div>
               </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                 <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-emerald-500" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                 <textarea rows={4} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-emerald-500"></textarea>
              </div>
              <button type="button" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
