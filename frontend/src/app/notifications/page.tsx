'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Filter, MailOpen, Package, Star, Trash2 } from 'lucide-react';
import Navigation from '@/components/ui/Navigation';

export type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'order' | 'promo' | 'review' | 'system';
};

const initialNotifications: Notification[] = [
  { id: 'n1', title: 'Order Shipped', message: 'Your order #12345 has been shipped.', time: '2h ago', read: false, type: 'order' },
  { id: 'n2', title: 'Limited Offer!', message: 'Get 20% off on selected items this weekend.', time: '5h ago', read: false, type: 'promo' },
  { id: 'n3', title: 'Review Reminder', message: 'Don\'t forget to review your recent purchase.', time: '1d ago', read: true, type: 'review' },
  { id: 'n4', title: 'System Update', message: 'We\'ve updated our privacy policy.', time: '3d ago', read: true, type: 'system' },
];

const iconFor = (type?: Notification['type']) => {
  switch (type) {
    case 'order':
      return <Package className="h-5 w-5 text-blue-600" />;
    case 'promo':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'review':
      return <MailOpen className="h-5 w-5 text-purple-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const filtered = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.read;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 rounded-full px-4 py-2 mb-3">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Inbox</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl">Mark all read</button>
            <button onClick={clearAll} className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl">Clear all</button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-semibold">Filter</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${filter==='all'?'bg-blue-100 text-blue-700':'hover:bg-gray-100 text-gray-700'}`}>All</button>
            <button onClick={() => setFilter('unread')} className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${filter==='unread'?'bg-blue-100 text-blue-700':'hover:bg-gray-100 text-gray-700'}`}>Unread</button>
            <button onClick={() => setFilter('read')} className={`px-3 py-1.5 text-xs font-semibold rounded-xl ${filter==='read'?'bg-blue-100 text-blue-700':'hover:bg-gray-100 text-gray-700'}`}>Read</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 divide-y divide-gray-100">
            {filtered.map(n => (
              <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                <div className="mt-0.5">{iconFor(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {!n.read && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> New
                      </span>
                    )}
                    <span className="text-[11px] text-gray-500">{n.time}</span>
                  </div>
                </div>
                <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

