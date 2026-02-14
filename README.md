# Kouma Fashion - Gestion de Boutique

Application web **frontend uniquement** (sans backend) : HTML, CSS, JavaScript + Supabase.

## Fonctionnalités

- **Produits** : Ajout, modification, suppression
- **Stock** : Entrées et sorties de marchandise
- **Clients** : Enregistrement des informations
- **Ventes** : Panier, calcul automatique, déduction du stock, facture PDF générée dans le navigateur

## Installation

### 1. Configurer Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécutez le contenu de `schema_supabase.sql`
3. Dans **Project Settings > API**, copiez l'URL et la clé **anon** (public)
4. Modifiez `public/config.js` avec vos valeurs :
```javascript
const SUPABASE_CONFIG = {
  url: 'https://votre-projet.supabase.co',
  anonKey: 'votre_cle_anon'
};
```

### 2. Lancer l'application

```bash
npm start
```

Puis ouvrez **http://localhost:3000** dans votre navigateur.

Ou utilisez **Live Server** (extension VS Code) en ouvrant `public/index.html`.

## Structure

```
Kouma Fashion/
├── public/
│   ├── index.html
│   ├── config.js      # Configuration Supabase
│   ├── app.js         # Logique applicative
│   └── styles.css
├── schema_supabase.sql
└── package.json
```

## Technologies

- **Frontend** : HTML, CSS, JavaScript
- **Base de données** : Supabase (PostgreSQL)
- **PDF** : jsPDF (génération côté client)
