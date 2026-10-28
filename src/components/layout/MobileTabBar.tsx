import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sun,
  BookOpen,
  Calendar,
  Users,
  MoreHorizontal,
  BookmarkCheck,
  BookMarked,
  Settings,
  LogOut,
  Moon,
  Laptop
} from 'lucide-react';
import { clsx } from 'clsx';
import { FR } from '@/i18n/fr';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BottomSheet } from '../ui/BottomSheet';

export const MobileTabBar: React.FC = () => {
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  const { logout, currentUser } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const mainTabs = [
    { to: '/', label: FR.nav.aujourdhui, icon: Sun },
    { to: '/etudes', label: FR.nav.etudes, icon: BookOpen },
    { to: '/calendrier', label: FR.nav.calendrier, icon: Calendar },
    { to: '/clubs', label: FR.nav.clubs, icon: Users },
  ];

  return (
    <>
      <nav
        aria-label="Navigation principale mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#131721]/90 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#262B35] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-3">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  clsx(
                    "flex flex-col items-center justify-center w-16 h-full py-1 text-[11px] font-medium transition-all duration-200 ease-in-out select-none",
                    isActive
                      ? "text-[#4F46E5] dark:text-[#818CF8]"
                      : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={clsx(
                        "p-1 rounded-xl transition-all duration-200 ease-in-out",
                        isActive && "bg-indigo-50 dark:bg-indigo-950/40"
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.75} />
                    </div>
                    <span className="mt-0.5 truncate">{tab.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Plus tab */}
          <button
            type="button"
            onClick={() => setIsPlusOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-full py-1 text-[11px] font-medium text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] transition-all duration-200 ease-in-out select-none"
          >
            <div className="p-1 rounded-xl transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5">
              <MoreHorizontal className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <span className="mt-0.5">{FR.nav.plus}</span>
          </button>
        </div>
      </nav>

      {/* Plus Bottom Sheet */}
      <BottomSheet
        isOpen={isPlusOpen}
        onClose={() => setIsPlusOpen(false)}
        title={FR.nav.plus}
      >
        <div className="flex flex-col space-y-1">
          <NavLink
            to="/revisions"
            onClick={() => setIsPlusOpen(false)}
            className="flex items-center px-4 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium text-[#111827] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            <BookmarkCheck className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400" />
            <span>{FR.nav.revisions}</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">Phase 2</span>
          </NavLink>

          <NavLink
            to="/journal"
            onClick={() => setIsPlusOpen(false)}
            className="flex items-center px-4 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium text-[#111827] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            <BookMarked className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
            <span>{FR.nav.journal}</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">Phase 3</span>
          </NavLink>

          <NavLink
            to="/parametres"
            onClick={() => setIsPlusOpen(false)}
            className="flex items-center px-4 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium text-[#111827] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
          >
            <Settings className="w-5 h-5 mr-3 text-[#6B7280] dark:text-[#9CA3AF]" />
            <span>{FR.nav.parametres}</span>
          </NavLink>

          <div className="h-px bg-[#E5E7EB] dark:bg-[#262B35] my-3" />

          {/* Theme switcher */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-3">
              {FR.nav.theme}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={clsx(
                  "flex items-center justify-center py-2 px-3 rounded-[var(--elizo-radius-btn)] text-xs font-medium border transition-all duration-200",
                  theme === 'light'
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                    : "border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]"
                )}
              >
                <Sun className="w-4 h-4 mr-1.5" />
                Clair
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={clsx(
                  "flex items-center justify-center py-2 px-3 rounded-[var(--elizo-radius-btn)] text-xs font-medium border transition-all duration-200",
                  theme === 'dark'
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                    : "border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]"
                )}
              >
                <Moon className="w-4 h-4 mr-1.5" />
                Sombre
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={clsx(
                  "flex items-center justify-center py-2 px-3 rounded-[var(--elizo-radius-btn)] text-xs font-medium border transition-all duration-200",
                  theme === 'system'
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
                    : "border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]"
                )}
              >
                <Laptop className="w-4 h-4 mr-1.5" />
                Système
              </button>
            </div>
          </div>

          <div className="h-px bg-[#E5E7EB] dark:bg-[#262B35] my-3" />

          {/* User & Logout */}
          {currentUser && (
            <div className="px-4 py-2">
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Connecté en tant que</p>
              <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">{currentUser.nom}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{currentUser.email}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsPlusOpen(false);
              logout();
            }}
            className="flex items-center w-full px-4 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>{FR.nav.deconnexion}</span>
          </button>
        </div>
      </BottomSheet>
    </>
  );
};
