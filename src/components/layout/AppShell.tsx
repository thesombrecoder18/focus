import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MobileTabBar } from './MobileTabBar';
import { DesktopSidebar } from './DesktopSidebar';
import { FloatingActionButton } from './FloatingActionButton';
import { ImportModal } from '@/features/import/ImportModal';
import { AddDevoirModal } from '@/components/forms/AddDevoirModal';
import { AddEvenementModal } from '@/components/forms/AddEvenementModal';
import { APP_CONFIG } from '@/config/app';
import { FR } from '@/i18n/fr';
import { useTheme } from '@/context/ThemeContext';
import { AppLogo } from '@/components/ui/AppLogo';
import { Sun, Moon, Upload } from 'lucide-react';

export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme, resolvedTheme } = useTheme();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDevoirOpen, setIsDevoirOpen] = useState(false);
  const [isEvenementOpen, setIsEvenementOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background layer */}
      <div className="fixed inset-0 z-0 bg-[#F7F8FA] dark:bg-[#0F1117] transition-colors duration-300" />

      {/* Desktop Fixed Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Mobile Top Header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/80 dark:bg-[#131721]/80 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#262B35]">
          <AppLogo size={32} showName />

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="p-2 rounded-full text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all duration-200"
              title={FR.actions.importer}
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all duration-200"
              title="Changer de thème"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24">
          <Outlet
            context={{
              onOpenImport: () => setIsImportOpen(true),
              onOpenDevoir: () => setIsDevoirOpen(true),
              onOpenEvenement: () => setIsEvenementOpen(true),
              onOpenRevision: () => navigate('/revisions'),
            }}
          />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar />

      {/* Mobile Floating Action Button */}
      <FloatingActionButton
        onOpenImport={() => setIsImportOpen(true)}
        onOpenDevoir={() => setIsDevoirOpen(true)}
        onOpenEvenement={() => setIsEvenementOpen(true)}
        onOpenRevision={() => navigate('/revisions')}
      />

      {/* Modals available everywhere */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <AddDevoirModal
        isOpen={isDevoirOpen}
        onClose={() => setIsDevoirOpen(false)}
      />

      <AddEvenementModal
        isOpen={isEvenementOpen}
        onClose={() => setIsEvenementOpen(false)}
      />
    </div>
  );
};
