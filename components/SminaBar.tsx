"use client";

interface SminaBarProps {
  value: number; // valeur entre 0 et 100
}

export default function SminaBar({ value }: SminaBarProps) {
  // Position de l'étoile au-dessus de la barre, centrée selon la valeur
  const starPosition = `${Math.min(100, Math.max(0, value))}%`;

  return (
    <div className="relative">
      {/* Barre de progression */}
      <div className="bg-[rgba(255,255,255,0.08)] rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[rgba(180,160,220,0.6)] to-[rgba(220,200,255,0.9)] transition-all duration-300"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      
      {/* Étoile au-dessus de la barre avec glow animé */}
      <div
        className="absolute top-0 left-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 animate-smina-glow"
        style={{
          left: starPosition,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(220,200,255,0.7)) drop-shadow(0 0 12px rgba(200,180,255,0.4))',
            stroke: 'rgba(255,255,255,0.3)',
            strokeWidth: '1px',
            fill: 'rgba(230,215,255,0.95)'
          }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>
    </div>
  );
}
