# Tâches à faire — fiabilisation de l’administration

Objectif : rendre les rubriques WhatsApp, livraisons, produits et commandes cohérentes avec les données réellement enregistrées, et éviter d’afficher des informations supposées.

## Priorité 0 — Bloquant avant mise en production

- [x] **Sécuriser la vérification du rôle administrateur** (`src/context/AuthContext.jsx`)
  - Supprimer le comportement qui accorde le rôle admin lorsqu’une vérification Supabase échoue.
  - En cas d’erreur de vérification, refuser l’accès ou afficher une erreur explicite.
  - Vérifier qu’un compte sans rôle `admin` ou `superadmin` ne peut pas accéder aux pages ni modifier les données.

- [x] **Corriger l’enregistrement des commandes Supabase** (`src/context/StoreContext.jsx`, `supabase/schema.sql`)
  - Ne pas envoyer `total_amount` lors de l’insertion : cette colonne est générée par la base.
  - Laisser la base générer le numéro de commande plutôt que de le calculer à partir du nombre de commandes chargé dans le navigateur.
  - Vérifier qu’une commande peut être créée, modifiée et relue sans erreur avec Supabase.

- [x] **Séparer les données de démonstration des vraies données** (`supabase/seed.sql`)
  - Retirer les fausses commandes, coordonnées clients et événements analytiques du seed de production, ou les isoler clairement dans un jeu de démonstration.
  - Ajouter une protection ou une consigne empêchant l’insertion de données de démonstration sur la base de production.
  - Vérifier que les tableaux admin ne présentent jamais des exemples comme de vraies commandes.

## Priorité 1 — Exactitude des commandes, produits et livraisons

- [x] **Fiabiliser les erreurs et la source des données** (`src/context/StoreContext.jsx`, `src/components/admin/AdminSidebar.jsx`)
  - Ne pas basculer silencieusement sur des données locales quand Supabase est configuré mais indisponible.
  - Distinguer visiblement le mode local/démo du mode Supabase réellement connecté.
  - Afficher une erreur et permettre une nouvelle tentative lorsque le chargement ou l’enregistrement échoue.
  - Ne pas remplacer des données existantes par des valeurs de secours présentées comme actuelles.

- [x] **Éviter les totaux différents selon la page** (`src/context/StoreContext.jsx`, pages Commandes et Tableau de bord)
  - Recalculer `total_amount` dans le stockage local après toute modification du prix unitaire, de la quantité ou des frais.
  - Utiliser la même règle de calcul dans les commandes, les livraisons et le tableau de bord.
  - Vérifier les modifications en mode local et Supabase.

- [x] **Rendre l’état de stock fidèle** (`src/pages/admin/AdminProductsPage.jsx`, pages publiques)
  - Prendre en charge `low_stock` dans la création, la modification et l’affichage du produit, ou supprimer cette valeur du modèle si elle n’est pas utilisée.
  - Ne jamais afficher « En stock » pour un produit en stock faible ou en rupture.
  - Empêcher ou signaler clairement la commande de produits masqués ou en rupture.

- [x] **Aligner les catégories entre le formulaire et le schéma** (`src/pages/admin/AdminProductsPage.jsx`, `supabase/schema.sql`)
  - Ajouter « Édition Spéciale » dans l’interface si cette catégorie reste supportée.
  - Vérifier que chaque catégorie autorisée par la base est sélectionnable et affichée correctement.

- [x] **Rendre l’affectation du livreur cohérente** (`src/pages/admin/AdminDeliveriesPage.jsx`)
  - Ne pas passer une commande « En livraison » si le nom du livreur est vide.
  - Signaler les erreurs d’enregistrement et éviter les confirmations de succès en double.
  - Vérifier qu’une livraison n’est marquée comme terminée qu’après validation des informations requises.

- [x] **Ne pas confondre livraison et paiement encaissé** (`src/pages/admin/AdminDeliveriesPage.jsx`, modèle de commande)
  - Remplacer « montant collecté » par un libellé de montant attendu tant qu’aucun paiement n’est suivi.
  - Si le suivi d’encaissement est requis, ajouter un état de paiement distinct, le persister et l’afficher séparément du statut de livraison.

## Priorité 2 — Synchronisation et suivi WhatsApp

- [x] **Définir et implémenter la synchronisation entre sessions**
  - Choisir entre mise à jour temps réel Supabase et actualisation explicite/régulière.
  - Faire en sorte que plusieurs onglets ou comptes admin ne conservent pas indéfiniment des états différents.
  - Afficher la date de dernière actualisation et signaler les données non actualisées si nécessaire.

- [x] **Présenter WhatsApp comme un suivi de clics, pas comme une liste de messages ou de commandes** (`src/pages/admin/AdminWhatsAppPage.jsx`, `src/lib/analytics.js`)
  - Indiquer clairement qu’un clic ne prouve ni l’envoi d’un message ni la validation d’une commande.
  - Garder le nom et le numéro comme « à demander dans WhatsApp » : le site ne peut pas les obtenir automatiquement au clic.
  - Si l’import automatique des conversations est souhaité plus tard, étudier séparément l’intégration officielle WhatsApp Business et ses webhooks.

- [x] **Fiabiliser l’historique des clics WhatsApp**
  - Ajouter une pagination ou un filtre de période au lieu de limiter l’historique visible aux 100 derniers clics.
  - Afficher les erreurs de lecture et permettre de réessayer.
  - Distinguer les clics réellement enregistrés des clics non suivis (consentement refusé ou échec d’enregistrement).

- [x] **Corriger les dates et les périodes analytiques** (`src/context/StoreContext.jsx`, pages Analytics et Tableau de bord)
  - Calculer les livraisons selon `delivered_at`, et non uniquement selon la date de commande.
  - Vérifier les fuseaux horaires des dates saisies et enregistrées.
  - Faire correspondre la période affichée par les graphiques à celle des métriques, notamment pour « Toutes les périodes ».

## Vérifications finales

- [ ] Tester création, modification et suppression de produits et commandes en mode Supabase.
- [ ] Tester les mêmes parcours en mode local/démo, y compris les totaux après modification.
- [ ] Vérifier les statuts de livraison, le nom du livreur, les dates et l’affichage des montants.
- [ ] Tester deux onglets ou deux sessions admin et confirmer le comportement de synchronisation choisi.
- [ ] Vérifier les erreurs réseau, erreurs RLS et données de démonstration : aucun échec ne doit être présenté comme un succès.
- [x] Exécuter le build de production et corriger les erreurs introduites par les changements.

## À faire avant la mise en production

- [ ] Appliquer `supabase/migrations/202611190001_admin_data_integrity.sql` sur le projet Supabase après avoir vérifié que les enregistrements de démonstration ciblés ne sont pas des données réelles.
- [ ] Configurer le vrai numéro WhatsApp de l’entreprise après suppression du numéro fictif.
- [ ] Effectuer les parcours de vérification ci-dessus sur le projet Supabase réel, notamment les accès admin, les erreurs RLS et la synchronisation entre plusieurs sessions.

Le build local passe. Les vérifications nécessitant un accès au projet Supabase ne peuvent pas être confirmées depuis ce dépôt seul.
