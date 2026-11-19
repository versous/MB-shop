# MAISON BLANCHE | Plateforme E-commerce de T-shirts Unis (Abidjan)

Plateforme e-commerce professionnelle, moderne, responsive et minimaliste dédiée à la commercialisation de T-shirts unis haut de gamme (gammes **Basic** & **Oversize**) pour le marché d'Abidjan, Côte d'Ivoire.

Le système est structuré autour de deux univers distincts :
1. **La Boutique Publique** : destinée aux clients, avec catalogue filtrable, fiches produits détaillées, guide des tailles interactif, réassurance locale et génération automatique de messages de commande structurés vers WhatsApp (`wa.me`).
2. **Le Tableau de Bord Administrateur (/admin)** : réservé au propriétaire de la boutique pour la gestion complète sans code (produits, photos avec Supabase Storage, commandes, livraisons dans les communes d'Abidjan, statistiques réelles et paramètres de marque).

---

## 1. Technologies Utilisées

- **Frontend & Framework** : React 18 avec Vite.
- **Styling & Design System** : Tailwind CSS avec typographie haut de gamme (*Plus Jakarta Sans* & *Syne*), palette monochrome minimaliste (#111111, #FFFFFF, #F5F5F5, #777777).
- **Navigation & Routage** : React Router DOM v6.
- **Backend, Base de Données & Stockage** : Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Row-Level Security).
- **Icônes** : Lucide React.
- **Graphiques Analytiques** : Recharts (graphiques d'évolution par jour).
- **Gestion d'état réactive** : Context API (`StoreContext`, `AuthContext`) avec fallback local automatisé (fonctionnement 100% opérationnel immédiatement même avant configuration du backend).

---

## 2. Architecture du Projet

```
MB-shop/
├── dist/                          # Fichiers de production compilés
├── public/                        # Fichiers statiques et favicon
├── src/
│   ├── components/
│   │   ├── admin/                 # Composants d'administration
│   │   │   ├── AdminHeader.jsx    # En-tête avec compteur d'alertes & profil
│   │   │   ├── AdminLayout.jsx    # Protection de route & structure tableau de bord
│   │   │   └── AdminSidebar.jsx   # Menu latéral responsive avec état de synchronisation
│   │   ├── common/                # Composants partagés
│   │   │   ├── ConfirmModal.jsx   # Modale générique de confirmation sécurisée
│   │   │   ├── ConsentBanner.jsx  # Bandeau de respect de la vie privée (RGPD)
│   │   │   ├── EmptyState.jsx     # Affichage propre lors de filtres vides
│   │   │   ├── Footer.jsx         # Pied de page avec coordonnées Abidjan & accès discret
│   │   │   ├── LoadingSpinner.jsx # Indicateur de chargement minimaliste
│   │   │   ├── Navbar.jsx         # En-tête client avec navigation mobile
│   │   │   ├── NotificationBanner.jsx # Toasts de confirmation / erreur
│   │   │   ├── PublicLayout.jsx   # Structure globale de la boutique publique
│   │   │   └── SizeGuideModal.jsx # Guide des tailles (Basic vs Oversize) en cm
│   │   └── product/               # Composants orientés produits
│   │       ├── ProductCard.jsx    # Carte produit avec galerie et prix FCFA
│   │       ├── ProductFilter.jsx  # Barre de recherche, filtres (catégorie, couleur, taille, tri)
│   │       ├── ProductGrid.jsx    # Grille responsive avec gestion des états
│   │       └── WhatsAppButton.jsx # Bouton WhatsApp avec message calibré & tracking
│   ├── context/
│   │   ├── AuthContext.jsx        # Authentification Supabase + fallback admin local
│   │   ├── initialData.js         # Données d'initialisation réalistes pour Abidjan
│   │   └── StoreContext.jsx       # Gestion globale des produits, commandes, livraisons et métriques
│   ├── lib/
│   │   ├── analytics.js           # Suivi d'événements respectueux de la vie privée (UUID anonymes)
│   │   ├── storage.js             # Upload d'images vers Supabase Storage
│   │   ├── supabase.js            # Initialisation du client Supabase
│   │   └── whatsapp.js            # Formateur FCFA et générateur de lien wa.me
│   ├── pages/
│   │   ├── admin/                 # Les 6 pages du tableau de bord propriétaire
│   │   │   ├── AdminAnalyticsPage.jsx   # Analytique approfondie & top produits
│   │   │   ├── AdminDashboardPage.jsx   # Dashboard avec 6 KPI réels & graphiques
│   │   │   ├── AdminDeliveriesPage.jsx  # Gestion et suivi des livraisons par coursier
│   │   │   ├── AdminLoginPage.jsx       # Connexion sécurisée administrateur
│   │   │   ├── AdminOrdersPage.jsx      # Saisie et cycle de vie des commandes
│   │   │   ├── AdminProductsPage.jsx    # CRUD produits complet sans toucher au code
│   │   │   └── AdminSettingsPage.jsx    # Modification des coordonnées & numéro WhatsApp
│   │   └── public/                # Pages de la boutique publique
│   │       ├── ContactPage.jsx    # Contact, grille des frais de livraison Abidjan & FAQ
│   │       ├── HomePage.jsx       # Accueil avec bannière, manifesto et collections
│   │       ├── ProductDetailPage.jsx # Fiche produit complète & commande WhatsApp
│   │       └── ShopPage.jsx       # Catalogue complet avec recherche & filtres multi-critères
│   ├── App.jsx                    # Définition des routes publiques et privées
│   ├── index.css                  # Directives Tailwind CSS & typographie
│   └── main.jsx                   # Point d'entrée React
├── supabase/
│   ├── schema.sql                 # Schéma SQL PostgreSQL complet, déclencheurs & RLS
│   └── seed.sql                   # Jeu de données d'exemple pour Abidjan
├── .env.example                   # Modèle de variables d'environnement
├── index.html                     # Template HTML avec polices Syne & Plus Jakarta Sans
├── package.json                   # Dépendances et scripts
├── tailwind.config.js             # Configuration de la charte graphique #111111
└── vite.config.js                 # Configuration du serveur de développement Vite
```

---

## 3. Configuration de la Base de Données Supabase

## Déployer la boutique sur Render

1. Publiez ce dépôt sur GitHub si ce n'est pas déjà fait, puis connectez-le à Render avec **New > Blueprint**.
2. Render détectera `render.yaml` et configurera le build Vite ainsi que le routage des pages React.
3. Avant le premier déploiement, renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables d'environnement du service Render. Utilisez uniquement la clé publique `anon`/`publishable` de Supabase, jamais la clé `service_role`.
4. Lancez le déploiement. Render affichera alors l'adresse publique du site dans le tableau de bord du service.

Les variables `VITE_*` sont intégrées au site lors du build et sont visibles côté navigateur. Elles ne doivent contenir aucun secret serveur.

### Étape 1 : Créer un projet Supabase
1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un compte ou connectez-vous.
2. Cliquez sur **"New Project"**, choisissez un nom (ex: `mb-shop`) et un mot de passe pour la base de données. Sélectionnez la région la plus proche.

### Étape 2 : Exécuter le schéma SQL et les règles de sécurité (RLS)
1. Dans le tableau de bord Supabase, ouvrez l'onglet **SQL Editor** dans le menu de gauche.
2. Ouvrez le fichier [`supabase/schema.sql`](supabase/schema.sql) de ce projet, copiez l'intégralité de son contenu et collez-le dans l'éditeur SQL de Supabase.
3. Cliquez sur **"Run"**.
   - Cela crée automatiquement les tables `products`, `orders`, `analytics_events`, `store_settings`, `admin_users`.
   - Cela met en place les triggers automatiques de numérotation de commande (`CMD-YYMM-XXXX`).
   - Cela applique les politiques de sécurité strictes Row Level Security (RLS).
   - Cela initialise les buckets de stockage pour les images.

### Étape 3 : Insérer les données initiales (Seed)
1. Toujours dans le **SQL Editor**, collez le contenu du fichier [`supabase/seed.sql`](supabase/seed.sql).
2. Cliquez sur **"Run"**.
   - Vous disposerez immédiatement des produits de départ (gammes Basic 9 000 FCFA et Oversize 11 000 FCFA avec photos haute définition), des premières commandes tests à Abidjan et des statistiques de démonstration.

### Étape 4 : Créer votre compte administrateur Supabase Auth
1. Allez dans **Authentication > Users** sur Supabase.
2. Cliquez sur **"Add user" > "Create user"** :
   - Entrez votre e-mail (ex: `admin@maisonblanche.ci`).
   - Définissez un mot de passe sécurisé.
   - Cochez "Auto Confirm User".
3. Une fois créé, copiez l'**User UID** généré (ex: `a1b2c3d4-...`).
4. Dans le **SQL Editor**, exécutez la requête suivante pour lui octroyer le rôle d'administrateur :
```sql
INSERT INTO public.admin_users (id, email, full_name, role)
VALUES ('VOTRE_USER_UID_ICI', 'admin@maisonblanche.ci', 'Propriétaire MB Shop', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Étape 5 : Configurer le stockage d'images (Supabase Storage)
1. Rendez-vous dans **Storage > Buckets**.
2. Vérifiez la présence du bucket `products` (créé par le script SQL). Si ce n'est pas le cas, cliquez sur **"New bucket"**, nommez-le `products` et cochez **"Public bucket"**.

---

## 4. Variables d'Environnement

Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Remplissez avec vos clés publiques Supabase (disponibles dans *Project Settings > API*) :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

> **IMPORTANT :** Ne renseignez **JAMAIS** la clé `service_role` dans le frontend. Seule la clé `anon` publique doit être utilisée.

---

## 5. Installation et Lancement Local

### Prérequis
- Node.js version 18 ou supérieure.
- npm ou yarn.

### Instructions de lancement :

1. **Installer les dépendances** :
```bash
npm install
```

2. **Lancer le serveur de développement local** :
```bash
npm run dev
```
L'application démarre immédiatement sur `http://localhost:5173`.

3. **Compiler pour la production** :
```bash
npm run build
```

4. **Prévisualiser le build de production** :
```bash
npm run preview
```

---

## 6. Guide d'Utilisation

### Espace Client (Boutique Publique)
- Accessible à l'adresse racine : `http://localhost:5173/`.
- Permet d'explorer les t-shirts avec photos, de filtrer par catégorie (*Basic*, *Oversize*), couleur, taille et prix.
- La fiche produit permet de choisir sa taille, sa couleur, sa quantité et de consulter le guide des tailles en centimètres.
- Le clic sur **"Commander sur WhatsApp"** ouvre directement l'application WhatsApp avec un message pré-rempli au format international (`wa.me`) sans faux formulaire de paiement.

### Espace Administrateur
- Accessible via : `http://localhost:5173/admin`.
- Si Supabase n'est pas encore relié, l'application propose un **Mode Démo Local** avec les identifiants préconfigurés :
  - **E-mail** : `admin@maisonblanche.ci`
  - **Mot de passe** : `admin123`
- Une fois connecté :
  - **Page 1 - Dashboard** : Suivi des 6 indicateurs clés (visiteurs uniques, clics WhatsApp, commandes, livraisons effectuées, commandes en attente, commandes annulées) et graphiques d'évolution par jour filtrables par période.
  - **Page 2 - Produits** : Ajout, modification, upload d'images, prix en FCFA, couleurs et visibilité sur le site.
  - **Page 3 - Commandes** : Saisie manuelle des demandes reçues sur WhatsApp, assignation du statut et suivi du montant total (prix + livraison).
  - **Page 4 - Livraisons** : Suivi des commandes prêtes, assignation du livreur, validation de livraison avec date et historique dédoublonné.
  - **Page 5 - Analytiques** : Classement des produits les plus consultés et des t-shirts générant le plus de clics WhatsApp.
  - **Page 6 - Paramètres** : Modification du numéro WhatsApp de réception des commandes, du logo et des coordonnées de la marque à Abidjan.
