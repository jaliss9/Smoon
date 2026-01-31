"use client";

interface MoonProps {
  phaseValue: number; // 0 = nouvelle lune, 0.5 = pleine lune, 1 = nouvelle lune
  illumination: number; // 0-100
}

export default function Moon({ phaseValue, illumination }: MoonProps) {
  const isFullMoon = illumination >= 95;
  const isNewMoon = illumination <= 5;
  
  // Calculer quelle partie est illuminée
  // phaseValue 0-0.5 : croissant à pleine (illuminé à droite puis tout)
  // phaseValue 0.5-1 : pleine à nouvelle (ombre vient de droite)
  
  const brightness = Math.round(40 + (illumination * 0.6)); // 40-100% de luminosité
  const glowIntensity = illumination / 100;
  
  // Position de l'ombre (pour simuler les phases)
  // 0 = nouvelle lune (tout sombre), 0.5 = pleine (pas d'ombre), 1 = nouvelle
  let shadowPosition: string;
  let shadowOpacity: number;
  
  if (phaseValue <= 0.5) {
    // Croissant vers pleine : ombre vient de la gauche et diminue
    shadowPosition = 'left';
    shadowOpacity = 1 - (phaseValue * 2); // 1 -> 0
  } else {
    // Pleine vers nouvelle : ombre vient de la droite et augmente
    shadowPosition = 'right';
    shadowOpacity = (phaseValue - 0.5) * 2; // 0 -> 1
  }

  return (
    <div style={{
      position: 'relative',
      width: '220px',
      height: '220px',
      margin: '0 auto',
      animation: isFullMoon ? 'moonPulse 3s ease-in-out infinite' : 'none'
    }}>
      {/* Halo externe */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        left: '-30px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: isFullMoon 
          ? 'radial-gradient(circle, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.03) 40%, transparent 70%)'
          : `radial-gradient(circle, rgba(255,255,255,${0.1 * glowIntensity}) 0%, transparent 70%)`,
        filter: isFullMoon ? 'blur(20px)' : 'blur(15px)',
        animation: isFullMoon ? 'goldenGlow 2s ease-in-out infinite' : 'none'
      }} />
      
      {/* Corps de la lune */}
      <div style={{
        position: 'relative',
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        background: isFullMoon
          ? 'radial-gradient(ellipse 70% 60% at 30% 30%, #fffef0 0%, #e8e4d4 30%, #c9c5b5 60%, #a8a598 100%)'
          : `radial-gradient(ellipse 70% 60% at 30% 30%, 
              rgb(${brightness + 20}, ${brightness + 18}, ${brightness + 10}) 0%, 
              rgb(${brightness}, ${brightness - 5}, ${brightness - 10}) 30%, 
              rgb(${brightness - 20}, ${brightness - 25}, ${brightness - 30}) 60%, 
              rgb(${brightness - 40}, ${brightness - 45}, ${brightness - 50}) 100%)`,
        boxShadow: isFullMoon
          ? '0 0 50px 15px rgba(255,215,0,0.2), 0 0 80px 30px rgba(255,215,0,0.1), inset -20px -15px 40px rgba(0,0,0,0.1)'
          : `0 0 ${40 * glowIntensity}px ${15 * glowIntensity}px rgba(255,255,255,${0.15 * glowIntensity}), 
             inset -35px -20px 60px rgba(0,0,0,${0.3 + (1 - glowIntensity) * 0.4})`,
        overflow: 'hidden'
      }}>
        {/* Ombre de phase */}
        {!isFullMoon && !isNewMoon && shadowOpacity > 0.05 && (
          <div style={{
            position: 'absolute',
            top: 0,
            [shadowPosition]: 0,
            width: `${shadowOpacity * 100}%`,
            height: '100%',
            background: shadowPosition === 'left'
              ? 'linear-gradient(to right, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)'
              : 'linear-gradient(to left, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.7) 60%, transparent 100%)',
            borderRadius: '50%'
          }} />
        )}
        
        {/* Cratères (visibles seulement si assez illuminé) */}
        {illumination > 20 && (
          <>
            <div style={{
              position: 'absolute',
              top: '25%',
              left: '30%',
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, transparent 0%, rgba(0,0,0,${0.1 * glowIntensity}) 100%)`,
              opacity: glowIntensity
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '55%',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, transparent 0%, rgba(0,0,0,${0.08 * glowIntensity}) 100%)`,
              opacity: glowIntensity
            }} />
            <div style={{
              position: 'absolute',
              top: '65%',
              left: '25%',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, transparent 0%, rgba(0,0,0,${0.12 * glowIntensity}) 100%)`,
              opacity: glowIntensity
            }} />
          </>
        )}
      </div>
    </div>
  );
}
