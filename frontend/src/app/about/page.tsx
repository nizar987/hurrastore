'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Award,
  Target,
  Heart,
  Shield,
  Truck,
  Star,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Mail,
  Sparkles
} from 'lucide-react';
import Navigation from '@/components/ui/Navigation';
import { useAuth } from '@/contexts/AuthContext';

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Chief Executive Officer',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1fd?w=400&h=400&fit=crop&crop=face',
    bio: 'Visionary leader with 15+ years in e-commerce, driving innovation and growth.'
  },
  {
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Tech enthusiast building scalable solutions for the future of online shopping.'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Customer Experience',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    bio: 'Passionate about creating exceptional customer journeys and satisfaction.'
  },
  {
    name: 'David Kim',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    bio: 'Operations expert ensuring smooth logistics and efficient supply chain management.'
  }
];

const stats = [
  { number: '100K+', label: 'Happy Customers', icon: Users },
  { number: '50K+', label: 'Products Sold', icon: Award },
  { number: '99.5%', label: 'Customer Satisfaction', icon: Heart },
  { number: '24/7', label: 'Customer Support', icon: Shield }
];

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description: 'We carefully curate every product to ensure exceptional quality and value for our customers.'
  },
  {
    icon: Heart,
    title: 'Customer-Centric',
    description: 'Your satisfaction is our priority. We go above and beyond to exceed your expectations.'
  },
  {
    icon: Truck,
    title: 'Fast & Reliable',
    description: 'Quick delivery and reliable service you can count on, every single time.'
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Serving customers worldwide with localized experiences and global standards.'
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Your data and transactions are protected with industry-leading security measures.'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'Constantly evolving our platform with the latest technology and features.'
  }
];

const AboutPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation cartCount={0} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Our Story</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            About StoreOnline
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            We're not just another online store. We're a community of passionate individuals dedicated to bringing you the best products, exceptional service, and unforgettable shopping experiences.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 rounded-full px-4 py-2 mb-6">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Revolutionizing Online Shopping
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded in 2020 with a simple yet powerful vision: to create an online shopping experience that combines convenience, quality, and exceptional customer service. What started as a small team with big dreams has grown into a trusted platform serving customers worldwide.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We believe shopping should be enjoyable, secure, and effortless. That's why we've built our platform with cutting-edge technology, partnered with trusted suppliers, and assembled a team of dedicated professionals who share our commitment to excellence.
              </p>
              <div className="flex gap-4">
                <Link href="/products">
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                    Shop Now
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300">
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1560472355-536de3962603?w=600&h=400&fit=crop"
                  alt="Our team at work"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 rounded-full px-4 py-2 mb-4">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Our Values</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              What Drives Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our core values shape everything we do, from product selection to customer service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 rounded-full px-4 py-2 mb-4">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Meet the Team</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              The People Behind StoreOnline
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our passionate team is dedicated to making your shopping experience exceptional
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Star className="h-5 w-5" />
                <span className="font-medium">Join Our Community</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Ready to Experience the Difference?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust StoreOnline for their shopping needs
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register">
                  <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 shadow-xl">
                    Get Started Today
                  </button>
                </Link>
                <Link href="/products">
                  <button className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 border border-white/20">
                    Browse Products
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .animate-fade-in {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
