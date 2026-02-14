-- Table mouvements - compatible avec id BIGINT (produits, fournisseurs)
-- Exécutez dans : Supabase Dashboard > SQL Editor
-- Si la table existe déjà avec une mauvaise structure, décommentez la ligne suivante :
-- DROP TABLE IF EXISTS mouvements CASCADE;

CREATE TABLE IF NOT EXISTS mouvements (
  id BIGSERIAL PRIMARY KEY,
  produit_id BIGINT REFERENCES produits(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie')),
  quantite INTEGER NOT NULL,
  motif TEXT,
  provenance TEXT,
  fournisseur_id BIGINT REFERENCES fournisseurs(id) ON DELETE SET NULL,
  montant_total NUMERIC(12,2) DEFAULT 0,
  montant_paye NUMERIC(12,2) DEFAULT 0,
  restant_a_payer NUMERIC(12,2) DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mouvements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read mouvements" ON mouvements;
DROP POLICY IF EXISTS "Authenticated insert mouvements" ON mouvements;
DROP POLICY IF EXISTS "Authenticated update mouvements" ON mouvements;
DROP POLICY IF EXISTS "Authenticated delete mouvements" ON mouvements;

CREATE POLICY "Authenticated read mouvements" ON mouvements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert mouvements" ON mouvements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update mouvements" ON mouvements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete mouvements" ON mouvements FOR DELETE TO authenticated USING (true);
