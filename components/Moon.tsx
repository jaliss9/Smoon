"use client";

interface MoonProps {
  phase: number; // phase de 0 à 1
  illumination: number; // illumination de 0 à 100
}

export default function Moon({ phase, illumination }: MoonProps) {
  // Protection contre les valeurs invalides
  const safePhase = typeof phase === 'number' && !isNaN(phase) ? phase : 0;
  const safeIllumination = typeof illumination === 'number' && !isNaN(illumination) ? Math.max(0, Math.min(100, illumination)) : 0;
  
  // Calcul sécurisé pour l'ombre de phase
  const shadowCoverage = 100 - safeIllumination;
  const shadowStart = Math.max(0, Math.min(100, 100 - shadowCoverage - 20));
  const shadowMid1 = Math.max(0, Math.min(100, 100 - shadowCoverage - 10));
  const shadowEnd = Math.max(0, Math.min(100, 100 - shadowCoverage));

  return (
    <div className="relative flex flex-col items-center pt-8 pb-[50px]">
      {/* Halo ambient */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(200,210,230,0.15),transparent)] blur-[40px] -z-10" />
      
      {/* Moon ring container */}
      <div 
        className="moon-ring"
        style={{
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(200,210,230,0.12) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 30px rgba(200,210,230,0.08)',
        }}
      >
        {/* Lune réaliste avec rotation */}
        <div 
          className="moon-surface animate-moon-rotate"
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            position: 'relative',
            background: 'radial-gradient(ellipse 70% 60% at 30% 30%, #fafafa 0%, #e8e8e8 15%, #d0d0d0 35%, #b0b0b0 55%, #888888 75%, #707070 90%, #606060 100%)',
            boxShadow: `
              inset -35px -20px 60px rgba(0,0,0,0.6),
              inset 20px 15px 50px rgba(255,255,255,0.12),
              0 10px 40px rgba(0,0,0,0.4),
              0 0 80px rgba(200,210,230,0.25),
              0 0 120px rgba(200,210,230,0.1)
            `,
            overflow: 'hidden'
          }}
        >
          {/* Cratère 1 - grand (réduit de 40px à 32px) */}
          <div style={{
            position: 'absolute',
            width: '32px',
            height: '32px',
            top: '22%',
            left: '18%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #b0b0b0 0%, #999999 60%, #888888 100%)',
            boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.15)'
          }} />
          
          {/* Cratère 2 - moyen droite (réduit de 32px à 26px) */}
          <div style={{
            position: 'absolute',
            width: '26px',
            height: '26px',
            top: '40%',
            left: '58%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #a8a8a8 0%, #999999 60%, #888888 100%)',
            boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.3), inset 1px 1px 3px rgba(255,255,255,0.12)'
          }} />
          
          {/* Cratère 3 - petit haut droite (réduit de 18px à 14px) */}
          <div style={{
            position: 'absolute',
            width: '14px',
            height: '14px',
            top: '18%',
            left: '55%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #aaaaaa 0%, #999999 60%, #888888 100%)',
            boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.25), inset 1px 1px 2px rgba(255,255,255,0.1)'
          }} />
          
          {/* Cratère 4 - moyen bas (réduit de 28px à 22px) */}
          <div style={{
            position: 'absolute',
            width: '22px',
            height: '22px',
            top: '62%',
            left: '35%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #a5a5a5 0%, #999999 60%, #888888 100%)',
            boxShadow: 'inset -2px -2px 5px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.1)'
          }} />
          
          {/* Cratère 5 - petit bas droite (réduit de 15px à 12px) */}
          <div style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            top: '70%',
            left: '60%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #a2a2a2 0%, #999999 60%, #888888 100%)',
            boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.25), inset 1px 1px 2px rgba(255,255,255,0.08)'
          }} />
          
          {/* Ombre de phase - couvre selon (100 - illumination)% depuis la gauche */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `linear-gradient(90deg, 
              rgba(8,8,15,0.95) 0%, 
              rgba(8,8,15,0.8) ${shadowStart}%, 
              rgba(8,8,15,0.4) ${shadowMid1}%,
              transparent ${shadowEnd}%
            )`,
            pointerEvents: 'none'
          }} />
        </div>
      </div>
    </div>
  );
}
