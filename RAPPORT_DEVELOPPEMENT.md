# Rapport de Développement - Smoon PWA

## Vue d'ensemble du projet

**Smoon** est une PWA (Progressive Web App) iOS pour afficher l'état de la lune en temps réel selon la géolocalisation. Application personnelle, déployée sur Vercel, 100% gratuite.

**Stack technique :**
- Next.js 16.1.6 (App Router)
- TypeScript
- Tailwind CSS 4
- SunCalc (npm: suncalc) pour tous les calculs lunaires
- Web Push API pour notifications
- Hébergement : Vercel

---

## Structure du projet créée

```
/app
  /page.tsx          # Page principale unique avec géolocalisation
  /layout.tsx        # Layout avec meta PWA et service worker
  /globals.css       # Styles globaux + variables CSS + animations
/components
  /Header.tsx        # Composant header (location + phase name)
  /Moon.tsx          # Composant lune 3D avec cratères et rotation
  /StatCard.tsx      # Carte stat réutilisable (2 colonnes)
  /StatCardWide.tsx  # Carte stat large (distance)
  /SminaBar.tsx      # Barre rayonnance avec icône étoile et glow animé
  /SminaCard.tsx     # Carte complète pour rayonnance de Smina
/lib
  /moon.ts           # Fonctions calculs SunCalc (phase, illumination, etc.)
  /notifications.ts  # Logic notifications push avec cooldown
/public
  /manifest.json     # PWA manifest
  /sw.js             # Service worker pour mode hors ligne
```

---

## Fichiers créés et modifications

### 1. Bibliothèque de calculs lunaires (`lib/moon.ts`)

**Fonctionnalités implémentées :**
- `getPhaseName(phase)`: Convertit la phase (0-1) en nom français
  - Nouvelle lune, Premier croissant, Premier quartier, Gibbeuse croissante
  - Pleine lune, Gibbeuse décroissante, Dernier quartier, Dernier croissant
- `getDaysUntilFullMoon(phase)`: Calcule les jours avant la prochaine pleine lune
- `getVisibilityDuration(moonrise, moonset)`: Calcule la durée de visibilité en heures
  - Gère le cas où coucher < lever (ajoute 24h)
- `formatTime(date)`: Formate une date en heure locale (HH:MM)
- `calculateMoonData(lat, lon, date)`: Fonction principale qui calcule toutes les données
  - Phase, illumination, lever, coucher, distance, altitude, sminaValue
  - **Correction importante** : Distance en km (SunCalc retourne déjà en km, pas de conversion)
- `getMoonSpriteIndex(phase)`: Obtient l'index du sprite (1-30) - non utilisé finalement

**Interface MoonData :**
```typescript
{
  phase: string;           // Nom de la phase
  phaseValue: number;      // Valeur phase 0-1
  illumination: number;    // 0-100
  moonrise: Date | null;
  moonset: Date | null;
  daysUntilFullMoon: number;
  visibilityDuration: number | null; // en heures
  distance: number;        // en km
  sminaValue: number;      // illumination + 5%
  altitude: number;        // en degrés
}
```

### 2. Système de notifications (`lib/notifications.ts`)

**Fonctionnalités :**
- `checkNotificationPermission()`: Vérifie et demande les permissions
- `canSendNotification()`: Vérifie le cooldown (6 heures)
- `checkAndNotifyMoonVisibility(altitude)`: Envoie une notification si la lune est visible
  - Déclencheur : altitude > 0 (lune au-dessus de l'horizon)
  - Message : "La lune est visible"
  - Cooldown : 6 heures entre chaque notification
  - Stockage localStorage pour éviter le spam

### 3. Composants UI

#### `components/Header.tsx`
- Affiche la location (géolocalisation) en haut
- Affiche le nom de la phase lunaire
- Centré avec espacement approprié
- `suppressHydrationWarning` sur les éléments dynamiques

#### `components/Moon.tsx`
**Évolution complète :**
1. **Version initiale** : Utilisait des sprites images (moon-01.png à moon-30.png)
2. **Version CSS pure** : Lune créée entièrement en CSS avec :
   - Surface de base : radial-gradient
   - 5 cratères positionnés avec radial-gradient gris foncé
   - Shadow inset pour relief
   - Highlight inset
   - Ombre de phase dynamique basée sur l'illumination
   - Glow dynamique (intensité basée sur illumination)
   - Animation rotation lente (120s)

3. **Version 3D améliorée** (actuelle) :
   - 7 cratères réalistes avec ombres multiples
   - 2 reliefs/mare (zones sombres)
   - Gradients multiples pour profondeur 3D
   - Couches highlight/ombre avec mix-blend-mode
   - Ombre de phase avec transition douce
   - Rotation sur l'axe Z (comme la Terre)
   - Halo ambient autour de la lune

**Rotation :**
- Animation `rotateMoon` : `rotate(0deg)` → `rotate(360deg)`
- Durée : 120s, linear, infinite
- Rotation sur l'axe Z uniquement (pas de rotation 3D complexe)

#### `components/StatCard.tsx`
- Carte stat réutilisable pour les stats en 2 colonnes
- Icônes SVG intégrées :
  - `rise`: Lune avec flèche montante (lever)
  - `set`: Lune avec flèche descendante (coucher)
  - `fullmoon`: Cercle (pleine lune)
  - `duration`: Horloge (durée visibilité)
  - `distance`: Icône empilée (distance)
- Styles : `bg-white/[0.03]`, `border-white/[0.05]`, `rounded-2xl`
- `suppressHydrationWarning` sur la valeur

#### `components/StatCardWide.tsx`
- Carte stat large pour distance et Smina
- Même style que StatCard mais avec padding horizontal augmenté
- Utilisée pour "Distance Terre-Lune"

#### `components/SminaBar.tsx`
- Barre de progression pour rayonnance de Smina
- Gradient violet (`rgba(180,160,220,0.6)` → `rgba(220,200,255,0.9)`)
- Icône étoile remplie positionnée au-dessus de la barre
- Animation glow pulsante si valeur > 80%
- L'étoile suit la progression de la barre

#### `components/SminaCard.tsx`
- Carte complète pour "SMINA RADIANCE"
- Affiche le label et la valeur
- Intègre le composant SminaBar
- Pas de pourcentage affiché (retiré selon demande)

### 4. Page principale (`app/page.tsx`)

**Fonctionnalités implémentées :**
- Géolocalisation automatique au chargement
- Fallback sur Paris (48.8566, 2.3522) si refus
- Stockage en localStorage pour éviter re-demande
- Rafraîchissement automatique toutes les 5 minutes
- Console.log pour vérifier le rafraîchissement
- Vérification et envoi de notifications push
- Gestion de l'état `isMounted` pour éviter erreurs d'hydration

**Structure HTML :**
```tsx
<main> (padding-top: 28, padding-bottom: 48)
  <Header /> (location + phaseName)
  <Moon /> (illumination + phase)
  <Illumination /> (valeur + % + label)
  <Container Glass> (margin: 0 20px 100px 20px)
    <Grid 2 colonnes> Lever | Coucher
    <Grid 2 colonnes> Pleine lune | Durée visibilité
    <StatCardWide> Distance Terre-Lune
    <SminaCard> Rayonnance de Smina
  </Container Glass>
</main>
```

**Icônes SVG définies dans le composant :**
- MoonriseIcon, MoonsetIcon, FullMoonIcon, DurationIcon, DistanceIcon, SminaIcon

### 5. Layout PWA (`app/layout.tsx`)

**Configurations :**
- Meta PWA : title, description, manifest, theme-color
- Apple Web App : capable, statusBarStyle
- Viewport : device-width, viewport-fit cover
- Service worker enregistré via script inline
- `suppressHydrationWarning` sur `<html>` et `<body>`
- Langue : `fr`

### 6. Styles globaux (`app/globals.css`)

**Variables CSS définies :**
- Couleurs : bg-gradient, text, card-glass, moon-halo, smina
- Typographie : -apple-system, BlinkMacSystemFont, 'SF Pro Display'

**Animations :**
- `sminaGlow`: Animation pulse pour l'étoile Smina (2.5s, ease-in-out)
- `rotateMoon`: Rotation de la lune (120s, linear)

**Styles :**
- Reset CSS
- Font smoothing
- Safe area support pour iOS

### 7. Configuration PWA

#### `public/manifest.json`
```json
{
  "name": "Smoon",
  "short_name": "Smoon",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#0a0a0f",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```

#### `public/sw.js`
- Service worker pour mode hors ligne
- Cache strategy : Network First, puis Cache
- Cache name : "smoon-v1"
- URLs mises en cache : /, manifest.json, icons

---

## Corrections de bugs effectuées

### 1. Distance Terre-Lune
- **Problème initial** : Division par 1000 (pensait que c'était en mètres)
- **Correction** : SunCalc retourne déjà en km, utilisation de la valeur brute
- **Résultat** : Distance correcte (~384 400 km moyenne)

### 2. Durée de visibilité
- **Problème** : Valeur négative si coucher < lever (lune qui se couche le lendemain)
- **Correction** : Ajout de 24h au calcul si différence négative
- **Code** : `if (diff < 0) diff += 24 * 60 * 60 * 1000;`

### 3. Erreurs d'hydration
- **Solution** : Ajout de `suppressHydrationWarning` sur :
  - `<html>` et `<body>` dans layout
  - Header (location, phaseName)
  - Section Illumination
  - StatCard et StatCardWide (valeurs)
- **Solution** : `useEffect` avec `isMounted` pour rendre côté client uniquement

### 4. Design glassmorphism
- **Problème** : Container glass pas visible
- **Solution** : Styles inline avec :
  - `background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`
  - `backdropFilter: blur(20px)`
  - `border: 1px solid rgba(255,255,255,0.1)`
  - `borderRadius: 28px`
  - `padding: 24px`
  - `margin: 0 20px 100px 20px`
  - `boxShadow: 0 8px 32px rgba(0,0,0,0.3)` (ajouté puis retiré selon versions)

---

## Améliorations de design

### 1. Espacement
- **En haut** : `pt-28` sur main et header (au lieu de `pt-20`)
- **Entre sections** : `mb-20` sous la lune, `mb-80px` sous Illumination
- **En bas** : `pb-48` sur main, `mb-100px` sur container glass
- **Objectif** : Éviter l'effet "collé", créer de la respiration visuelle

### 2. Lune réaliste
- **Cratères** : 7 cratères avec ombres multiples pour profondeur
- **Reliefs** : 2 zones mare (reliefs sombres)
- **Gradients** : Multiples couches pour effet 3D
- **Ombre de phase** : Transition douce avec plusieurs stops
- **Rotation** : Sur l'axe Z uniquement (comme la Terre)

### 3. Labels améliorés
- **"DURÉE"** → **"DURÉE VISIBILITÉ"** pour plus de clarté
- **"RAYONNANCE DE SMINA"** → **"SMINA RADIANCE"** (anglais)

### 4. Icônes
- **Lever/Coucher** : Icônes avec lune et flèches montantes/descendantes
- **Étoile Smina** : Remplie (fill) au lieu de stroke

---

## État final du projet

### Fonctionnalités opérationnelles
✅ Géolocalisation avec fallback Paris  
✅ Calculs lunaires en temps réel (SunCalc)  
✅ Affichage de toutes les données (phase, illumination, lever, coucher, distance, etc.)  
✅ Rafraîchissement automatique toutes les 5 minutes  
✅ Notifications push (quand lune visible, cooldown 6h)  
✅ PWA configurée (manifest + service worker)  
✅ Design glassmorphism complet  
✅ Lune 3D réaliste avec rotation  
✅ Responsive (max-width: 430px, centré)  

### Données affichées
1. **Location** : Coordonnées GPS ou "Paris, France"
2. **Phase lunaire** : Nom en français
3. **Illumination** : Pourcentage (0-100%)
4. **Lever lune** : Heure locale (HH:MM)
5. **Coucher lune** : Heure locale (HH:MM)
6. **Jours avant pleine lune** : Nombre de jours
7. **Durée de visibilité** : Heures (entre lever et coucher)
8. **Distance Terre-Lune** : En km
9. **Rayonnance de Smina** : Illumination + 5%

### Design final
- **Fond** : Gradient sombre (#0a0a0f → #0d1117 → #161b22)
- **Container glass** : Translucide avec backdrop-blur
- **Cartes stats** : Fond semi-transparent, bordures subtiles
- **Lune** : 220x220px avec halo ambient, rotation lente
- **Typographie** : SF Pro Display, tailles et weights spécifiques
- **Couleurs** : Palette sombre avec accents blancs/violets

---

## Fichiers à compléter manuellement

### Images requises
1. **Sprites lunaires** : `/public/sprites/moon-01.png` à `moon-30.png` (220x220px)
   - **Note** : Finalement non utilisés, lune créée en CSS pur

2. **Icônes PWA** : 
   - `/public/icon-192.png` (192x192px)
   - `/public/icon-512.png` (512x512px)
   - **Requis** pour l'installation PWA et les notifications

---

## Commandes de développement

```bash
npm install          # Installation des dépendances
npm run dev         # Serveur de développement (localhost:3000)
npm run build       # Build de production
npm run start       # Serveur de production
```

---

## Notes techniques importantes

1. **Géolocalisation** : Stockée en localStorage pour éviter re-demande
2. **Notifications** : Nécessitent permission utilisateur, cooldown 6h
3. **Service Worker** : S'enregistre automatiquement au chargement
4. **Hydration** : Gérée avec `isMounted` et `suppressHydrationWarning`
5. **Rotation lune** : 120s pour un tour complet (très lent)
6. **Rafraîchissement** : Toutes les 5 minutes avec console.log de vérification

---

## Évolutions et itérations

### Itération 1 : Création initiale
- Structure complète du projet
- Tous les composants de base
- Calculs SunCalc
- Notifications push

### Itération 2 : Corrections
- Bugs distance et durée
- Erreurs d'hydration
- Design glassmorphism

### Itération 3 : Améliorations design
- Espacement
- Lune 3D réaliste
- Labels améliorés
- Icônes

### Itération 4 : Simplification
- Retrait rotation 3D complexe
- Rotation simple sur axe Z
- Retrait glow supplémentaire
- Lune épurée mais réaliste

---

## Dépendances installées

```json
{
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "suncalc": "^1.9.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Points d'attention pour maintenance

1. **Icônes PWA** : À ajouter dans `/public/` (icon-192.png et icon-512.png)
2. **Service Worker** : Vérifier le cache version si mise à jour importante
3. **Notifications** : Tester sur iOS (peut nécessiter HTTPS)
4. **Géolocalisation** : Vérifier le fallback si API bloquée
5. **Performance** : La lune avec 7 cratères + 2 reliefs peut être lourde, optimiser si nécessaire

---

## Conclusion

Le projet Smoon PWA est **fonctionnel et prêt pour le déploiement** sur Vercel. Toutes les fonctionnalités principales sont implémentées, les bugs corrigés, et le design est cohérent avec les spécifications. Il ne reste qu'à ajouter les icônes PWA pour une installation complète.

**Statut** : ✅ Prêt pour production (après ajout des icônes)
