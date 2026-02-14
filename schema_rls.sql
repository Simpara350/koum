-- ============================================
-- Kouma Fashion - Politiques RLS uniquement
-- Exécutez dans : Supabase Dashboard > SQL Editor
-- ============================================

-- Activer RLS sur les tables existantes
-- (ventes_lignes exclue si la table n'existe pas)
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Authenticated read produits" ON produits;
DROP POLICY IF EXISTS "Authenticated insert produits" ON produits;
DROP POLICY IF EXISTS "Authenticated update produits" ON produits;
DROP POLICY IF EXISTS "Authenticated delete produits" ON produits;

DROP POLICY IF EXISTS "Authenticated read clients" ON clients;
DROP POLICY IF EXISTS "Authenticated insert clients" ON clients;
DROP POLICY IF EXISTS "Authenticated update clients" ON clients;
DROP POLICY IF EXISTS "Authenticated delete clients" ON clients;

DROP POLICY IF EXISTS "Authenticated read fournisseurs" ON fournisseurs;
DROP POLICY IF EXISTS "Authenticated insert fournisseurs" ON fournisseurs;
DROP POLICY IF EXISTS "Authenticated update fournisseurs" ON fournisseurs;
DROP POLICY IF EXISTS "Authenticated delete fournisseurs" ON fournisseurs;

DROP POLICY IF EXISTS "Authenticated read ventes" ON ventes;
DROP POLICY IF EXISTS "Authenticated insert ventes" ON ventes;
DROP POLICY IF EXISTS "Authenticated update ventes" ON ventes;
DROP POLICY IF EXISTS "Authenticated delete ventes" ON ventes;

DROP POLICY IF EXISTS "Authenticated read mouvements" ON mouvements;
DROP POLICY IF EXISTS "Authenticated insert mouvements" ON mouvements;
DROP POLICY IF EXISTS "Authenticated update mouvements" ON mouvements;
DROP POLICY IF EXISTS "Authenticated delete mouvements" ON mouvements;

-- Produits : accès complet pour utilisateurs authentifiés
CREATE POLICY "Authenticated read produits" ON produits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert produits" ON produits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update produits" ON produits FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete produits" ON produits FOR DELETE TO authenticated USING (true);

-- Clients
CREATE POLICY "Authenticated read clients" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- Fournisseurs
CREATE POLICY "Authenticated read fournisseurs" ON fournisseurs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert fournisseurs" ON fournisseurs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update fournisseurs" ON fournisseurs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete fournisseurs" ON fournisseurs FOR DELETE TO authenticated USING (true);

-- Ventes
CREATE POLICY "Authenticated read ventes" ON ventes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert ventes" ON ventes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update ventes" ON ventes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete ventes" ON ventes FOR DELETE TO authenticated USING (true);

-- Mouvements
CREATE POLICY "Authenticated read mouvements" ON mouvements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert mouvements" ON mouvements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update mouvements" ON mouvements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete mouvements" ON mouvements FOR DELETE TO authenticated USING (true);
