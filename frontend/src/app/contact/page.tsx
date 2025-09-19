'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import Navigation from '@/components/ui/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: '', email: '', message: '' });
      alert('Thanks! Your message has been sent.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation cartCount={0} user={user} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">We'd love to hear from you</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Have a question or feedback? Send us a message and our team will get back to you within 24 hours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Email</h3>
              </div>
              <p className="text-gray-600">support@storeonline.com</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Phone</h3>
              </div>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Address</h3>
              </div>
              <p className="text-gray-600">123 Market Street, San Francisco, CA</p>
            </div>

            {/* Socials */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-500" href="#"><Facebook className="h-5 w-5" /></a>
                <a className="w-10 h-10 bg-sky-400 rounded-xl flex items-center justify-center text-white hover:bg-sky-300" href="#"><Twitter className="h-5 w-5" /></a>
                <a className="w-10 h-10 bg-pink-600 rounded-xl flex items-center justify-center text-white hover:bg-pink-500" href="#"><Instagram className="h-5 w-5" /></a>
                <a className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center text-white hover:bg-blue-600" href="#"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                  <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} type="email" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white" placeholder="Enter your email" />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white h-40" placeholder="How can we help you?" />
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>We typically reply within 24 hours</span>
                </div>
                <button disabled={submitting} className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50">
                  {submitting ? (<><Loader2 className="h-5 w-5 animate-spin"/>Sending...</>) : (<><Send className="h-5 w-5"/>Send Message</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

