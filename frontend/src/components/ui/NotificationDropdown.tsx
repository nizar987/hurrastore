"use client";

import React from "react";
import Link from "next/link";
import { Bell, CheckCircle2, MailOpen, Package, Star, Truck } from "lucide-react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string; // e.g., "2h ago"
  read: boolean;
  type?: "order" | "promo" | "review" | "system";
};

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
}

const typeIcon = (type?: NotificationItem["type"]) => {
  switch (type) {
    case "order":
      return <Package className="h-4 w-4 text-blue-600" />;
    case "promo":
      return <Star className="h-4 w-4 text-yellow-500" />;
    case "review":
      return <MailOpen className="h-4 w-4 text-purple-600" />;
    case "system":
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onMarkAllRead }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Bell className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-700 font-medium">You're all caught up</p>
          <p className="text-xs text-gray-500 mt-1">No new notifications right now</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-auto">
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{n.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {!n.read && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> New
                        </span>
                      )}
                      <span className="text-[11px] text-gray-500">{n.time}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 bg-white">
        <Link href="/notifications" className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;

