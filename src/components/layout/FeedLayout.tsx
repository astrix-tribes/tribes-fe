import React, { useState, useMemo } from 'react';

interface FeedLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function FeedLayout({ children, rightSidebar }: FeedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-[800px] mx-auto lg:mx-0">
            {children}
          </div>

          {/* Right Sidebar */}
          {rightSidebar && (
            <div className="hidden lg:block w-[380px] flex-shrink-0">
              {rightSidebar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 