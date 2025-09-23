'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, ChevronDown } from 'lucide-react';

export function UserProfile() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || 'User'}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.displayName || '사용자'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {user.displayName || '사용자'}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}