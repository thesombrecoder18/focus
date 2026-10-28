import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FR } from '@/i18n/fr';
import { APP_CONFIG } from '@/config/app';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Eye, EyeOff, Lock, Mail, User, KeyRound, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, register, loginAsDemo, forgotPassword } = useAuth();

  const [mode, setMode] = useState<'connexion' | 'inscription' | 'oubli'>('connexion');

  // Form states
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [mdpConfirm, setMdpConfirm] = useState('');
  const [nom, setNom] = useState('');
  const [codeInvitation, setCodeInvitation] = useState('');
  const [cguAcceptees, setCguAcceptees] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(mdp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'connexion') {
        const res = await login(email, mdp);
        if (!res.success) setError(res.error || FR.errors.generique);
      } else if (mode === 'inscription') {
        if (!cguAcceptees) {
          setError('Veuillez accepter les conditions d\'utilisation.');
          setIsLoading(false);
          return;
        }
        if (mdp !== mdpConfirm) {
          setError(FR.auth.motsDePasseDifferents);
          setIsLoading(false);
          return;
        }
        const res = await register(nom, email, mdp, codeInvitation);
        if (!res.success) setError(res.error || FR.errors.generique);
      } else if (mode === 'oubli') {
        const res = await forgotPassword(email);
        setSuccessMsg(res.message);
      }
    } catch (err) {
      console.error(err);
      setError(FR.errors.generique);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#F7F8FA] dark:bg-[#0E1014]">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center font-bold text-2xl shadow-md mx-auto mb-3">
          E
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
          {APP_CONFIG.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 font-medium">
          {APP_CONFIG.baseline}
        </p>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 space-y-5">
        <div className="text-center">
          <h2 className="text-lg font-bold text-[#111827] dark:text-[#F3F4F6]">
            {mode === 'connexion'
              ? FR.auth.titreConnexion
              : mode === 'inscription'
              ? FR.auth.titreInscription
              : "Mot de passe oublié"}
          </h2>
          {mode === 'inscription' && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
              {FR.auth.sousTitreInscription} (ex. {APP_CONFIG.defaultInviteCode})
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-start p-3 rounded-btn bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start p-3 rounded-btn bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'inscription' && (
            <>
              <Input
                label={FR.auth.nomComplet}
                placeholder="Baye Elimane Ka"
                value={nom}
                onChange={e => setNom(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label={FR.auth.codeInvitationRequis}
                placeholder={FR.auth.codeInvitationPlaceholder}
                value={codeInvitation}
                onChange={e => setCodeInvitation(e.target.value)}
                icon={<KeyRound className="w-4 h-4 text-indigo-500" />}
                required
                helpText="Code fourni par le créateur de l'application."
              />
            </>
          )}

          <Input
            label={FR.auth.email}
            type="email"
            placeholder="etudiant@esp.sn"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />

          {mode !== 'oubli' && (
            <div className="space-y-1.5">
              <Input
                label={FR.auth.motDePasse}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={mdp}
                onChange={e => setMdp(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              {/* Password strength indicator */}
              {mode === 'inscription' && mdp.length > 0 && (
                <div className="flex items-center space-x-1 pt-1">
                  {[1, 2, 3, 4].map(step => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full ${
                        strength >= step
                          ? strength >= 3
                            ? 'bg-emerald-500'
                            : strength === 2
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {mode === 'inscription' && (
            <div className="space-y-3">
              <Input
                label={FR.auth.confirmationMotDePasse}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={mdpConfirm}
                onChange={e => setMdpConfirm(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <label className="flex items-start space-x-2 text-xs text-[#6B7280] dark:text-[#9CA3AF] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={cguAcceptees}
                  onChange={e => setCguAcceptees(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{FR.auth.cguLabel}</span>
              </label>
            </div>
          )}

          {mode === 'connexion' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('oubli')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {FR.actions.motDePasseOublie}
              </button>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={isLoading}>
            {isLoading
              ? "Patientez..."
              : mode === 'connexion'
              ? FR.actions.seConnecter
              : mode === 'inscription'
              ? FR.actions.creerCompte
              : FR.actions.reinitialiser}
          </Button>
        </form>

        {/* Demo Fast Login Button */}
        <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#262B35]">
          <Button
            type="button"
            variant="outline"
            fullWidth
            icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
            onClick={() => loginAsDemo()}
          >
            {FR.auth.demoRapide}
          </Button>
        </div>

        {/* Switch mode links */}
        <div className="text-center pt-2">
          {mode === 'connexion' ? (
            <button
              type="button"
              onClick={() => {
                setMode('inscription');
                setError(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {FR.auth.pasDeCompte}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('connexion');
                setError(null);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {FR.auth.dejaCompte}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};
