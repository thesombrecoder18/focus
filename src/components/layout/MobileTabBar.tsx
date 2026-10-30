import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Laptop,
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
  const navigate = useNavigate();

  const mainTabs = [
    { to: '/', label: "Auj'hui", icon: Sun },
    { to: '/etudes', label: FR.nav.etudes, icon: BookOpen },
    { to: '/calendrier', label: FR.nav.calendrier, icon: Calendar },
    { to: '/clubs', label: FR.nav.clubs, icon: Users },
  ];

  return (
    <>
      <nav
        aria-label="Navigation principale mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#131721]/95 backdrop-blur-md border-t border-[#E5E7EB] dark:border-[#262B35] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around h-14 max-w-md mx-auto px-1">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center justify-center flex-1 h-full py-1.5 gap-0.5 transition-colors duration-150 select-none min-w-0',
                    isActive
                      ? 'text-[#4F46E5] dark:text-[#818CF8]'
                      : 'text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#6B7280] dark:hover:text-[#9CA3AF]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative flex items-center justify-center">
                      <Icon
                        className="w-5 h-5 flex-shrink-0"
                        strokeWidth={isActive ? 2.2 : 1.6}
                      />
                      {isActive && (
                        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#4F46E5] dark:bg-[#818CF8]" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium leading-none truncate max-w-full px-0.5 mt-1">
                      {tab.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Plus tab */}
          <button
            type="button"
            onClick={() => setIsPlusOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex flex-col items-center justify-center flex-1 h-full py-1.5 gap-0.5 text-[#9CA3AF] dark:text-[#6B7280] hover:text-[#6B7280] dark:hover:text-[#9CA3AF] transition-colors duration-150 select-none min-w-0"
          >
            <div className="flex items-center justify-center">
              <MoreHorizontal className="w-5 h-5" strokeWidth={1.6} />
            </div>
            <span className="text-[10px] font-medium leading-none mt-1">{FR.nav.plus}</span>
          </button>
        </div>
      </nav>

      {/* Plus Bottom Sheet */}
      <BottomSheet
        isOpen={isPlusOpen}
        onClose={() => setIsPlusOpen(false)}
        title="Menu"
      >
        <div className="flex flex-col space-y-0.5 pt-1">
          {/* Navigation secondaire */}
          <NavLink
            to="/revisions"
            onClick={() => setIsPlusOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                  : 'text-[#111827] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5'
              )
            }
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mr-3 flex-shrink-0">
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span>{FR.nav.revisions}</span>
          </NavLink>

          <NavLink
            to="/journal"
            onClick={() => setIsPlusOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                  : 'text-[#111827] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5'
              )
            }
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center mr-3 flex-shrink-0">
              <BookMarked className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span>{FR.nav.journal}</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-[#262B35] text-[#9CA3AF] dark:text-[#6B7280]">
              Bientôt
            </span>
          </NavLink>

          <NavLink
            to="/parametres"
            onClick={() => setIsPlusOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-3 rounded-[var(--elizo-radius-btn)] text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-[#111827] dark:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5'
              )
            }
          >
            <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] dark:bg-[#262B35] flex items-center justify-center mr-3 flex-shrink-0">
              <Settings className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            </div>
            <span>{FR.nav.parametres}</span>
          </NavLink>

          <div className="h-px bg-[#E5E7EB] dark:bg-[#262B35] my-2" />

          {/* Theme switcher */}
          <div className="px-3 py-2">
            <p className="text-[11px] font-semibold text-[#9CA3AF] dark:text-[#6B7280] uppercase tracking-wider mb-2">
              {FR.nav.theme}
            </p>
            <div className="flex gap-2">
              {([
                { value: 'light', label: 'Clair', Icon: Sun },
                { value: 'dark', label: 'Sombre', Icon: Moon },
                { value: 'system', label: 'Système', Icon: Laptop },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-[var(--elizo-radius-btn)] text-xs font-medium border transition-all duration-150',
                    theme === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                      : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#E5E7EB] dark:bg-[#262B35] my-2" />

          {/* User & Logout */}
          {currentUser && (
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {currentUser.nom?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                    {currentUser.nom}
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] dark:text-[#6B7280] truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsPlusOpen(false); logout(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--elizo-radius-btn)] text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ml-2 flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                {FR.nav.deconnexion}
              </button>
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
};
