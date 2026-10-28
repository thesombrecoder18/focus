import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sun,
  BookOpen,
  Calendar,
  Users,
  BookmarkCheck,
  BookMarked,
  Settings,
  LogOut,
  Moon,
  Laptop
} from 'lucide-react';
import { clsx } from 'clsx';
import { FR } from '@/i18n/fr';
import { APP_CONFIG } from '@/config/app';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const DesktopSidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();

  const navItems = [
    { to: '/', label: FR.nav.aujourdhui, icon: Sun },
    { to: '/etudes', label: FR.nav.etudes, icon: BookOpen },
    { to: '/calendrier', label: FR.nav.calendrier, icon: Calendar },
    { to: '/clubs', label: FR.nav.clubs, icon: Users, badge: 'Phase 2' },
    { to: '/revisions', label: FR.nav.revisions, icon: BookmarkCheck, badge: 'Phase 2' },
    { to: '/journal', label: FR.nav.journal, icon: BookMarked, badge: 'Phase 3' },
  ];

  return (
    <aside
      aria-label="Sidebar bureau"
      className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bottom-0 z-40 select-none flex-shrink-0"
    >
      <div
        className="flex flex-col h-full border-r border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#131721] shadow-sm dark:shadow-[var(--elizo-shadow)] transition-colors duration-300"
      >
        {/* Brand logo header */}
        <div className="flex items-center px-6 h-18 py-5 border-b border-[#E5E7EB] dark:border-[#262B35]">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0 mr-3">
            E
          </div>
          <div>
            <h1 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] tracking-tight leading-none">
              {APP_CONFIG.name}
            </h1>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">
              {APP_CONFIG.baseline}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center px-3.5 py-2.5 rounded-[var(--elizo-radius-btn)] text-sm font-medium transition-all duration-200 ease-in-out group",
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8] font-semibold border-r-2 border-indigo-500 dark:border-indigo-400"
                      : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111827] dark:hover:text-[#F3F4F6] border-r-2 border-transparent"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={clsx(
                        "w-5 h-5 mr-3 flex-shrink-0 transition-colors duration-200",
                        isActive
                          ? "text-[#4F46E5] dark:text-[#818CF8]"
                          : "text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#111827] dark:group-hover:text-[#F3F4F6]"
                      )}
                      strokeWidth={isActive ? 2.2 : 1.75}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#E5E7EB] dark:bg-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Footer Area */}
        <div className="p-4 border-t border-[#E5E7EB] dark:border-[#262B35] space-y-3">
          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              clsx(
                "flex items-center px-3.5 py-2.5 rounded-[var(--elizo-radius-btn)] text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-[#818CF8]"
                  : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111827] dark:hover:text-[#F3F4F6]"
              )
            }
          >
            <Settings className="w-5 h-5 mr-3" strokeWidth={1.75} />
            <span>{FR.nav.parametres}</span>
          </NavLink>

          {/* Theme quick toggle */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-[var(--elizo-radius-btn)] bg-[#F7F8FA] dark:bg-[#0E1014] text-xs border border-[#E5E7EB] dark:border-[#262B35]">
            <span className="text-[#6B7280] dark:text-[#9CA3AF]">{FR.nav.theme}</span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                title="Clair"
                className={clsx(
                  "p-1 rounded-md transition-all duration-200",
                  theme === 'light' ? "bg-white dark:bg-[#161922] text-indigo-600 shadow-xs" : "text-[#6B7280]"
                )}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Sombre"
                className={clsx(
                  "p-1 rounded-md transition-all duration-200",
                  theme === 'dark' ? "bg-white dark:bg-[#161922] text-indigo-400 shadow-xs" : "text-[#6B7280]"
                )}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                title="Système"
                className={clsx(
                  "p-1 rounded-md transition-all duration-200",
                  theme === 'system' ? "bg-white dark:bg-[#161922] text-indigo-500 shadow-xs" : "text-[#6B7280]"
                )}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* User details and Logout */}
          {currentUser && (
            <div className="flex items-center justify-between px-3.5 py-2">
              <div className="truncate pr-2">
                <p className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                  {currentUser.nom}
                </p>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                  {currentUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                title={FR.nav.deconnexion}
                className="p-1.5 rounded-[var(--elizo-radius-btn)] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
