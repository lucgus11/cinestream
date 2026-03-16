# 🎬 CineStream — PWA Netflix-Clone

Une Progressive Web App de streaming vidéo construite avec **Next.js 14**, **Video.js**, **Tailwind CSS** et déployable en un clic sur **Vercel**.

![CineStream Preview](https://via.placeholder.com/1200x630/080808/E50914?text=CineStream+PWA)

---

## ✨ Fonctionnalités

- 🎥 **Lecteur Video.js** avec support MP4, HLS (m3u8), contrôles personnalisés et raccourcis clavier
- 🔍 **Recherche de films** en temps réel via l'API TMDb
- 🏠 **Hero Section** avec carrousel automatique des films tendance
- 📱 **PWA installable** sur mobile et desktop (Service Worker + manifest)
- 🌙 **Interface sombre** type Netflix, 100% responsive
- ⚡ **Optimisé Vercel** : ISR, headers de sécurité, cache images
- 🔄 **Mode hors-ligne** : les assets et images sont mis en cache
- 🎭 **Double mode lecteur** : Video.js natif ou lecteur Embed (iframe)
- ⌨️ **Raccourcis clavier** : Espace, F, M, ←→, ↑↓

---

## 🛠 Stack Technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 14** (App Router) | Framework principal, SSR/ISR |
| **Video.js 8** | Lecteur vidéo MP4/HLS |
| **Tailwind CSS 3** | Styling utility-first |
| **next-pwa** | Service Worker, manifest PWA |
| **TMDb API** | Données films (affiches, descriptions) |
| **TypeScript** | Typage statique |

---

## 🚀 Démarrage rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/VOTRE_USERNAME/cinestream.git
cd cinestream
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Éditez `.env.local` :

```env
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_tmdb_ici
NEXT_PUBLIC_STREAM_API_BASE=https://votre-api-stream.com  # optionnel
```

> 🔑 **Obtenir une clé TMDb gratuite** : [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
> Sans clé, l'app fonctionne avec des données simulées (20 films).

### 4. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 🔑 Connecter votre propre API de Streaming

### Option A — API personnalisée (Openload, VidSrc, etc.)

Dans `src/lib/api.ts`, la fonction `getVideoSources(movieId)` appelle votre endpoint :

```typescript
// .env.local
NEXT_PUBLIC_STREAM_API_BASE=https://votre-api.com

// Format de réponse attendu depuis GET /stream/{movieId} :
{
  "sources": [
    {
      "src": "https://cdn.example.com/film.mp4",
      "type": "video/mp4",
      "label": "HD 1080p",
      "res": 1080
    },
    {
      "src": "https://cdn.example.com/film.m3u8",
      "type": "application/x-mpegURL",
      "label": "HLS Auto"
    }
  ]
}
```

### Option B — Lecteur Embed (iframe)

Sur la page `/watch/[id]`, basculez sur le mode **"Embed"**.
Modifiez les URLs dans `getEmbedUrl()` dans `src/lib/api.ts` :

```typescript
// Providers disponibles (gratuits, publics) :
const providers = {
  vidsrc:     `https://vidsrc.to/embed/movie/${movieId}`,
  multiembed: `https://multiembed.mov/?video_id=${movieId}&tmdb=1`,
  embedsu:    `https://embed.su/embed/movie/${movieId}`,
  smashystream: `https://player.smashy.stream/movie/${movieId}`,
};
```

### Option C — Flux HLS direct

Passez directement une URL m3u8 dans les sources :

```typescript
// src/lib/api.ts → getVideoSources()
return [{
  src: "https://votre-cdn.com/films/123/master.m3u8",
  type: "application/x-mpegURL",
  label: "HLS Auto"
}];
```

---

## 📦 Déploiement sur Vercel via GitHub

### Étape 1 — Pousser sur GitHub

```bash
git init
git add .
git commit -m "feat: initial CineStream PWA"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/cinestream.git
git push -u origin main
```

### Étape 2 — Importer sur Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Cliquez **"Import Git Repository"** → sélectionnez `cinestream`
3. Framework détecté automatiquement : **Next.js** ✅

### Étape 3 — Variables d'environnement sur Vercel

Dans **Settings → Environment Variables**, ajoutez :

| Clé | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_TMDB_API_KEY` | `votre_clé` | Production, Preview |
| `NEXT_PUBLIC_STREAM_API_BASE` | `https://...` | Production (optionnel) |

### Étape 4 — Déployer

Cliquez **"Deploy"** 🚀

Chaque `git push` sur `main` redéploie automatiquement.

---

## 📱 Installer la PWA

### Sur mobile (Android / iOS)

1. Ouvrez l'URL de votre app dans Chrome/Safari
2. Android : bannière "Ajouter à l'écran d'accueil" automatique
3. iOS : Menu partage → "Sur l'écran d'accueil"

### Sur desktop (Chrome/Edge)

1. Icône d'installation dans la barre d'adresse
2. Ou : Menu → "Installer CineStream"

---

## 🗂 Structure du projet

```
cinestream/
├── public/
│   ├── manifest.json          # Config PWA
│   ├── icons/                 # Icônes PWA (72→512px)
│   └── placeholder-poster.jpg # Fallback affiche
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout racine + meta PWA
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── globals.css        # Styles globaux + Video.js overrides
│   │   └── watch/
│   │       └── [id]/
│   │           ├── page.tsx   # Page lecteur (SSR)
│   │           └── WatchClient.tsx  # Composant client
│   │
│   ├── components/
│   │   ├── VideoPlayer.tsx    # Lecteur Video.js complet
│   │   ├── MovieCard.tsx      # Carte film avec hover
│   │   ├── MovieGrid.tsx      # Grille responsive + pagination
│   │   ├── HeroSection.tsx    # Carrousel hero
│   │   └── Navbar.tsx         # Navigation + recherche
│   │
│   └── lib/
│       └── api.ts             # Couche API (TMDb + streaming)
│
├── next.config.js             # Config Next.js + PWA
├── tailwind.config.ts         # Thème Tailwind
├── vercel.json                # Headers sécurité + rewrites
├── .env.example               # Template variables d'env
└── tsconfig.json              # Config TypeScript
```

---

## ⌨️ Raccourcis clavier du lecteur

| Touche | Action |
|--------|--------|
| `Espace` / `K` | Play / Pause |
| `←` | Reculer de 10s |
| `→` | Avancer de 10s |
| `↑` | Volume +10% |
| `↓` | Volume -10% |
| `F` | Plein écran |
| `M` | Muet / Son |

---

## 🔧 Générer les icônes PWA

Utilisez [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) ou installez :

```bash
npm install -g pwa-asset-generator
pwa-asset-generator ./public/logo.png ./public/icons \
  --background "#080808" \
  --padding "20%" \
  --manifest ./public/manifest.json
```

---

## 🐛 Dépannage

**Video.js ne charge pas**
→ Vérifiez que `"use client"` est présent dans `VideoPlayer.tsx`
→ L'import est dynamique (côté client uniquement)

**Images TMDb cassées**
→ Vérifiez que `image.tmdb.org` est dans `remotePatterns` dans `next.config.js`

**PWA non installable**
→ Vérifiez que le site est servi en HTTPS (Vercel le fait automatiquement)
→ Vérifiez `public/manifest.json` et les icônes

**Service Worker ne se met pas à jour**
→ Dans Chrome DevTools → Application → Service Workers → "Update on reload"

---

## 📄 Licence

Ce projet est sous licence **CC BY-NC 4.0 (Creative Commons Attribution - Pas d'Utilisation Commerciale 4.0 International)**.

### Ce que cela signifie :
- **Partage** : Vous pouvez copier et distribuer le matériel sous n'importe quel format.
- **Adaptation** : Vous pouvez modifier et transformer le projet.
- **Attribution** : Vous devez créditer l'auteur original (moi-même), fournir un lien vers la licence et indiquer si des modifications ont été effectuées.
- **Pas d'Utilisation Commerciale** : Vous n'avez pas le droit d'utiliser ce projet, ou des parties de celui-ci, à des fins commerciales.

Consultez le résumé de la licence ici : [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.fr)

---

> ⚠️ **Avis légal** : Ce projet utilise l'API TMDb pour les métadonnées. Les flux vidéo sont de votre responsabilité. Assurez-vous d'avoir les droits nécessaires pour diffuser le contenu.
