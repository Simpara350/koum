-- ============================================
-- Kouma Fashion - Colonnes pour les dettes
-- Exécutez dans : Supabase Dashboard > SQL Editor
-- ============================================

-- DETTE CLIENT : au moment de la vente
-- restant_a_payer = ce que le client doit encore (total - montant_paye)
ALTER TABLE ventes ADD COLUMN IF NOT EXISTS restant_a_payer NUMERIC(12,2);

-- DETTE FOURNISSEUR : au moment de l'entrée de produit
-- montant_total = coût total de l'achat
-- montant_paye = ce qu'on a déjà payé au fournisseur
-- restant_a_payer = ce qu'on doit encore au fournisseur
ALTER TABLE mouvements ADD COLUMN IF NOT EXISTS montant_total NUMERIC(12,2) DEFAULT 0;
ALTER TABLE mouvements ADD COLUMN IF NOT EXISTS montant_paye NUMERIC(12,2) DEFAULT 0;
ALTER TABLE mouvements ADD COLUMN IF NOT EXISTS restant_a_payer NUMERIC(12,2) DEFAULT 0;
