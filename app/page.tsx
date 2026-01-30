"use client";

import { useEffect, useState } from "react";
import { calculateMoonData, formatTime } from "@/lib/moon";
import { checkAndNotifyMoonVisibility, checkAndNotifyHighIllumination } from "@/lib/notifications";
import Header from "@/components/Header";
import Moon from "@/components/Moon";
import StatCard from "@/components/StatCard";
import StatCardWide from "@/components/StatCardWide";
import SminaCard from "@/components/SminaCard";

interface Location {
  lat: number;
  lon: number;
  name: string;
}

const PARIS_FALLBACK: Location = {
  lat: 48.8566,
  lon: 2.3522,
  name: "Paris, France",
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [location, setLocation] = useState<Location>(PARIS_FALLBACK);
  const [moonData, setMoonData] = useState(calculateMoonData(PARIS_FALLBACK.lat, PARIS_FALLBACK.lon));

  // Demander la géolocalisation au chargement
  useEffect(() => {
    setIsMounted(true);

    // Vérifier si on a une position sauvegardée
    const savedLocation = localStorage.getItem("smoon_location");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setLocation(parsed);
        const data = calculateMoonData(parsed.lat, parsed.lon);
        setMoonData(data);
        checkAndNotifyHighIllumination(data.illumination);
      } catch (e) {
        console.error("Erreur lors du chargement de la position sauvegardée:", e);
      }
    }

    // Demander la géolocalisation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding pour obtenir le nom de la ville
          let locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              {
                headers: {
                  'User-Agent': 'Smoon PWA'
                }
              }
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";
            const country = data.address?.country || "";
            if (city) {
              locationName = country ? `${city}, ${country}` : city;
            }
          } catch (e) {
            // Fallback sur coordonnées si l'API échoue
            console.warn("Erreur reverse geocoding, utilisation des coordonnées:", e);
          }
          
          const newLocation: Location = {
            lat: latitude,
            lon: longitude,
            name: locationName,
          };
          setLocation(newLocation);
          localStorage.setItem("smoon_location", JSON.stringify(newLocation));
          const data = calculateMoonData(newLocation.lat, newLocation.lon);
          setMoonData(data);
          checkAndNotifyHighIllumination(data.illumination);
        },
        (error) => {
          // Log plus informatif
          console.warn("Géolocalisation non disponible, utilisation du fallback Paris:", error.message || error.code);
          
          // Utiliser le fallback Paris silencieusement
          const fallbackCoords = { lat: 48.8566, lon: 2.3522 };
          localStorage.setItem('smoon_location', JSON.stringify(fallbackCoords));
          setLocation(PARIS_FALLBACK);
          
          // Calculer les données avec le fallback
          const data = calculateMoonData(fallbackCoords.lat, fallbackCoords.lon);
          setMoonData(data);
          checkAndNotifyHighIllumination(data.illumination);
        }
      );
    }
  }, []);

  // Rafraîchissement automatique toutes les 5 minutes
  useEffect(() => {
    if (!isMounted) return;

    const refreshData = () => {
      console.log("Données rafraîchies à", new Date().toLocaleTimeString());
      const newData = calculateMoonData(location.lat, location.lon);
      setMoonData(newData);
      
      // Vérifier et envoyer notifications si nécessaire
      checkAndNotifyMoonVisibility(newData.altitude);
      checkAndNotifyHighIllumination(newData.illumination);
    };

    // Rafraîchir immédiatement
    refreshData();

    // Puis toutes les 5 minutes
    const interval = setInterval(refreshData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isMounted, location]);

  if (!isMounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#161b22] px-5 max-w-[430px] mx-auto" style={{ minHeight: '100dvh', paddingTop: '60px', paddingBottom: '40px', position: 'relative', zIndex: 1 }}>
      {/* Fond étoilé */}
      <div 
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 60px 80px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 100px 50px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 140px 120px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 180px 180px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1.5px 1.5px at 220px 70px, rgba(255,255,255,0.55), transparent),
            radial-gradient(2px 2px at 260px 140px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 300px 200px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 340px 90px, rgba(255,255,255,0.65), transparent),
            radial-gradient(2px 2px at 380px 160px, rgba(255,255,255,0.55), transparent),
            radial-gradient(2px 2px at 50px 250px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 120px 300px, rgba(255,255,255,0.5), transparent),
            radial-gradient(2px 2px at 200px 280px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 280px 320px, rgba(255,255,255,0.55), transparent),
            radial-gradient(1.5px 1.5px at 350px 270px, rgba(255,255,255,0.6), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '400px 350px'
        }}
      />
      
      {/* Header - Location uniquement */}
      <Header location={location.name} />

      {/* Lune */}
      <div style={{ marginBottom: '24px' }}>
        <Moon illumination={moonData.illumination} phase={moonData.phaseValue} />
      </div>

      {/* Phase Name */}
      <div className="text-center" style={{ marginBottom: '16px' }} suppressHydrationWarning>
        <h1 className="text-[28px] font-light tracking-[-0.5px] text-white" suppressHydrationWarning>
          {moonData.phase}
        </h1>
      </div>

      {/* Illumination */}
      <div className="text-center" style={{ marginBottom: '80px' }} suppressHydrationWarning>
        <span className="text-[56px] font-extralight tracking-[-3px] text-white" suppressHydrationWarning>
          {moonData.illumination}
        </span>
        <span className="text-[24px] font-light text-white">%</span>
        <p className="text-[13px] font-medium tracking-[1px] uppercase text-white/40 mt-1">ILLUMINATION</p>
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
          <StatCard icon="rise" label="LEVER" value={formatTime(moonData.moonrise)} />
          <StatCard icon="set" label="COUCHER" value={formatTime(moonData.moonset)} />
        </div>

        <div className="grid grid-cols-2" style={{ gap: '20px', marginBottom: '20px' }}>
          <StatCard 
            icon="fullmoon" 
            label="PLEINE LUNE" 
            value={moonData.daysUntilFullMoon === 0 ? "Aujourd'hui" : `${moonData.daysUntilFullMoon}j`} 
          />
          <StatCard 
            icon="duration" 
            label="DURÉE VISIBILITÉ" 
            value={moonData.visibilityDuration !== null ? `${moonData.visibilityDuration}h` : "—"} 
          />
        </div>

        {/* Cartes larges */}
        <StatCardWide 
          icon="distance" 
          label="DISTANCE TERRE-LUNE" 
          value={`${moonData.distance.toLocaleString("fr-FR")} km`} 
        />

        <SminaCard value={moonData.sminaValue} />
      </div>
    </main>
  );
}
