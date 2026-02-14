-- Table ventes_lignes - détails des ventes (produits, quantités, prix)
-- Compatible avec id BIGINT (ventes, produits)
-- Exécutez dans : Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS ventes_lignes (
  id BIGSERIAL PRIMARY KEY,
  vente_id BIGINT NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
  produit_id BIGINT REFERENCES produits(id) ON DELETE SET NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(12,2) NOT NULL,
  reduction_unitaire NUMERIC(12,2) DEFAULT 0,
  sous_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ventes_lignes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated read ventes_lignes" ON ventes_lignes;
DROP POLICY IF EXISTS "Authenticated insert ventes_lignes" ON ventes_lignes;
DROP POLICY IF EXISTS "Authenticated update ventes_lignes" ON ventes_lignes;
DROP POLICY IF EXISTS "Authenticated delete ventes_lignes" ON ventes_lignes;

CREATE POLICY "Authenticated read ventes_lignes" ON ventes_lignes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert ventes_lignes" ON ventes_lignes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update ventes_lignes" ON ventes_lignes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete ventes_lignes" ON ventes_lignes FOR DELETE TO authenticated USING (true);
