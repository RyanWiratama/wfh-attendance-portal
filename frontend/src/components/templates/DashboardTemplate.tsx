import React, { useState } from 'react';
import { Sidebar } from '../organisms/Sidebar';
import { Navbar } from '../organisms/Navbar';
import { ToastContainer } from '../molecules/ToastContainer';

export interface DashboardTemplateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  title,
  description,
  actions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Desktop fixed/static, Mobile drawer) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={title}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Header section if title or actions are provided */}
          {(title || description || actions) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {description}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {actions}
                </div>
              )}
            </div>
          )}

          {/* Children View */}
          <div className="w-full">{children}</div>
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};
