import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navigation } from './Navigation'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <Navigation onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  )
}