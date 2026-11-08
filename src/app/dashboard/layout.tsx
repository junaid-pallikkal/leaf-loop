import React from 'react';
import UserSidebar from '@/components/layout/UserSidebar';
import WorkspaceHeader from '@/components/layout/WorkspaceHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7FAF7] flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Left Persistent User Sidebar (Desktop Sticky + Mobile Drawer & Bottom Nav) */}
      <UserSidebar />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <WorkspaceHeader />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
