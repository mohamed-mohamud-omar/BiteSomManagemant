import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

const Contact = () => {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Get in Touch</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base">
              Have questions, feedback, or need help with an order? Send us a message and our support team will reply within 24 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand/10 text-brand rounded-2xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xs text-slate-400 font-extrabold uppercase">Phone Support</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">+252 61 111 2222</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-accent rounded-2xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xs text-slate-400 font-extrabold uppercase">Email Support</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">support@bitesom.com</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-2xs text-slate-400 font-extrabold uppercase">Mogadishu Office</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">KM4 Plaza, Hodan, Somalia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-card p-8">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold">Message Sent Successfully!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Thank you for reaching out. We will get back to you as soon as possible.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-brand text-white font-bold rounded-xl text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold">Send a Message</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmed"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmed@example.com"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand hover:bg-brand-700 text-white font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
