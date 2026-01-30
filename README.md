# Smoon PWA

PWA iOS pour afficher l'état de la lune en temps réel selon la géolocalisation.

## Stack technique

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- SunCalc pour les calculs lunaires
- Web Push API pour notifications
- Hébergement : Vercel

## Installation

```bash
npm install
npm run dev
```

## Configuration requise

### Images de sprites lunaires

Ajoutez manuellement 30 images PNG dans `/public/sprites/` :
- `moon-01.png` à `moon-30.png`
- Format : 220x220px minimum
- Images de la lune selon les phases

### Icônes PWA

Ajoutez les icônes suivantes dans `/public/` :
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

Ces icônes sont utilisées pour l'installation PWA et les notifications.

## Fonctionnalités

- **Géolocalisation** : Demande automatique de permission, fallback sur Paris si refusé
- **Données lunaires** : Phase, illumination, lever/coucher, distance, rayonnance de Smina
- **Rafraîchissement auto** : Toutes les 5 minutes
- **Notifications** : Alerte quand la lune passe au-dessus de l'horizon (cooldown 6h)
- **PWA** : Installable sur iOS/Android, fonctionne hors ligne

## Structure du projet

```
/app
  /page.tsx          # Page principale
  /layout.tsx        # Layout avec meta PWA
  /globals.css       # Styles globaux
/components
  /Moon.tsx          # Composant lune avec sprite
  /StatCard.tsx      # Carte stat réutilisable
  /StatCardWide.tsx  # Carte stat large
  /SminaBar.tsx      # Barre rayonnance avec pulse
  /Header.tsx         # Location + phase name
/lib
  /moon.ts           # Fonctions calculs SunCalc
  /notifications.ts  # Logic notifications push
/public
  /sprites           # 30 images lune (à ajouter)
  /manifest.json     # PWA manifest
  /sw.js             # Service worker
```

## Déploiement

Le projet est configuré pour Vercel. Déployez simplement en poussant sur votre repository GitHub connecté à Vercel.

## Notes

- Les données sont calculées en temps réel via SunCalc
- La géolocalisation est sauvegardée en localStorage
- Les notifications nécessitent une autorisation utilisateur
- Le service worker permet le fonctionnement hors ligne
