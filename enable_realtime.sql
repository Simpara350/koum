-- ============================================
-- Kouma Fashion - Activer Supabase Realtime
-- ============================================
-- Ce script ajoute les tables à la publication Realtime pour que
-- les changements (INSERT, UPDATE, DELETE) soient diffusés en temps réel.
--
-- Exécution : Supabase Dashboard > SQL Editor > Coller ce script > Run
--
-- Si une table est déjà dans la publication, vous aurez une erreur
-- "already member of publication" pour cette ligne - ignorez-la.
--
-- Alternative : Supabase Dashboard > Database > Replication
-- puis activer manuellement chaque table sous "supabase_realtime"
-- ============================================

-- Ajouter les tables à la publication Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE produits;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE fournisseurs;
ALTER PUBLICATION supabase_realtime ADD TABLE ventes;
ALTER PUBLICATION supabase_realtime ADD TABLE ventes_lignes;
ALTER PUBLICATION supabase_realtime ADD TABLE mouvements;

-- Tables des règlements (exécutez create_reglements.sql avant si nécessaire)
ALTER PUBLICATION supabase_realtime ADD TABLE reglements_clients;
ALTER PUBLICATION supabase_realtime ADD TABLE reglements_fournisseurs;
