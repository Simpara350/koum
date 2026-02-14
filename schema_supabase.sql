-- ============================================
-- Kouma Fashion - Schéma Supabase complet
-- Exécutez ce script dans : Supabase Dashboard > SQL Editor
-- ============================================

-- Table produits
CREATE TABLE IF NOT EXISTS produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  reference TEXT,
  categorie TEXT,
  prix_achat NUMERIC(12,2) DEFAULT 0,
  prix_vente NUMERIC(12,2) NOT NULL,
  quantite INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  telephone TEXT,
  email TEXT,
  adresse TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table ventes
CREATE TABLE IF NOT EXISTS ventes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  numero_facture TEXT,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  reduction_totale NUMERIC(12,2) DEFAULT 0,
  montant_paye NUMERIC(12,2) DEFAULT 0,
  restant_a_payer NUMERIC(12,2),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table ventes_lignes
CREATE TABLE IF NOT EXISTS ventes_lignes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vente_id UUID NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire NUMERIC(12,2) NOT NULL,
  reduction_unitaire NUMERIC(12,2) DEFAULT 0,
  sous_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table mouvements (entrées/sorties stock)
CREATE TABLE IF NOT EXISTS mouvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('entree', 'sortie')),
  quantite INTEGER NOT NULL,
  motif TEXT,
  provenance TEXT,
  fournisseur_id UUID REFERENCES fournisseurs(id) ON DELETE SET NULL,
  montant_total NUMERIC(12,2) DEFAULT 0,
  montant_paye NUMERIC(12,2) DEFAULT 0,
  restant_a_payer NUMERIC(12,2) DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_ventes_client ON ventes(client_id);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON ventes(date);
CREATE INDEX IF NOT EXISTS idx_ventes_restant ON ventes(restant_a_payer);
CREATE INDEX IF NOT EXISTS idx_ventes_lignes_vente ON ventes_lignes(vente_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_produit ON mouvements(produit_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements(date);
CREATE INDEX IF NOT EXISTS idx_mouvements_type ON mouvements(type);

-- RLS (Row Level Security) - à activer après création du premier utilisateur
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : accès pour les utilisateurs authentifiés uniquement
DO $$
BEGIN
  -- produits
  DROP POLICY IF EXISTS "Authenticated read produits" ON produits;
  DROP POLICY IF EXISTS "Authenticated insert produits" ON produits;
  DROP POLICY IF EXISTS "Authenticated update produits" ON produits;
  DROP POLICY IF EXISTS "Authenticated delete produits" ON produits;
  CREATE POLICY "Authenticated read produits" ON produits FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated insert produits" ON produits FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "Authenticated update produits" ON produits FOR UPDATE TO authenticated USING (true);
  CREATE POLICY "Authenticated delete produits" ON produits FOR DELETE TO authenticated USING (true);

  -- clients
  DROP POLICY IF EXISTS "Authenticated read clients" ON clients;
  DROP POLICY IF EXISTS "Authenticated insert clients" ON clients;
  DROP POLICY IF EXISTS "Authenticated update clients" ON clients;
  DROP POLICY IF EXISTS "Authenticated delete clients" ON clients;
  CREATE POLICY "Authenticated read clients" ON clients FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "Authenticated update clients" ON clients FOR UPDATE TO authenticated USING (true);
  CREATE POLICY "Authenticated delete clients" ON clients FOR DELETE TO authenticated USING (true);

  -- fournisseurs
  DROP POLICY IF EXISTS "Authenticated read fournisseurs" ON fournisseurs;
  DROP POLICY IF EXISTS "Authenticated insert fournisseurs" ON fournisseurs;
  DROP POLICY IF EXISTS "Authenticated update fournisseurs" ON fournisseurs;
  DROP POLICY IF EXISTS "Authenticated delete fournisseurs" ON fournisseurs;
  CREATE POLICY "Authenticated read fournisseurs" ON fournisseurs FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated insert fournisseurs" ON fournisseurs FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "Authenticated update fournisseurs" ON fournisseurs FOR UPDATE TO authenticated USING (true);
  CREATE POLICY "Authenticated delete fournisseurs" ON fournisseurs FOR DELETE TO authenticated USING (true);

  -- ventes
  DROP POLICY IF EXISTS "Authenticated read ventes" ON ventes;
  DROP POLICY IF EXISTS "Authenticated insert ventes" ON ventes;
  DROP POLICY IF EXISTS "Authenticated update ventes" ON ventes;
  DROP POLICY IF EXISTS "Authenticated delete ventes" ON ventes;
  CREATE POLICY "Authenticated read ventes" ON ventes FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated insert ventes" ON ventes FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "Authenticated update ventes" ON ventes FOR UPDATE TO authenticated USING (true);
  CREATE POLICY "Authenticated delete ventes" ON ventes FOR DELETE TO authenticated USING (true);

  -- ventes_lignes
  DROP POLICY IF EXISTS "Authenticated read ventes_lignes" ON ventes_lignes;
  DROP POLICY IF EXISTS "Authenticated insert ventes_lignes" ON ventes_lignes;
  DROP POLICY IF EXISTS "Authenticated update ventes_lignes" ON ventes_lignes;
  DROP POLICY IF EXISTS "Authenticated delete ventes_lignes" ON ventes_lignes;
  CREATE POLICY "Authenticated read ventes_lignes" ON ventes_lignes FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated insert ventes_lignes" ON ventes_lignes FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "Authenticated update ventes_lignes" ON ventes_lignes FOR UPDATE TO authenticated USING (true);
  CREATE POLICY "Authenticated delete ventes_lignes" ON ventes_lignes FOR DELETE TO authenticated USING (true);

  -- mouvements
  DROP POLICY IF EXISTS "Authenticated read mouvements" ON mouvements;
  DROP POLICY IF EXISTS "Authenticated insert mouvements" ON mouvements;
  DROP POLICY IF EXISTS "Authenticated update mouvements" ON mouvements;
  DROP POLICY IF EXISTS "Authenticated delete mouvements" ON mouvements;
  CREATE POLICY "Authenticated read mouvements" ON mouvements FOR SELECT TO authenticated USING (true);
  CREATE POLICY "Authenticated insert mouvements" ON mouvements FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "Authenticated update mouvements" ON mouvements FOR UPDATE TO authenticated USING (true);
  CREATE POLICY "Authenticated delete mouvements" ON mouvements FOR DELETE TO authenticated USING (true);
END $$;
