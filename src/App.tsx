import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DataProvider } from '@/context/DataContext';
import { AppShell } from '@/components/layout/AppShell';
import { AuthScreen } from '@/features/auth/AuthScreen';
import { AujourdhuiView } from '@/features/aujourdhui/AujourdhuiView';
import { EtudesView } from '@/features/etudes/EtudesView';
import { CalendrierView } from '@/features/calendrier/CalendrierView';
import { ClubsPlaceholder } from '@/features/clubs/ClubsPlaceholder';
import { RevisionsPlaceholder } from '@/features/revisions/RevisionsPlaceholder';
import { JournalPlaceholder } from '@/features/journal/JournalPlaceholder';
import { SettingsView } from '@/features/settings/SettingsView';

interface ShellContextType {
  onOpenImport: () => void;
  onOpenDevoir: () => void;
  onOpenEvenement: () => void;
  onOpenRevision: () => void;
}

const ProtectedRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] dark:bg-[#0E1014]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
};

const AujourdhuiRoute: React.FC = () => {
  const context = useOutletContext<ShellContextType>();
  return (
    <AujourdhuiView
      onOpenImport={context.onOpenImport}
      onOpenDevoir={context.onOpenDevoir}
      onOpenEvenement={context.onOpenEvenement}
      onOpenRevision={context.onOpenRevision}
    />
  );
};

const EtudesRoute: React.FC = () => {
  const context = useOutletContext<ShellContextType>();
  return <EtudesView onOpenImport={context.onOpenImport} />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoutes />}>
              <Route index element={<AujourdhuiRoute />} />
              <Route path="etudes" element={<EtudesRoute />} />
              <Route path="calendrier" element={<CalendrierView />} />
              <Route path="clubs" element={<ClubsPlaceholder />} />
              <Route path="revisions" element={<RevisionsPlaceholder />} />
              <Route path="journal" element={<JournalPlaceholder />} />
              <Route path="parametres" element={<SettingsView />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
