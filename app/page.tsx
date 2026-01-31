"use client";

import { useEffect, useState } from "react";
import { calculateMoonData, formatTime } from "@/lib/moon";
import { checkAndNotifyMoonVisibility, checkAndNotifyHighIllumination } from "@/lib/notifications";
import Header from "@/components/Header";
import Moon from "@/components/Moon";
import StatCard from "@/components/StatCard";
import StatCardWide from "@/components/StatCardWide";
import SminaCard from "@/components/SminaCard";

// Protection des imports
if (typeof window === 'undefined') {
  // Server-side, pas de problème
}

interface Location {
  lat: number;
  lon: number;
  name: string;
}

const LONDON_FALLBACK: Location = {
  lat: 51.5074,
  lon: -0.1278,
  name: "London, UK",
};

export default function Home() {
  console.log('1. Composant monté');
  
  // Tous les hooks au même niveau, sans conditions
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [location, setLocation] = useState<Location>(LONDON_FALLBACK);
  
  // Initialisation sécurisée de moonData
  const [moonData, setMoonData] = useState<ReturnType<typeof calculateMoonData>>(() => {
    console.log('1.1 Initialisation moonData');
    try {
      if (typeof window === 'undefined') {
        console.log('1.2 Server-side, valeurs par défaut');
        // Server-side, retourner des valeurs par défaut
        return {
          phase: 'Nouvelle lune',
          phaseValue: 0,
          illumination: 0,
          moonrise: null,
          moonset: null,
          daysUntilFullMoon: 15,
          visibilityDuration: null,
          distance: 384400,
          sminaValue: 5,
          altitude: 0,
        };
      }
      console.log('1.3 Client-side, calcul moonData');
      const data = calculateMoonData(LONDON_FALLBACK.lat, LONDON_FALLBACK.lon);
      console.log('1.4 moonData calculé:', data);
      // Vérifier que les données sont valides
      if (data && typeof data.illumination === 'number' && !isNaN(data.illumination)) {
        console.log('1.5 moonData valide');
        return data;
      }
      console.warn('1.6 moonData invalide');
      throw new Error('Invalid moonData returned');
    } catch (e) {
      console.error('Error initializing moonData:', e);
      console.error('Stack:', e instanceof Error ? e.stack : 'No stack');
      return {
        phase: 'Nouvelle lune',
        phaseValue: 0,
        illumination: 0,
        moonrise: null,
        moonset: null,
        daysUntilFullMoon: 15,
        visibilityDuration: null,
        distance: 384400,
        sminaValue: 5,
        altitude: 0,
      };
    }
  });

  // useEffect séparé pour isMounted - doit être le premier
  useEffect(() => {
    console.log('2. useEffect isMounted');
    setIsMounted(true);
  }, []);

  // Demander la géolocalisation au chargement
  useEffect(() => {
    if (!isMounted) return; // Attendre que le composant soit monté
    
    console.log('3. useEffect init démarré');
    
    const init = async () => {
      try {
        console.log('4. Début init');
        
        setIsLoading(true);

        // Vérifier si localStorage est disponible
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log('3.1 localStorage disponible');
          try {
            // Vérifier si on a une position sauvegardée
            const savedLocation = localStorage.getItem("smoon_location");
            if (savedLocation) {
              try {
                const parsed = JSON.parse(savedLocation);
                if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
                  setLocation(parsed);
                  const data = calculateMoonData(parsed.lat, parsed.lon);
                  setMoonData(data);
                  try {
                    if (typeof checkAndNotifyHighIllumination === 'function') {
                      checkAndNotifyHighIllumination(data.illumination);
                    }
                  } catch (e) {
                    console.warn("Erreur notification:", e);
                  }
                }
              } catch (e) {
                console.warn("Erreur lors du chargement de la position sauvegardée:", e);
              }
            }
          } catch (e) {
            console.warn("Erreur localStorage:", e);
          }
        }

        // Demander la géolocalisation - vérification stricte pour Safari
        console.log('5. Avant géoloc');
        if (typeof window !== 'undefined' && 
            typeof navigator !== 'undefined' && 
            'geolocation' in navigator && 
            navigator.geolocation) {
          console.log('5.1 Géolocalisation disponible');
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                console.log('5.2 Position obtenue');
                const { latitude, longitude } = position.coords;
                
                // Reverse geocoding pour obtenir le nom de la ville
                const safeLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 51.5074;
                const safeLon = typeof longitude === 'number' && !isNaN(longitude) ? longitude : -0.1278;
                let locationName = `${safeLat.toFixed(2)}, ${safeLon.toFixed(2)}`;
                try {
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                    {
                      headers: {
                        'User-Agent': 'Smoon PWA'
                      }
                    }
                  );
                  if (response.ok) {
                    const data = await response.json();
                    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";
                    const country = data.address?.country || "";
                    if (city) {
                      locationName = country ? `${city}, ${country}` : city;
                    }
                  }
                } catch (e) {
                  // Fallback sur coordonnées si l'API échoue
                  console.warn("Erreur reverse geocoding, utilisation des coordonnées:", e);
                }
                
                const newLocation: Location = {
                  lat: safeLat,
                  lon: safeLon,
                  name: locationName,
                };
                setLocation(newLocation);
                
                try {
                  if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem("smoon_location", JSON.stringify(newLocation));
                  }
                } catch (e) {
                  console.warn("Erreur sauvegarde localStorage:", e);
                }
                
                console.log('6. Avant calcul lune (géoloc)');
                const data = calculateMoonData(newLocation.lat, newLocation.lon);
                console.log('7. Après calcul lune (géoloc)', data);
                setMoonData(data);
                try {
                  if (typeof checkAndNotifyHighIllumination === 'function') {
                    checkAndNotifyHighIllumination(data.illumination);
                  }
                } catch (e) {
                  console.warn("Erreur notification:", e);
                }
              } catch (e) {
                console.error("Erreur lors du traitement de la géolocalisation:", e);
              }
            },
            (error) => {
              // Log plus informatif
              console.warn("Géolocalisation non disponible, utilisation du fallback London:", error.message || error.code);
              
              try {
                // Utiliser le fallback London silencieusement
                const fallbackCoords = { lat: 51.5074, lon: -0.1278 };
                if (typeof window !== 'undefined' && window.localStorage) {
                  localStorage.setItem('smoon_location', JSON.stringify(fallbackCoords));
                }
                setLocation(LONDON_FALLBACK);
                
                // Calculer les données avec le fallback
                const data = calculateMoonData(fallbackCoords.lat, fallbackCoords.lon);
                setMoonData(data);
                try {
                  if (typeof checkAndNotifyHighIllumination === 'function') {
                    checkAndNotifyHighIllumination(data.illumination);
                  }
                } catch (e) {
                  console.warn("Erreur notification:", e);
                }
              } catch (e) {
                console.error("Erreur lors du fallback:", e);
              }
            }
          );
        } else {
          // Pas de géolocalisation disponible, utiliser fallback
          console.log('5.3 Géolocalisation non disponible, fallback');
          console.warn("Géolocalisation non disponible, utilisation du fallback London");
          try {
            const fallbackCoords = { lat: 51.5074, lon: -0.1278 };
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('smoon_location', JSON.stringify(fallbackCoords));
            }
            setLocation(LONDON_FALLBACK);
            console.log('6. Avant calcul lune (fallback)');
            const data = calculateMoonData(fallbackCoords.lat, fallbackCoords.lon);
            console.log('7. Après calcul lune (fallback)', data);
            setMoonData(data);
          } catch (e) {
            console.error("Erreur lors du fallback:", e);
          }
        }
        
        console.log('8. Init terminé');
        setIsLoading(false);
      } catch (e) {
        console.error('ERREUR initialisation:', e);
        console.error('Stack:', e instanceof Error ? e.stack : 'No stack');
        setError('Erreur de chargement');
        setIsLoading(false);
      }
    };
    
    init();
  }, [isMounted]);

  // Rafraîchissement automatique toutes les 5 minutes
  useEffect(() => {
    if (!isMounted || isLoading) return;

    const refreshData = () => {
      try {
        if (typeof window === 'undefined') return;
        
        if (typeof Date !== 'undefined' && typeof Date.prototype.toLocaleTimeString === 'function') {
          console.log("Données rafraîchies à", new Date().toLocaleTimeString());
        }
        const newData = calculateMoonData(location.lat, location.lon);
        setMoonData(newData);
        
        // Vérifier et envoyer notifications si nécessaire (sans bloquer)
        try {
          if (typeof checkAndNotifyMoonVisibility === 'function') {
            checkAndNotifyMoonVisibility(newData.altitude).catch((e) => {
              console.warn("Erreur notification visibilité:", e);
            });
          }
        } catch (e) {
          console.warn("Erreur lors de l'appel notification visibilité:", e);
        }
        
        try {
          if (typeof checkAndNotifyHighIllumination === 'function') {
            checkAndNotifyHighIllumination(newData.illumination);
          }
        } catch (e) {
          console.warn("Erreur lors de l'appel notification illumination:", e);
        }
      } catch (e) {
        console.error("Erreur lors du rafraîchissement:", e);
      }
    };

    // Rafraîchir immédiatement
    refreshData();

    // Puis toutes les 5 minutes - vérifier que setInterval est disponible
    if (typeof setInterval !== 'undefined') {
      const interval = setInterval(refreshData, 5 * 60 * 1000);
      return () => {
        if (typeof clearInterval !== 'undefined') {
          clearInterval(interval);
        }
      };
    }
  }, [isMounted, location, isLoading]);

  // Protection contre les erreurs de données - vérification unique au montage
  // IMPORTANT: Ce useEffect doit être AVANT tous les returns conditionnels pour respecter les règles des hooks
  useEffect(() => {
    if (!isMounted || isLoading) return;
    
    // Vérifier une seule fois après le montage
    const checkData = () => {
      if (!moonData || typeof moonData.illumination !== 'number' || isNaN(moonData.illumination)) {
        console.warn('Invalid moonData detected, reinitializing...');
        try {
          const data = calculateMoonData(location.lat, location.lon);
          if (data && typeof data.illumination === 'number' && !isNaN(data.illumination)) {
            setMoonData(data);
          }
        } catch (e) {
          console.error('Failed to reinitialize moonData:', e);
        }
      }
    };
    
    // Délai pour éviter les conflits avec les autres useEffect
    if (typeof setTimeout !== 'undefined') {
      const timeout = setTimeout(checkData, 100);
      return () => {
        if (typeof clearTimeout !== 'undefined') {
          clearTimeout(timeout);
        }
      };
    }
  }, [isMounted, isLoading, moonData, location]);

  // Retourner un placeholder avant le montage pour éviter l'erreur d'hydration
  if (!isMounted) {
    console.log('9.0 Pas encore monté, placeholder');
    return (
      <main style={{ 
        minHeight: '100dvh', 
        background: 'linear-gradient(to bottom, #0a0a0f, #0d1117, #161b22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <p>Chargement...</p>
      </main>
    );
  }

  // Gestion des états d'erreur et de chargement
  console.log('9. Avant rendu - error:', error, 'isLoading:', isLoading, 'isMounted:', isMounted, 'moonData:', moonData);
  
  if (error) {
    console.log('9.1 Affichage erreur');
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#161b22] flex items-center justify-center px-5" style={{ minHeight: '100dvh' }}>
        <div className="text-white text-center max-w-[430px]">
          <p className="text-lg mb-4">{error}</p>
          <p className="text-sm text-white/60">Rechargez la page pour réessayer</p>
        </div>
      </main>
    );
  }

  if (isLoading || !isMounted) {
    console.log('9.2 Affichage chargement');
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#161b22] flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="text-white text-center">
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  // Protection finale avant le rendu
  if (!moonData) {
    console.log('9.3 moonData manquant');
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#161b22] flex items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="text-white text-center">
          <p>Chargement...</p>
        </div>
      </main>
    );
  }

  console.log('9.4 Rendu principal');
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#161b22] px-5 max-w-[430px] mx-auto" style={{ minHeight: '100dvh', paddingTop: '60px', paddingBottom: '40px', position: 'relative', zIndex: 1 }}>
      {/* Fond étoilé avec parallax et scintillement */}
      <div 
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'starFloat 60s ease-in-out infinite'
        }}
      >
        {/* Générer plusieurs étoiles avec scintillement - positions fixes pour éviter l'hydration */}
        {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29].map((i) => {
          // Positions fixes basées sur l'index pour éviter les différences SSR/client
          const positions = [
            { top: 5, left: 10, size: 1.5, delay: 0.5, opacity: 0.6 },
            { top: 15, left: 25, size: 2, delay: 1.2, opacity: 0.5 },
            { top: 8, left: 45, size: 1.2, delay: 2.1, opacity: 0.7 },
            { top: 22, left: 15, size: 1.8, delay: 0.8, opacity: 0.4 },
            { top: 30, left: 60, size: 2.2, delay: 1.5, opacity: 0.6 },
            { top: 12, left: 75, size: 1.3, delay: 2.8, opacity: 0.5 },
            { top: 35, left: 30, size: 1.7, delay: 1.0, opacity: 0.7 },
            { top: 18, left: 85, size: 2.1, delay: 0.3, opacity: 0.4 },
            { top: 42, left: 50, size: 1.4, delay: 2.3, opacity: 0.6 },
            { top: 25, left: 5, size: 1.9, delay: 1.7, opacity: 0.5 },
            { top: 50, left: 20, size: 2.0, delay: 0.9, opacity: 0.7 },
            { top: 38, left: 70, size: 1.6, delay: 2.5, opacity: 0.4 },
            { top: 55, left: 40, size: 1.8, delay: 1.3, opacity: 0.6 },
            { top: 28, left: 90, size: 1.5, delay: 0.7, opacity: 0.5 },
            { top: 62, left: 12, size: 2.2, delay: 2.0, opacity: 0.7 },
            { top: 45, left: 55, size: 1.3, delay: 1.4, opacity: 0.4 },
            { top: 70, left: 35, size: 1.7, delay: 0.6, opacity: 0.6 },
            { top: 58, left: 80, size: 1.9, delay: 2.2, opacity: 0.5 },
            { top: 75, left: 18, size: 1.4, delay: 1.8, opacity: 0.7 },
            { top: 65, left: 65, size: 2.1, delay: 0.4, opacity: 0.4 },
            { top: 80, left: 42, size: 1.6, delay: 2.6, opacity: 0.6 },
            { top: 72, left: 88, size: 1.8, delay: 1.1, opacity: 0.5 },
            { top: 85, left: 25, size: 2.0, delay: 0.8, opacity: 0.7 },
            { top: 78, left: 60, size: 1.5, delay: 2.4, opacity: 0.4 },
            { top: 88, left: 8, size: 1.7, delay: 1.6, opacity: 0.6 },
            { top: 82, left: 75, size: 1.9, delay: 0.3, opacity: 0.5 },
            { top: 92, left: 50, size: 1.3, delay: 2.7, opacity: 0.7 },
            { top: 86, left: 95, size: 2.2, delay: 1.9, opacity: 0.4 },
            { top: 95, left: 30, size: 1.4, delay: 0.5, opacity: 0.6 },
            { top: 90, left: 68, size: 1.8, delay: 2.1, opacity: 0.5 }
          ];
          const pos = positions[i] || { top: 50, left: 50, size: 1.5, delay: 1, opacity: 0.5 };
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                background: 'white',
                borderRadius: '50%',
                animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
                animationDelay: `${pos.delay}s`,
                opacity: pos.opacity
              }}
            />
          );
        })}
      </div>
      
      {/* Header - Location uniquement */}
      <Header location={location?.name || "London, UK"} />

      {/* Lune */}
      <div style={{ marginBottom: '24px' }}>
        <Moon 
          phaseValue={moonData?.phaseValue ?? 0}
          illumination={moonData?.illumination ?? 0} 
        />
      </div>

      {/* Card Glass pour Phase + Pourcentage avec Cercle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)',
        marginTop: '20px',
        marginBottom: '80px',
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        <div style={{ position: 'relative', width: '140px', height: '140px' }}>
          <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle
              cx="70" cy="70" r="60" fill="none"
              stroke={moonData.illumination >= 95 ? "url(#goldGradient)" : "url(#progressGradient)"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(moonData.illumination / 100) * 377} 377`}
              style={{ filter: moonData.illumination > 80 ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none' }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#f0abfc" />
              </linearGradient>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="100%" stopColor="#ffec80" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', textAlign: 'center'
          }}>
            <span style={{
              fontSize: '36px', fontWeight: '300', color: 'white',
              animation: moonData.illumination > 80 ? 'glowPulse 2s ease-in-out infinite' : 'none'
            }}>
              {moonData?.illumination ?? 0}
            </span>
            <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)' }}>%</span>
          </div>
        </div>
        
        <div style={{
          marginTop: '16px', padding: '8px 20px',
          background: moonData.illumination >= 95 ? 'rgba(255,215,0,0.2)' : 'rgba(167,139,250,0.15)',
          borderRadius: '20px',
          border: moonData.illumination >= 95 ? '1px solid rgba(255,215,0,0.4)' : '1px solid rgba(167,139,250,0.3)'
        }}>
          <span style={{
            fontSize: '14px',
            color: moonData.illumination >= 95 ? 'rgba(255,235,180,1)' : 'rgba(255,255,255,0.9)',
            letterSpacing: '1px'
          }}>
            {moonData?.phase?.toUpperCase() || "NOUVELLE LUNE"}
          </span>
        </div>
      </div>

      {/* CONTAINER GLASS */}
      <div
        style={{
          margin: '0 20px 50px 20px',
          padding: '24px',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        {/* Grid 2 colonnes */}
        <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <StatCard icon="rise" label="LEVER" value={formatTime(moonData?.moonrise ?? null)} />
          <StatCard icon="set" label="COUCHER" value={formatTime(moonData?.moonset ?? null)} />
        </div>

        <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <StatCard 
            icon="fullmoon" 
            label="PLEINE LUNE" 
            value={moonData?.daysUntilFullMoon === 0 ? "Aujourd'hui" : `${moonData?.daysUntilFullMoon ?? 0}j`} 
          />
          <StatCard 
            icon="duration" 
            label="DURÉE VISIBILITÉ" 
            value={moonData?.visibilityDuration !== null && moonData?.visibilityDuration !== undefined ? `${moonData.visibilityDuration}h` : "—"} 
          />
        </div>

        {/* Cartes larges */}
        <StatCardWide 
          icon="distance" 
          label="DISTANCE SMINA-LUNE" 
          value={(() => {
            try {
              const dist = moonData?.distance ?? 384400;
              if (typeof dist === 'number' && !isNaN(dist)) {
                return `${dist.toLocaleString("fr-FR")} km`;
              }
              return "384 400 km";
            } catch (e) {
              return "384 400 km";
            }
          })()} 
        />

        <SminaCard value={moonData?.sminaValue ?? 5} />

        {/* Message contextuel */}
        {(() => {
          function getContextualMessage(altitude: number, illumination: number): { text: string; emoji: string } {
            const hour = new Date().getHours();
            const isFullMoon = illumination >= 95;
            
            if (isFullMoon) {
              return { text: "Iwa c'est la pleine lune, Smina !", emoji: "🌕✨" };
            }
            
            const isNight = hour >= 21 || hour < 6;
            const isEvening = hour >= 18 && hour < 21;
            const isMorning = hour >= 6 && hour < 12;
            
            if (isNight && altitude > 0) {
              return { text: "Chouf sma, Smina", emoji: "✨" };
            } else if (isNight) {
              return { text: "Lqmar kayrta7, Smina", emoji: "💤" };
            } else if (isEvening) {
              return { text: "Lqmar ghadi yetla3, Smina", emoji: "🌙" };
            } else if (isMorning) {
              return { text: "Nhar zine, Smina", emoji: "☀️" };
            }
            return { text: "Lqmar kayfekker fik, Smina", emoji: "💫" };
          }
          
          const contextMessage = getContextualMessage(moonData?.altitude ?? 0, moonData?.illumination ?? 0);
          
          return (
            <div style={{
              padding: '16px',
              background: moonData.illumination >= 95 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              border: moonData.illumination >= 95 ? '1px solid rgba(255,215,0,0.2)' : '1px solid rgba(255,255,255,0.05)',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                {contextMessage.text} {contextMessage.emoji}
              </p>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
