import React from 'react';

/**
 * Logo Elizo Focus — SVG inline scalable.
 * Logomark : "E" géométrique + anneau de focus (lens).
 *
 * Usage :
 *   <AppLogo size={32} />          → icône seule
 *   <AppLogo size={32} showName /> → icône + nom de l'app
 */
interface AppLogoProps {
  /** Taille en px de l'icône carrée (défaut : 32) */
  size?: number;
  /** Afficher le nom de l'app à côté de l'icône */
  showName?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  showName = false,
  className = '',
}) => {
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="elizo-logo-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5B52EF" />
          <stop offset="100%" stopColor="#3730C8" />
        </linearGradient>
      </defs>

      {/* Fond arrondi — style iOS app icon */}
      <rect width="512" height="512" rx="116" fill="url(#elizo-logo-bg)" />

      {/* Spine verticale gauche */}
      <rect x="124" y="136" width="52" height="240" rx="8" fill="white" />

      {/* Barre haute — pleine largeur */}
      <rect x="124" y="136" width="248" height="52" rx="8" fill="white" />

      {/* Barre basse — pleine largeur */}
      <rect x="124" y="324" width="248" height="52" rx="8" fill="white" />

      {/* Barre médiane — s'arrête avant l'anneau */}
      <rect x="124" y="230" width="152" height="52" rx="8" fill="white" />

      {/* Anneau de focus (lens aperture) */}
      <circle cx="340" cy="256" r="42" stroke="white" strokeWidth="20" fill="none" />

      {/* Point focal central */}
      <circle cx="340" cy="256" r="11" fill="white" />
    </svg>
  );

  if (!showName) {
    return <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>;
  }

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <span className="leading-none select-none" style={{ fontSize: Math.round(size * 0.5) }}>
        <span className="font-extrabold tracking-tight text-[#111827] dark:text-[#F3F4F6]">
          Elizo
        </span>
        <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8] ml-0.5">
          {' '}Focus
        </span>
      </span>
    </span>
  );
};
