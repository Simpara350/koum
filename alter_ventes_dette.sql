-- Ajouter la colonne restant_a_payer pour les dettes clients
-- Exécutez dans : Supabase Dashboard > SQL Editor

ALTER TABLE ventes ADD COLUMN IF NOT EXISTS restant_a_payer NUMERIC(12,2);
