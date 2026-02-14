-- ============================================
-- Kouma Fashion - Réinitialisation complète de la base de données
-- ============================================
-- ATTENTION : Ce script supprime TOUTES les données de l'application.
-- Utilisez-le uniquement pour repartir à zéro avant la livraison.
--
-- Exécution : Supabase Dashboard > SQL Editor > Coller ce script > Run
--
-- Ce qui est supprimé :
--   - Tous les produits, clients, fournisseurs
--   - Toutes les ventes, lignes de ventes, mouvements de stock
--   - Tout l'historique des règlements (dettes clients et fournisseurs)
--
-- Ce qui est conservé :
--   - La structure des tables (colonnes, index, RLS)
--   - Les comptes utilisateurs (Authentication)
--   - Les séquences sont réinitialisées (BIGSERIAL, etc.)
-- ============================================

BEGIN;

-- Désactiver temporairement les triggers pour éviter les conflits
SET session_replication_role = replica;

-- Suppression de toutes les données (CASCADE gère les dépendances automatiquement)
-- clients -> ventes -> ventes_lignes, reglements_clients
-- fournisseurs, produits -> mouvements -> reglements_fournisseurs
TRUNCATE TABLE clients, fournisseurs, produits
  CASCADE
  RESTART IDENTITY;

-- Réactiver les triggers
SET session_replication_role = DEFAULT;

COMMIT;

-- ============================================
-- Vérification (optionnel)
-- Décommentez pour vérifier que tout est vide :
-- ============================================
-- SELECT 'produits' AS table_name, COUNT(*) AS nb FROM produits
-- UNION ALL SELECT 'clients', COUNT(*) FROM clients
-- UNION ALL SELECT 'fournisseurs', COUNT(*) FROM fournisseurs
-- UNION ALL SELECT 'ventes', COUNT(*) FROM ventes
-- UNION ALL SELECT 'ventes_lignes', COUNT(*) FROM ventes_lignes
-- UNION ALL SELECT 'mouvements', COUNT(*) FROM mouvements
-- UNION ALL SELECT 'reglements_clients', COUNT(*) FROM reglements_clients
-- UNION ALL SELECT 'reglements_fournisseurs', COUNT(*) FROM reglements_fournisseurs;

-- ============================================
-- Note sur les comptes utilisateurs
-- ============================================
-- Les comptes de connexion (email/mot de passe) sont gérés par Supabase Auth.
-- Pour supprimer des comptes de test : Supabase Dashboard > Authentication > Users
-- Le propriétaire peut créer son propre compte ou vous pouvez lui transmettre
-- les identifiants du compte principal.
