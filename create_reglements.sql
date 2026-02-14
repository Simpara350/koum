-- ============================================
-- Historique des règlements (dettes clients et fournisseurs)
-- Exécutez dans : Supabase Dashboard > SQL Editor
-- ============================================

-- Règlements clients (liés aux ventes/factures)
-- Compatible ventes.id en UUID ou BIGINT
CREATE TABLE IF NOT EXISTS reglements_clients (
  id BIGSERIAL PRIMARY KEY,
  vente_id BIGINT NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
  montant NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Règlements fournisseurs (liés aux mouvements/bons)
CREATE TABLE IF NOT EXISTS reglements_fournisseurs (
  id BIGSERIAL PRIMARY KEY,
  mouvement_id BIGINT NOT NULL REFERENCES mouvements(id) ON DELETE CASCADE,
  montant NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reglements_clients_vente ON reglements_clients(vente_id);
CREATE INDEX IF NOT EXISTS idx_reglements_fournisseurs_mouvement ON reglements_fournisseurs(mouvement_id);

-- RLS
ALTER TABLE reglements_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reglements_fournisseurs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated reglements_clients" ON reglements_clients;
  CREATE POLICY "Authenticated reglements_clients" ON reglements_clients
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated reglements_fournisseurs" ON reglements_fournisseurs;
  CREATE POLICY "Authenticated reglements_fournisseurs" ON reglements_fournisseurs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
END $$;
