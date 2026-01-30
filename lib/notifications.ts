/**
 * Gère les notifications push pour la visibilité de la lune
 */

const NOTIFICATION_KEY = "smoon_last_notification";
const NOTIFICATION_COOLDOWN = 6 * 60 * 60 * 1000; // 6 heures en millisecondes

/**
 * Vérifie si les notifications sont supportées et autorisées
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Vérifie si on peut envoyer une notification (cooldown respecté)
 */
function canSendNotification(): boolean {
  const lastNotification = localStorage.getItem(NOTIFICATION_KEY);
  if (!lastNotification) {
    return true;
  }

  const lastTime = parseInt(lastNotification, 10);
  const now = Date.now();
  return now - lastTime > NOTIFICATION_COOLDOWN;
}

/**
 * Enregistre l'heure de la dernière notification
 */
function recordNotification(): void {
  localStorage.setItem(NOTIFICATION_KEY, Date.now().toString());
}

/**
 * Envoie une notification si la lune est visible et que le cooldown est respecté
 */
export async function checkAndNotifyMoonVisibility(altitude: number): Promise<void> {
  // La lune est visible si son altitude est > 0
  if (altitude <= 0) {
    return;
  }

  // Vérifier les permissions
  const hasPermission = await checkNotificationPermission();
  if (!hasPermission) {
    return;
  }

  // Vérifier le cooldown
  if (!canSendNotification()) {
    return;
  }

  // Envoyer la notification
  try {
    const notification = new Notification("Smoon", {
      body: "Smina, la lune est visible ce soir 🌙",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "moon-visible", // Évite les doublons si plusieurs notifications sont en attente
    });

    // Enregistrer l'heure de la notification
    recordNotification();

    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
      notification.close();
    }, 5000);
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
  }
}

/**
 * Envoie une notification quand l'illumination de la lune est élevée (>= 85%)
 * Cooldown de 24h pour éviter le spam
 */
export function checkAndNotifyHighIllumination(illumination: number): void {
  if (illumination < 85) return;
  
  // Clé différente pour ce type de notification
  const lastNotif = localStorage.getItem('smoon_high_illumination_notif');
  const now = Date.now();
  const COOLDOWN = 24 * 60 * 60 * 1000; // 24h entre chaque notif (une fois par jour max)
  
  if (lastNotif && now - parseInt(lastNotif) < COOLDOWN) return;
  
  if (Notification.permission === 'granted') {
    try {
      new Notification('Smoon', {
        body: `Smina, la lune brille à ${Math.round(illumination)}% cette nuit ✨`,
        icon: '/icon-192.png'
      });
      localStorage.setItem('smoon_high_illumination_notif', now.toString());
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification d'illumination:", error);
    }
  }
}
