import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { seedDemoDataForUser, invitationRepo } from '@/repositories';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, mdp: string) => Promise<{ success: boolean; error?: string }>;
  register: (nom: string, email: string, mdp: string, codeInvitation: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session
    const saved = localStorage.getItem('elizo_current_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse current user', e);
      }
    } else {
      // First launch auto-login as Baye Eli with demo seed
      loginAsDemo();
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, mdp: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !mdp) {
      return { success: false, error: 'Veuillez saisir votre email et mot de passe.' };
    }
    const allUsers: User[] = JSON.parse(localStorage.getItem('elizo_users') || '[]');
    const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return { success: false, error: 'Compte introuvable. As-tu un code d\'invitation ?' };
    }

    setCurrentUser(found);
    localStorage.setItem('elizo_current_user', JSON.stringify(found));
    return { success: true };
  };

  const register = async (
    nom: string,
    email: string,
    mdp: string,
    codeInvitation: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!nom || !email || !mdp || !codeInvitation) {
      return { success: false, error: 'Tous les champs sont obligatoires.' };
    }

    if (mdp.length < 8) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 8 caractères.' };
    }

    const isCodeValid = await invitationRepo.validateCode(codeInvitation);
    if (!isCodeValid) {
      return { success: false, error: 'Code d\'invitation invalide ou expiré.' };
    }

    const allUsers: User[] = JSON.parse(localStorage.getItem('elizo_users') || '[]');
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      nom,
      email,
      role: 'etudiant',
      createdAt: new Date().toISOString(),
    };

    allUsers.push(newUser);
    localStorage.setItem('elizo_users', JSON.stringify(allUsers));
    localStorage.setItem('elizo_current_user', JSON.stringify(newUser));

    // Seed initial demo data for the new student
    seedDemoDataForUser(newUser.id);

    setCurrentUser(newUser);
    return { success: true };
  };

  const loginAsDemo = async (): Promise<void> => {
    const demoUserId = 'user_baye_eli';
    const allUsers: User[] = JSON.parse(localStorage.getItem('elizo_users') || '[]');
    let demoUser = allUsers.find(u => u.id === demoUserId);

    if (!demoUser) {
      demoUser = {
        id: demoUserId,
        nom: 'Baye Elimane Ka',
        email: 'baye@elizo.sn',
        role: 'proprietaire',
        createdAt: new Date().toISOString(),
      };
      allUsers.push(demoUser);
      localStorage.setItem('elizo_users', JSON.stringify(allUsers));
      // Seed demo data
      seedDemoDataForUser(demoUserId);
    }

    setCurrentUser(demoUser);
    localStorage.setItem('elizo_current_user', JSON.stringify(demoUser));
  };

  const logout = () => {
    localStorage.removeItem('elizo_current_user');
    setCurrentUser(null);
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    return {
      success: true,
      message: `Un lien de réinitialisation fictif a été généré pour ${email}. En Phase 3, un vrai e-mail sera envoyé via Cloud Functions.`,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
