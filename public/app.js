/**
 * Kouma Fashion - Application de gestion de boutique
 * Utilise Supabase pour l'authentification et la base de données
 */

(function () {
  'use strict';

  // --- Configuration Supabase ---
  const cfg = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : {};
  const supabase = window.supabase && cfg.url && cfg.anonKey
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;

  if (!supabase) {
    console.error('Supabase non configuré. Vérifiez config.js');
    return;
  }

  // --- Éléments DOM ---
  const authScreen = document.getElementById('auth-screen');
  const appMain = document.getElementById('app-main');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const btnShowSignup = document.getElementById('btn-show-signup');
  const btnShowLogin = document.getElementById('btn-show-login');
  const btnLogout = document.getElementById('btn-logout');
  const authError = document.getElementById('auth-error');
  const authSignupError = document.getElementById('auth-signup-error');

  // --- Utilitaires ---
  function showToast(msg, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show ' + (type || '');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
  }

  function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  }

  function formatNumber(n) {
    return Number(n).toLocaleString('fr-FR');
  }

  function formatDate(d) {
    if (!d) return '-';
    const x = new Date(d);
    return isNaN(x.getTime()) ? d : x.toLocaleDateString('fr-FR');
  }

  // Exposer closeModal pour onclick
  window.closeModal = closeModal;

  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  const CACHE_PREFIX = 'kouma_fashion_';
  const CACHE_VERSION = 1;

  function getCache(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.v !== CACHE_VERSION) return null;
      return parsed.data;
    } catch (_) { return null; }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ v: CACHE_VERSION, data }));
    } catch (_) {}
  }

  // --- Auth ---
  function translateAuthError(msg, isSignup = false) {
    if (!msg) return 'Une erreur est survenue.';
    const m = String(msg).toLowerCase();
    if (m.includes('invalid') && m.includes('credential')) return 'Email ou mot de passe incorrect.';
    if (m.includes('email') && m.includes('confirm')) return 'Veuillez confirmer votre email en cliquant sur le lien reçu.';
    if (m.includes('already') || m.includes('registered')) return 'Cet email est déjà utilisé. Créez un compte avec une autre adresse.';
    if (m.includes('password') && m.includes('weak')) return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (m.includes('invalid email')) return 'Adresse email invalide.';
    if (m.includes('user not found')) return 'Aucun compte avec cet email.';
    return msg;
  }

  function showAuthScreen() {
    if (authScreen) authScreen.classList.remove('hidden');
    if (appMain) appMain.classList.add('hidden');
  }

  function showApp() {
    if (authScreen) authScreen.classList.add('hidden');
    if (appMain) appMain.classList.remove('hidden');
    initApp();
  }

  async function initAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    document.body.classList.remove('auth-loading');
    if (session) {
      showApp();
      return;
    }
    showAuthScreen();
  }

  formLogin && formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (authError) authError.classList.add('hidden');
    if (!email) {
      if (authError) { authError.textContent = 'Veuillez entrer votre adresse email.'; authError.classList.remove('hidden'); }
      return;
    }
    if (!password) {
      if (authError) { authError.textContent = 'Veuillez entrer votre mot de passe.'; authError.classList.remove('hidden'); }
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (authError) {
        authError.textContent = translateAuthError(error.message);
        authError.classList.remove('hidden');
      }
      return;
    }
    showApp();
  });

  formSignup && formSignup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-password-confirm').value;
    if (authSignupError) authSignupError.classList.add('hidden');
    if (!email) {
      if (authSignupError) { authSignupError.textContent = 'Veuillez entrer une adresse email.'; authSignupError.classList.remove('hidden'); }
      return;
    }
    if (password.length < 6) {
      if (authSignupError) { authSignupError.textContent = 'Le mot de passe doit contenir au moins 6 caractères.'; authSignupError.classList.remove('hidden'); }
      return;
    }
    if (password !== confirm) {
      if (authSignupError) {
        authSignupError.textContent = 'Les deux mots de passe ne correspondent pas.';
        authSignupError.classList.remove('hidden');
      }
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      if (authSignupError) {
        authSignupError.textContent = translateAuthError(error.message, true);
        authSignupError.classList.remove('hidden');
      }
      return;
    }
    showToast('Compte créé. Vous pouvez vous connecter.');
    btnShowLogin && btnShowLogin.click();
  });

  btnShowSignup && btnShowSignup.addEventListener('click', () => {
    document.getElementById('auth-login-form').classList.add('hidden');
    document.getElementById('auth-signup-form').classList.remove('hidden');
    if (authError) authError.classList.add('hidden');
    if (authSignupError) authSignupError.classList.add('hidden');
  });

  btnShowLogin && btnShowLogin.addEventListener('click', () => {
    document.getElementById('auth-signup-form').classList.add('hidden');
    document.getElementById('auth-login-form').classList.remove('hidden');
    if (authSignupError) authSignupError.classList.add('hidden');
    if (authError) authError.classList.add('hidden');
  });

  btnLogout && btnLogout.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showAuthScreen();
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) showApp();
    if (event === 'SIGNED_OUT') showAuthScreen();
  });

  // --- Navigation (chargement paresseux par onglet) ---
  const tabLoaded = {};
  function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.toggle('active', el.dataset.tab === tabId));
    const section = document.getElementById(tabId);
    if (section) section.classList.add('active');
    document.querySelector('.nav-tabs')?.classList.remove('open');
    if (!tabLoaded[tabId]) {
      tabLoaded[tabId] = true;
      if (tabId === 'produits') loadProduits();
      else if (tabId === 'stock') loadMouvements();
      else if (tabId === 'clients') { loadClients(); loadFournisseurs(); }
      else if (tabId === 'ventes') { loadVentes(); loadProduitsSelect(); loadClientsSelect(); }
      else if (tabId === 'dettes') { loadDettesClients(); loadDettesFournisseurs(); loadHistoriqueReglements(); }
    }
  }

  const navToggle = document.getElementById('nav-toggle');
  const header = document.querySelector('.header');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
      header?.classList.remove('nav-open');
      navToggle?.classList.remove('active');
    });
  });

  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
      navToggle.classList.toggle('active');
    });
  }

  // Sous-onglets Clients / Fournisseurs
  document.querySelectorAll('.sub-tab[data-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.dataset.subtab;
      document.querySelectorAll('.sub-tab[data-subtab]').forEach(b => b.classList.toggle('active', b.dataset.subtab === subtab));
      document.getElementById('clients-section').classList.toggle('hidden', subtab !== 'clients');
      document.getElementById('fournisseurs-section').classList.toggle('hidden', subtab !== 'fournisseurs');
    });
  });

  // Sous-onglets Dettes
  document.querySelectorAll('.sub-tab[data-dette-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.dataset.detteSubtab;
      document.querySelectorAll('.sub-tab[data-dette-subtab]').forEach(b => b.classList.toggle('active', b.dataset.detteSubtab === subtab));
      document.getElementById('dettes-clients-section').classList.toggle('hidden', subtab !== 'clients');
      document.getElementById('dettes-fournisseurs-section').classList.toggle('hidden', subtab !== 'fournisseurs');
    });
  });

  // --- Dashboard ---
  let dashboardPeriod = 'tout';

  function getDateRange() {
    const now = new Date();
    let start = null;
    if (dashboardPeriod === 'journalier') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dashboardPeriod === 'mensuel') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dashboardPeriod === 'annuel') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return { start, end: now };
  }

  async function loadDashboard() {
    const { start, end } = getDateRange();
    const startStr = start ? start.toISOString().slice(0, 10) : null;
    const endStr = end.toISOString().slice(0, 10);

    const setStat = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatNumber(val);
    };

    let produits = [];
    try {
      const r = await supabase.from('produits').select('id, nom, quantite, prix_achat, prix_vente');
      produits = r?.data || [];
    } catch (_) {}
    const nbProduits = produits.length;
    const stockTotal = produits.reduce((s, p) => s + (Number(p.quantite) || 0), 0);
    const valeurStock = produits.reduce((s, p) => s + (Number(p.quantite) || 0) * (Number(p.prix_achat) || 0), 0);

    setStat('stat-produits', nbProduits);
    setStat('stat-stock', stockTotal);
    setStat('stat-valeur', valeurStock);

    let ventes = [];
    try {
      const r = await supabase.from('ventes').select('*');
      let data = r?.data || [];
      if (startStr && data.length) {
        const dateCol = data[0].date !== undefined ? 'date' : (data[0].created_at !== undefined ? 'created_at' : null);
        if (dateCol) {
          data = data.filter(v => {
            const d = (v[dateCol] || '').toString().slice(0, 10);
            return d >= startStr && d <= endStr;
          });
        }
      }
      ventes = data;
    } catch (_) {}
    const ca = ventes.reduce((s, v) => s + (Number(v.total ?? v.montant) || 0), 0);
    setStat('stat-ca', ca);
    setStat('stat-ventes', ventes.length);

    let dettesClients = 0, dettesFournisseurs = 0, payeFournisseurs = 0;
    try {
      const r = await supabase.from('ventes').select('*');
      (r?.data || []).forEach(v => { if (v.restant_a_payer != null) dettesClients += Number(v.restant_a_payer) || 0; });
    } catch (_) {}

    let mouvs = [];
    try {
      const r = await supabase.from('mouvements').select('*');
      let data = r?.data || [];
      if (startStr && data.length) {
        const dateCol = data[0].date !== undefined ? 'date' : (data[0].created_at !== undefined ? 'created_at' : null);
        if (dateCol) {
          data = data.filter(m => {
            const d = (m[dateCol] || '').toString().slice(0, 10);
            return d >= startStr && d <= endStr;
          });
        }
      }
      mouvs = data;
    } catch (_) {}
    mouvs.forEach(m => {
      dettesFournisseurs += Number(m.restant_a_payer) || 0;
      payeFournisseurs += Number(m.montant_paye) || 0;
    });

    setStat('stat-dette-client', dettesClients);
    setStat('stat-dette-fournisseur', dettesFournisseurs);
    setStat('stat-paye-fournisseur', payeFournisseurs);

    renderRuptureList('dashboard-rupture', produits || []);
  }

  document.querySelectorAll('.filter-btn[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      dashboardPeriod = btn.dataset.period;
      document.querySelectorAll('.filter-btn[data-period]').forEach(b => b.classList.toggle('active', b.dataset.period === dashboardPeriod));
      loadDashboard();
    });
  });

  // --- Produits ---
  function renderProduits(data) {
    const tbody = document.getElementById('produits-list');
    if (!tbody) return;
    tbody.innerHTML = (data || []).map(p => `
      <tr>
        <td>${p.reference || '-'}</td>
        <td>${p.nom || '-'}</td>
        <td>${p.categorie || '-'}</td>
        <td>${formatNumber(p.prix_achat)}</td>
        <td>${formatNumber(p.prix_vente)}</td>
        <td>${formatNumber(p.quantite)}</td>
        <td>
          <button class="btn btn-sm btn-outline" data-edit-produit="${p.id}">Modifier</button>
          <button class="btn btn-sm btn-danger" data-delete-produit="${p.id}">Suppr.</button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-edit-produit]').forEach(b => b.addEventListener('click', () => openProduitModal(b.dataset.editProduit)));
    tbody.querySelectorAll('[data-delete-produit]').forEach(b => b.addEventListener('click', () => deleteProduit(b.dataset.deleteProduit)));
  }

  async function loadProduits() {
    const cached = getCache('produits');
    if (cached) renderProduits(cached);
    const { data, error } = await supabase.from('produits').select('*').order('nom');
    const tbody = document.getElementById('produits-list');
    if (!tbody) return;
    if (error) {
      if (!cached) tbody.innerHTML = '<tr><td colspan="7">Impossible de charger les produits. Vérifiez votre connexion.</td></tr>';
      return;
    }
    renderProduits(data || []);
    setCache('produits', data || []);
  }

  function openProduitModal(id) {
    document.getElementById('modal-produit-title').textContent = id ? 'Modifier le produit' : 'Nouveau produit';
    document.getElementById('produit-id').value = id || '';
    document.getElementById('produit-quantite-group').style.display = id ? 'none' : 'block';
    if (id) {
      supabase.from('produits').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          document.getElementById('produit-nom').value = data.nom || '';
          document.getElementById('produit-reference').value = data.reference || '';
          document.getElementById('produit-categorie').value = data.categorie || '';
          document.getElementById('produit-prix-achat').value = data.prix_achat || 0;
          document.getElementById('produit-prix-vente').value = data.prix_vente || 0;
          document.getElementById('produit-quantite').value = data.quantite || 0;
        }
      });
    } else {
      document.getElementById('form-produit').reset();
      document.getElementById('produit-id').value = '';
    }
    openModal('modal-produit');
  }

  async function deleteProduit(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    const { error } = await supabase.from('produits').delete().eq('id', id);
    if (error) showToast('Erreur lors de la suppression. Réessayez.', 'error');
    else { showToast('Produit supprimé'); loadProduits(); loadDashboard(); }
  }

  document.getElementById('btn-add-produit')?.addEventListener('click', () => openProduitModal());

  document.getElementById('form-produit')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('produit-nom').value.trim();
    const prixVente = Number(document.getElementById('produit-prix-vente').value);
    if (!nom) { showToast('Le nom du produit est obligatoire.', 'error'); return; }
    if (isNaN(prixVente) || prixVente < 0) { showToast('Le prix de vente doit être un nombre positif.', 'error'); return; }
    const id = document.getElementById('produit-id').value;
    const payload = {
      nom,
      reference: document.getElementById('produit-reference').value.trim() || null,
      categorie: document.getElementById('produit-categorie').value.trim() || null,
      prix_achat: Number(document.getElementById('produit-prix-achat').value) || 0,
      prix_vente: prixVente
    };
    if (!id) payload.quantite = Number(document.getElementById('produit-quantite').value) || 0;
    const { error } = id
      ? await supabase.from('produits').update(payload).eq('id', id)
      : await supabase.from('produits').insert(payload);
    if (error) showToast('Erreur lors de l\'enregistrement. Réessayez.', 'error');
    else { showToast('Produit enregistré'); closeModal('modal-produit'); loadProduits(); loadDashboard(); }
  });

  // --- Recherche (debounce 120ms) ---
  function filterTableRows(inputId, tableBodyId) {
    const input = document.getElementById(inputId);
    const tbody = document.getElementById(tableBodyId);
    if (!input || !tbody) return;
    const doFilter = () => {
      const q = input.value.toLowerCase().trim();
      tbody.querySelectorAll('tr').forEach(tr => {
        tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    };
    input.addEventListener('input', debounce(doFilter, 120));
  }

  filterTableRows('search-produits', 'produits-list');
  filterTableRows('search-stock', 'mouvements-list');
  filterTableRows('search-clients', 'clients-list');
  filterTableRows('search-clients', 'fournisseurs-list');
  filterTableRows('search-dettes', 'dettes-clients-list');
  filterTableRows('search-dettes', 'dettes-fournisseurs-list');

  // --- Export Excel ---
  async function exportProduitsExcel() {
    try {
      if (typeof XLSX === 'undefined') { showToast('Bibliothèque Excel non chargée. Rechargez la page.', 'error'); return; }
      showToast('Export en cours...');
      const { data, error } = await supabase.from('produits').select('*').order('nom');
      if (error) { showToast('Erreur lors du chargement. Réessayez.', 'error'); return; }
      const rows = (data || []).map(p => ({
        Référence: p.reference || '',
        Nom: p.nom || '',
        Catégorie: p.categorie || '',
        'Prix achat (FCFA)': Number(p.prix_achat) || 0,
        'Prix vente (FCFA)': Number(p.prix_vente) || 0,
        Stock: Number(p.quantite) || 0
      }));
      if (rows.length === 0) showToast('Aucun produit à exporter (fichier vide généré)');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produits');
      XLSX.writeFile(wb, 'produits-kouma-fashion.xlsx');
      showToast('Export téléchargé');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'export. Réessayez.', 'error');
    }
  }

  async function exportVentesExcel() {
    try {
      if (typeof XLSX === 'undefined') { showToast('Bibliothèque Excel non chargée. Rechargez la page.', 'error'); return; }
      showToast('Export en cours...');
      const { data: ventesData, error } = await supabase.from('ventes').select('*');
      if (error) { showToast('Erreur lors du chargement. Réessayez.', 'error'); return; }
      const sorted = (ventesData || []).slice().sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
      const clientIds = [...new Set(sorted.map(v => v.client_id).filter(Boolean))];
      const clientsMap = {};
      if (clientIds.length) {
        const { data: clients } = await supabase.from('clients').select('id, nom').in('id', clientIds);
        (clients || []).forEach(c => { clientsMap[c.id] = c.nom; });
      }
      const rows = sorted.map(v => ({
        'N° Facture': v.numero_facture || '',
        Client: clientsMap[v.client_id] || 'Anonyme',
        'Total (FCFA)': Number(v.total) || 0,
        'Réduction (FCFA)': Number(v.reduction_totale) || 0,
        'Montant payé (FCFA)': Number(v.montant_paye) || 0,
        'Reste à payer (FCFA)': Number(v.restant_a_payer) || 0,
        Date: formatDate(v.date || v.created_at)
      }));
      if (rows.length === 0) showToast('Aucune vente à exporter (fichier vide généré)');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ventes');
      XLSX.writeFile(wb, 'ventes-kouma-fashion.xlsx');
      showToast('Export téléchargé');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'export. Réessayez.', 'error');
    }
  }

  async function exportDettesExcel() {
    try {
      if (typeof XLSX === 'undefined') { showToast('Bibliothèque Excel non chargée. Rechargez la page.', 'error'); return; }
      showToast('Export en cours...');
      const wb = XLSX.utils.book_new();
      const { data: ventesData } = await supabase.from('ventes').select('*');
      const dataClients = (ventesData || []).filter(v => v.restant_a_payer != null);
      const clientIds = [...new Set(dataClients.map(v => v.client_id).filter(Boolean))];
      const clientsMap = {};
      if (clientIds.length) {
        const { data: clients } = await supabase.from('clients').select('id, nom').in('id', clientIds);
        (clients || []).forEach(c => { clientsMap[c.id] = c.nom; });
      }
      const rowsClients = dataClients.map(v => ({
        Statut: Number(v.restant_a_payer) > 0 ? 'En cours' : 'Réglée',
        Client: clientsMap[v.client_id] || 'Anonyme',
        'N° Facture': v.numero_facture || '',
        'Total (FCFA)': Number(v.total) || 0,
        'Payé (FCFA)': Number(v.montant_paye) || 0,
        'Reste (FCFA)': Number(v.restant_a_payer) || 0,
        Date: formatDate(v.date || v.created_at)
      }));
      const wsClients = XLSX.utils.json_to_sheet(rowsClients);
      XLSX.utils.book_append_sheet(wb, wsClients, 'Dettes clients');

      const { data: movData } = await supabase.from('mouvements').select('*').eq('type', 'entree');
      const dataFourn = movData || [];
      const prodIds = [...new Set(dataFourn.map(m => m.produit_id).filter(Boolean))];
      const fournIds = [...new Set(dataFourn.map(m => m.fournisseur_id).filter(Boolean))];
      const produitsMap = {}; const fournisseursMap = {};
      if (prodIds.length) { const { data: p } = await supabase.from('produits').select('id, nom').in('id', prodIds); (p || []).forEach(x => { produitsMap[x.id] = x.nom; }); }
      if (fournIds.length) { const { data: f } = await supabase.from('fournisseurs').select('id, nom').in('id', fournIds); (f || []).forEach(x => { fournisseursMap[x.id] = x.nom; }); }
      const rowsFourn = dataFourn.map(m => ({
        Statut: (Number(m.restant_a_payer) || 0) > 0 ? 'En cours' : 'Réglée',
        Fournisseur: fournisseursMap[m.fournisseur_id] || m.provenance || '-',
        Produit: produitsMap[m.produit_id] || '-',
        'Total (FCFA)': Number(m.montant_total) || 0,
        'Payé (FCFA)': Number(m.montant_paye) || 0,
        'Reste (FCFA)': Number(m.restant_a_payer) || 0,
        Date: formatDate(m.date)
      }));
      const wsFourn = XLSX.utils.json_to_sheet(rowsFourn);
      XLSX.utils.book_append_sheet(wb, wsFourn, 'Dettes fournisseurs');

      XLSX.writeFile(wb, 'dettes-kouma-fashion.xlsx');
      showToast('Export téléchargé');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'export. Réessayez.', 'error');
    }
  }

  async function exportStockExcel() {
    try {
      if (typeof XLSX === 'undefined') { showToast('Bibliothèque Excel non chargée. Rechargez la page.', 'error'); return; }
      showToast('Export en cours...');
      const { data: movData, error } = await supabase.from('mouvements').select('*').order('date', { ascending: false });
      if (error) { showToast('Erreur lors du chargement. Réessayez.', 'error'); return; }
      const prodIds = [...new Set((movData || []).map(m => m.produit_id).filter(Boolean))];
      const fournIds = [...new Set((movData || []).map(m => m.fournisseur_id).filter(Boolean))];
      const produitsMap = {}; const fournisseursMap = {};
      if (prodIds.length) { const { data: p } = await supabase.from('produits').select('id, nom, reference').in('id', prodIds); (p || []).forEach(x => { produitsMap[x.id] = x.nom || x.reference || 'Produit'; }); }
      if (fournIds.length) { const { data: f } = await supabase.from('fournisseurs').select('id, nom').in('id', fournIds); (f || []).forEach(x => { fournisseursMap[x.id] = x.nom; }); }
      const getProd = (m) => produitsMap[m.produit_id] || 'Produit';
      const getFourn = (m) => fournisseursMap[m.fournisseur_id] || m.provenance || '-';
      const rows = (movData || []).map(m => ({
        Date: formatDate(m.date),
        Produit: getProd(m),
        Type: m.type === 'entree' ? 'Entrée' : 'Sortie',
        Quantité: Number(m.quantite) || 0,
        Motif: m.motif || getFourn(m),
        Fournisseur: getFourn(m),
        'Montant total (FCFA)': Number(m.montant_total) || 0,
        'Montant payé (FCFA)': Number(m.montant_paye) || 0
      }));
      if (rows.length === 0) showToast('Aucun mouvement à exporter (fichier vide généré)');
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mouvements');
      XLSX.writeFile(wb, 'stock-mouvements-kouma-fashion.xlsx');
      showToast('Export téléchargé');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'export. Réessayez.', 'error');
    }
  }

  document.addEventListener('click', (e) => {
    const id = e.target.id;
    if (id === 'btn-export-produits') { e.preventDefault(); exportProduitsExcel(); }
    else if (id === 'btn-export-ventes') { e.preventDefault(); exportVentesExcel(); }
    else if (id === 'btn-export-dettes') { e.preventDefault(); exportDettesExcel(); }
    else if (id === 'btn-export-stock') { e.preventDefault(); exportStockExcel(); }
  });

  // --- Stock / Mouvements ---
  const SEUIL_RUPTURE = 5;

  function renderRuptureList(containerId, produits) {
    const rupture = (produits || []).filter(p => (Number(p.quantite) || 0) <= SEUIL_RUPTURE);
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = rupture.length
      ? rupture.map(p => {
          const qte = Number(p.quantite) || 0;
          const label = qte === 0 ? 'Rupture' : `Stock faible (${qte})`;
          return `<div class="rupture-item">${(p.nom || 'Produit')} - ${label}</div>`;
        }).join('')
      : '<p class="text-muted">Aucun produit en alerte (stock &gt; 5)</p>';
  }

  function renderMouvements(movData, produitsMap, fournisseursMap) {
    const tbody = document.getElementById('mouvements-list');
    if (!tbody) return;
    const getProd = (m) => { const p = produitsMap[m.produit_id]; return p ? (p.nom || '') + (p.reference ? ' (' + p.reference + ')' : '') : 'Produit'; };
    const getFourn = (m) => { const f = fournisseursMap[m.fournisseur_id]; return f ? f.nom : (m.provenance || '-'); };
    tbody.innerHTML = (movData || []).map(m => `
      <tr>
        <td>${formatDate(m.date)}</td>
        <td>${getProd(m)}</td>
        <td><span class="badge badge-${m.type === 'entree' ? 'success' : 'danger'}">${m.type === 'entree' ? 'Entrée' : 'Sortie'}</span></td>
        <td>${formatNumber(m.quantite)}</td>
        <td>${m.motif || getFourn(m)}</td>
        <td>${m.type === 'entree' ? `<a href="#" class="link-bon link-pdf" data-bon="${m.id}">PDF</a>` : '-'}</td>
      </tr>
    `).join('');
    tbody.querySelectorAll('.link-bon').forEach(a => {
      a.addEventListener('click', (e) => { e.preventDefault(); telechargerBonReception(a.dataset.bon); });
    });
  }

  async function loadMouvements() {
    const tbody = document.getElementById('mouvements-list');
    if (!tbody) return;
    const cached = getCache('mouvements');
    if (cached?.movData) {
      renderMouvements(cached.movData, cached.produitsMap || {}, cached.fournisseursMap || {});
      const cachedProds = getCache('produits');
      if (cachedProds) renderRuptureList('stock-rupture', cachedProds);
    }
    const { data: movData, error } = await supabase.from('mouvements').select('*').order('date', { ascending: false });
    if (error) {
      if (!cached?.movData) tbody.innerHTML = '<tr><td colspan="6">Table mouvements absente. Exécutez schema_supabase.sql dans Supabase.</td></tr>';
      return;
    }
    const { data: produits } = await supabase.from('produits').select('id, nom, quantite');
    renderRuptureList('stock-rupture', produits || []);
    const prodIds = [...new Set((movData || []).map(m => m.produit_id).filter(Boolean))];
    const fournIds = [...new Set((movData || []).map(m => m.fournisseur_id).filter(Boolean))];
    const produitsMap = {};
    const fournisseursMap = {};
    if (prodIds.length) {
      const { data: prods } = await supabase.from('produits').select('id, nom, reference').in('id', prodIds);
      (prods || []).forEach(p => { produitsMap[p.id] = p; });
    }
    if (fournIds.length) {
      const { data: fourns } = await supabase.from('fournisseurs').select('id, nom').in('id', fournIds);
      (fourns || []).forEach(f => { fournisseursMap[f.id] = f; });
    }
    renderMouvements(movData || [], produitsMap, fournisseursMap);
    setCache('mouvements', { movData: movData || [], produitsMap, fournisseursMap });
  }

  document.getElementById('btn-entree')?.addEventListener('click', () => openMouvementModal('entree'));
  document.getElementById('btn-sortie')?.addEventListener('click', () => switchTab('ventes'));

  function openMouvementModal(type) {
    document.getElementById('mouvement-mode').value = 'existant';
    document.getElementById('mouvement-existant').classList.remove('hidden');
    document.getElementById('mouvement-nouveau').classList.add('hidden');
    const sel = document.getElementById('mouvement-produit');
    const selFourn = document.getElementById('mouvement-fournisseur-select');
    sel.innerHTML = '<option value="">-- Chargement... --</option>';
    selFourn.innerHTML = '<option value="">-- Chargement... --</option>';
    document.getElementById('form-mouvement').reset();
    document.getElementById('mouvement-quantite').value = 1;
    updateMouvementReste();
    openModal('modal-mouvement');
    Promise.all([
      supabase.from('produits').select('id, nom, reference').order('nom'),
      supabase.from('fournisseurs').select('id, nom').order('nom')
    ]).then(([rProds, rFourns]) => {
      const prods = rProds?.data || [];
      const fourns = rFourns?.data || [];
      sel.innerHTML = '<option value="">-- Sélectionner --</option>' + prods.map(p => `<option value="${p.id}">${p.nom || p.reference || p.id}</option>`).join('');
      selFourn.innerHTML = '<option value="">-- Ou sélectionner un fournisseur --</option>' + fourns.map(f => `<option value="${f.id}">${f.nom}</option>`).join('');
    }).catch(() => {
      sel.innerHTML = '<option value="">-- Erreur --</option>';
      selFourn.innerHTML = '<option value="">-- Erreur --</option>';
    });
  }

  document.getElementById('mouvement-mode')?.addEventListener('change', function () {
    const isNew = this.value === 'nouveau';
    document.getElementById('mouvement-existant').classList.toggle('hidden', isNew);
    document.getElementById('mouvement-nouveau').classList.toggle('hidden', !isNew);
  });

  function updateMouvementReste() {
    const total = Number(document.getElementById('mouvement-montant-total')?.value) || 0;
    const paye = Number(document.getElementById('mouvement-montant-paye')?.value) || 0;
    const reste = Math.max(0, total - paye);
    const el = document.getElementById('mouvement-reste');
    if (el) el.textContent = 'Reste à payer: ' + formatNumber(reste) + ' FCFA';
  }

  document.getElementById('mouvement-montant-total')?.addEventListener('input', updateMouvementReste);
  document.getElementById('mouvement-montant-paye')?.addEventListener('input', updateMouvementReste);
  document.getElementById('mouvement-montant-total')?.addEventListener('change', updateMouvementReste);
  document.getElementById('mouvement-montant-paye')?.addEventListener('change', updateMouvementReste);

  document.getElementById('form-mouvement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = document.getElementById('mouvement-mode').value;
    const qte = Number(document.getElementById('mouvement-quantite').value) || 0;
    if (qte < 1) { showToast('La quantité doit être au moins 1.', 'error'); return; }
    const provenance = document.getElementById('mouvement-provenance').value.trim() || null;
    const fournisseurId = document.getElementById('mouvement-fournisseur-select').value || null;
    const fournisseurNom = document.getElementById('mouvement-fournisseur').value.trim() || null;
    const montantTotal = Number(document.getElementById('mouvement-montant-total').value) || 0;
    const montantPaye = Number(document.getElementById('mouvement-montant-paye').value) || 0;
    let produitId = null;

    if (mode === 'existant') {
      produitId = document.getElementById('mouvement-produit').value;
      if (!produitId) { showToast('Veuillez sélectionner un produit.', 'error'); return; }
    } else {
      const nom = document.getElementById('mouvement-nom').value.trim();
      const pv = Number(document.getElementById('mouvement-prix-vente').value);
      if (!nom) { showToast('Le nom du produit est obligatoire.', 'error'); return; }
      if (isNaN(pv) || pv < 0) { showToast('Le prix de vente doit être un nombre positif.', 'error'); return; }
      const ref = document.getElementById('mouvement-reference').value.trim() || null;
      const cat = document.getElementById('mouvement-categorie').value.trim() || null;
      const pa = Number(document.getElementById('mouvement-prix-achat').value) || 0;
      const { data: newProd, error: errProd } = await supabase.from('produits').insert({
        nom, reference: ref, categorie: cat, prix_achat: pa, prix_vente: pv, quantite: 0
      }).select('id').single();
      if (errProd || !newProd) { showToast('Erreur lors de la création du produit. Réessayez.', 'error'); return; }
      produitId = newProd.id;
    }

    const { data: mov, error } = await supabase.from('mouvements').insert({
      produit_id: produitId,
      type: 'entree',
      quantite: qte,
      motif: provenance,
      provenance: provenance,
      fournisseur_id: fournisseurId || null,
      montant_total: montantTotal,
      montant_paye: montantPaye,
      restant_a_payer: Math.max(0, montantTotal - montantPaye)
    }).select('id').single();

    if (error) { showToast('Erreur lors de l\'enregistrement. Réessayez.', 'error'); return; }

    const { data: prod } = await supabase.from('produits').select('quantite').eq('id', produitId).single();
    if (prod) await supabase.from('produits').update({ quantite: (Number(prod.quantite) || 0) + qte }).eq('id', produitId);

    showToast('Entrée enregistrée');
    closeModal('modal-mouvement');
    loadMouvements();
    loadProduits();
    loadDashboard();
    if (Math.max(0, montantTotal - montantPaye) > 0) loadDettesFournisseurs();
    if (mov && mov.id) telechargerBonReception(mov.id);
  });

  // --- Clients ---
  function renderClients(data) {
    const tbody = document.getElementById('clients-list');
    if (!tbody) return;
    tbody.innerHTML = (data || []).map(c => `
      <tr>
        <td>${c.nom || '-'}</td>
        <td>${c.telephone || '-'}</td>
        <td>${c.email || '-'}</td>
        <td>${c.adresse || '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline" data-edit-client="${c.id}">Modifier</button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-edit-client]').forEach(b => b.addEventListener('click', () => openClientModal(b.dataset.editClient)));
  }

  async function loadClients() {
    const cached = getCache('clients');
    if (cached) renderClients(cached);
    const { data, error } = await supabase.from('clients').select('*').order('nom');
    const tbody = document.getElementById('clients-list');
    if (!tbody) return;
    if (error) { if (!cached) tbody.innerHTML = '<tr><td colspan="5">Erreur</td></tr>'; return; }
    renderClients(data || []);
    setCache('clients', data || []);
  }

  function openClientModal(id) {
    document.getElementById('modal-client-title').textContent = id ? 'Modifier le client' : 'Nouveau client';
    document.getElementById('client-id').value = id || '';
    if (id) {
      supabase.from('clients').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          document.getElementById('client-nom').value = data.nom || '';
          document.getElementById('client-telephone').value = data.telephone || '';
          document.getElementById('client-email').value = data.email || '';
          document.getElementById('client-adresse').value = data.adresse || '';
        }
      });
    } else document.getElementById('form-client').reset();
    openModal('modal-client');
  }

  document.getElementById('btn-add-client')?.addEventListener('click', () => openClientModal());
  document.getElementById('form-client')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('client-nom').value.trim();
    if (!nom) { showToast('Le nom du client est obligatoire.', 'error'); return; }
    const id = document.getElementById('client-id').value;
    const payload = {
      nom,
      telephone: document.getElementById('client-telephone').value.trim() || null,
      email: document.getElementById('client-email').value.trim() || null,
      adresse: document.getElementById('client-adresse').value.trim() || null
    };
    const { error } = id
      ? await supabase.from('clients').update(payload).eq('id', id)
      : await supabase.from('clients').insert(payload);
    if (error) showToast('Erreur lors de l\'enregistrement. Réessayez.', 'error');
    else { showToast('Client enregistré'); closeModal('modal-client'); loadClients(); loadClientsSelect(); }
  });

  // --- Fournisseurs ---
  function renderFournisseurs(data) {
    const tbody = document.getElementById('fournisseurs-list');
    if (!tbody) return;
    tbody.innerHTML = (data || []).map(f => `
      <tr>
        <td>${f.nom || '-'}</td>
        <td>${f.telephone || '-'}</td>
        <td>${f.email || '-'}</td>
        <td>${f.adresse || '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline" data-edit-fournisseur="${f.id}">Modifier</button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-edit-fournisseur]').forEach(b => b.addEventListener('click', () => openFournisseurModal(b.dataset.editFournisseur)));
  }

  async function loadFournisseurs() {
    const cached = getCache('fournisseurs');
    if (cached) renderFournisseurs(cached);
    const { data, error } = await supabase.from('fournisseurs').select('*').order('nom');
    const tbody = document.getElementById('fournisseurs-list');
    if (!tbody) return;
    if (error) { if (!cached) tbody.innerHTML = '<tr><td colspan="5">Erreur</td></tr>'; return; }
    renderFournisseurs(data || []);
    setCache('fournisseurs', data || []);
  }

  function openFournisseurModal(id) {
    document.getElementById('modal-fournisseur-title').textContent = id ? 'Modifier le fournisseur' : 'Nouveau fournisseur';
    document.getElementById('fournisseur-id').value = id || '';
    if (id) {
      supabase.from('fournisseurs').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          document.getElementById('fournisseur-nom').value = data.nom || '';
          document.getElementById('fournisseur-telephone').value = data.telephone || '';
          document.getElementById('fournisseur-email').value = data.email || '';
          document.getElementById('fournisseur-adresse').value = data.adresse || '';
        }
      });
    } else document.getElementById('form-fournisseur').reset();
    openModal('modal-fournisseur');
  }

  document.getElementById('btn-add-fournisseur')?.addEventListener('click', () => openFournisseurModal());
  document.getElementById('form-fournisseur')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('fournisseur-nom').value.trim();
    if (!nom) { showToast('Le nom du fournisseur est obligatoire.', 'error'); return; }
    const id = document.getElementById('fournisseur-id').value;
    const payload = {
      nom,
      telephone: document.getElementById('fournisseur-telephone').value.trim() || null,
      email: document.getElementById('fournisseur-email').value.trim() || null,
      adresse: document.getElementById('fournisseur-adresse').value.trim() || null
    };
    const { error } = id
      ? await supabase.from('fournisseurs').update(payload).eq('id', id)
      : await supabase.from('fournisseurs').insert(payload);
    if (error) showToast('Erreur lors de l\'enregistrement. Réessayez.', 'error');
    else { showToast('Fournisseur enregistré'); closeModal('modal-fournisseur'); loadFournisseurs(); loadFournisseursSelect(); }
  });

  // --- Dettes ---
  let detteFilterClients = 'en-cours';
  let detteFilterFournisseurs = 'en-cours';

  function renderDettesClients(data, clientsMap) {
    const tbody = document.getElementById('dettes-clients-list');
    if (!tbody) return;
    let rows = data.filter(v => Number(v.restant_a_payer) > 0 || detteFilterClients !== 'en-cours');
    if (detteFilterClients === 'reglees') rows = data.filter(v => Number(v.restant_a_payer) <= 0);
    if (detteFilterClients === 'toutes') rows = data;
    const clientNom = (v) => clientsMap[v.client_id] || (v.client_id ? 'Client inconnu' : 'Anonyme');
    tbody.innerHTML = rows.map(v => `
      <tr>
        <td><span class="badge badge-${Number(v.restant_a_payer) > 0 ? 'warning' : 'success'}">${Number(v.restant_a_payer) > 0 ? 'En cours' : 'Réglée'}</span></td>
        <td>${clientNom(v)}</td>
        <td>${v.numero_facture || '-'}</td>
        <td>${formatNumber(v.total)}</td>
        <td>${formatNumber(v.montant_paye)}</td>
        <td>${formatNumber(v.restant_a_payer)}</td>
        <td>${formatDate(v.date || v.created_at)}</td>
        <td class="dettes-actions">
          <a href="#" class="link-pdf btn-link-sm" data-facture-vente="${v.id}">Facture</a>
          ${Number(v.restant_a_payer) > 0 ? `<button class="btn btn-sm btn-primary" data-regler-client="${v.id}">Régler</button>` : ''}
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-regler-client]').forEach(b => b.addEventListener('click', () => openReglementClient(b.dataset.reglerClient)));
    tbody.querySelectorAll('[data-facture-vente]').forEach(a => { a.addEventListener('click', (e) => { e.preventDefault(); telechargerFacture(a.dataset.factureVente); }); });
  }

  async function loadDettesClients() {
    const tbody = document.getElementById('dettes-clients-list');
    if (!tbody) return;
    const cached = getCache('dettes_clients');
    if (cached?.data) renderDettesClients(cached.data, cached.clientsMap || {});
    const { data: ventesData, error } = await supabase.from('ventes').select('*');
    if (error) { if (!cached?.data) tbody.innerHTML = '<tr><td colspan="8">Impossible de charger les dettes. Réessayez.</td></tr>'; return; }
    let data = (ventesData || []).filter(v => v.restant_a_payer != null);
    data.sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
    const clientIds = [...new Set(data.map(v => v.client_id).filter(Boolean))];
    const clientsMap = {};
    if (clientIds.length) {
      const { data: clients } = await supabase.from('clients').select('id, nom').in('id', clientIds);
      (clients || []).forEach(c => { clientsMap[c.id] = c.nom; });
    }
    renderDettesClients(data, clientsMap);
    setCache('dettes_clients', { data, clientsMap });
  }

  function renderDettesFournisseurs(data, produitsMap, fournisseursMap) {
    const tbody = document.getElementById('dettes-fournisseurs-list');
    if (!tbody) return;
    let rows = data.filter(m => (Number(m.restant_a_payer) || 0) > 0 || detteFilterFournisseurs !== 'en-cours');
    if (detteFilterFournisseurs === 'reglees') rows = data.filter(m => (Number(m.restant_a_payer) || 0) <= 0);
    if (detteFilterFournisseurs === 'toutes') rows = data;
    const fournNom = (m) => fournisseursMap[m.fournisseur_id] || m.provenance || '-';
    const prodNom = (m) => produitsMap[m.produit_id] || '-';
    tbody.innerHTML = rows.map(m => `
      <tr>
        <td><span class="badge badge-${(Number(m.restant_a_payer) || 0) > 0 ? 'warning' : 'success'}">${(Number(m.restant_a_payer) || 0) > 0 ? 'En cours' : 'Réglée'}</span></td>
        <td>${fournNom(m)}</td>
        <td>${prodNom(m)}</td>
        <td>${formatNumber(m.montant_total)}</td>
        <td>${formatNumber(m.montant_paye)}</td>
        <td>${formatNumber(m.restant_a_payer)}</td>
        <td>${formatDate(m.date)}</td>
        <td class="dettes-actions">
          <a href="#" class="link-pdf btn-link-sm" data-bon-mouvement="${m.id}">Bon</a>
          ${(Number(m.restant_a_payer) || 0) > 0 ? `<button class="btn btn-sm btn-primary" data-regler-fournisseur="${m.id}">Régler</button>` : ''}
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-regler-fournisseur]').forEach(b => b.addEventListener('click', () => openReglementFournisseur(b.dataset.reglerFournisseur)));
    tbody.querySelectorAll('[data-bon-mouvement]').forEach(a => { a.addEventListener('click', (e) => { e.preventDefault(); telechargerBonReception(a.dataset.bonMouvement); }); });
  }

  async function loadDettesFournisseurs() {
    const tbody = document.getElementById('dettes-fournisseurs-list');
    if (!tbody) return;
    const cached = getCache('dettes_fournisseurs');
    if (cached?.data) renderDettesFournisseurs(cached.data, cached.produitsMap || {}, cached.fournisseursMap || {});
    const { data: movData, error } = await supabase.from('mouvements').select('*').eq('type', 'entree').order('date', { ascending: false });
    if (error) { if (!cached?.data) tbody.innerHTML = '<tr><td colspan="8">Table mouvements absente. Exécutez schema_supabase.sql.</td></tr>'; return; }
    const data = movData || [];
    const prodIds = [...new Set(data.map(m => m.produit_id).filter(Boolean))];
    const fournIds = [...new Set(data.map(m => m.fournisseur_id).filter(Boolean))];
    const produitsMap = {}; const fournisseursMap = {};
    if (prodIds.length) { const { data: p } = await supabase.from('produits').select('id, nom').in('id', prodIds); (p || []).forEach(x => { produitsMap[x.id] = x.nom; }); }
    if (fournIds.length) { const { data: f } = await supabase.from('fournisseurs').select('id, nom').in('id', fournIds); (f || []).forEach(x => { fournisseursMap[x.id] = x.nom; }); }
    renderDettesFournisseurs(data, produitsMap, fournisseursMap);
    setCache('dettes_fournisseurs', { data, produitsMap, fournisseursMap });
  }

  async function loadHistoriqueReglements() {
    const tbody = document.getElementById('historique-reglements-list');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Chargement...</td></tr>';
    try {
      const [resClients, resFournisseurs] = await Promise.all([
        supabase.from('reglements_clients').select('vente_id, montant, date').order('date', { ascending: false }),
        supabase.from('reglements_fournisseurs').select('mouvement_id, montant, date').order('date', { ascending: false })
      ]);
      if (resClients.error || resFournisseurs.error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Tables reglements non trouvées. Exécutez create_reglements.sql.</td></tr>';
        return;
      }
      const regClients = resClients.data || [];
      const regFourn = resFournisseurs.data || [];
      const rows = [];
      if (regClients.length) {
        const venteIds = [...new Set(regClients.map(r => r.vente_id))];
        const { data: ventes } = await supabase.from('ventes').select('id, numero_facture, client_id').in('id', venteIds);
        const ventesMap = {};
        (ventes || []).forEach(v => { ventesMap[v.id] = v; });
        const clientIds = [...new Set((ventes || []).map(v => v.client_id).filter(Boolean))];
        const clientsMap = {};
        if (clientIds.length) {
          const { data: clients } = await supabase.from('clients').select('id, nom').in('id', clientIds);
          (clients || []).forEach(c => { clientsMap[c.id] = c.nom; });
        }
        regClients.forEach(r => {
          const v = ventesMap[r.vente_id];
          const ref = v ? (v.numero_facture || `Vente #${r.vente_id}`) : `Vente #${r.vente_id}`;
          const clientNom = v && clientsMap[v.client_id] ? clientsMap[v.client_id] : '';
          rows.push({
            date: r.date,
            type: 'Client',
            reference: clientNom ? `${ref} (${clientNom})` : ref,
            montant: r.montant,
            venteId: r.vente_id,
            mouvementId: null
          });
        });
      }
      if (regFourn.length) {
        const movIds = [...new Set(regFourn.map(r => r.mouvement_id))];
        const { data: mouvements } = await supabase.from('mouvements').select('id, fournisseur_id, produit_id, provenance').in('id', movIds);
        const movMap = {};
        (mouvements || []).forEach(m => { movMap[m.id] = m; });
        const fournIds = [...new Set((mouvements || []).map(m => m.fournisseur_id).filter(Boolean))];
        const prodIds = [...new Set((mouvements || []).map(m => m.produit_id).filter(Boolean))];
        const fournisseursMap = {}; const produitsMap = {};
        if (fournIds.length) {
          const { data: f } = await supabase.from('fournisseurs').select('id, nom').in('id', fournIds);
          (f || []).forEach(x => { fournisseursMap[x.id] = x.nom; });
        }
        if (prodIds.length) {
          const { data: p } = await supabase.from('produits').select('id, nom').in('id', prodIds);
          (p || []).forEach(x => { produitsMap[x.id] = x.nom; });
        }
        regFourn.forEach(r => {
          const m = movMap[r.mouvement_id];
          const fournNom = m && fournisseursMap[m.fournisseur_id] ? fournisseursMap[m.fournisseur_id] : (m?.provenance || '-');
          const prodNom = m && produitsMap[m.produit_id] ? produitsMap[m.produit_id] : '-';
          const ref = `Bon #${r.mouvement_id} - ${fournNom}${prodNom ? ' / ' + prodNom : ''}`;
          rows.push({
            date: r.date,
            type: 'Fournisseur',
            reference: ref,
            montant: r.montant,
            venteId: null,
            mouvementId: r.mouvement_id
          });
        });
      }
      rows.sort((a, b) => new Date(b.date) - new Date(a.date));
      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Aucun règlement enregistré.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(row => `
        <tr>
          <td>${formatDate(row.date)}</td>
          <td>${row.type}</td>
          <td>${row.reference}</td>
          <td>${formatNumber(row.montant)}</td>
          <td>
            ${row.venteId ? `<a href="#" class="link-pdf btn-link-sm" data-histo-facture="${row.venteId}">Facture</a>` : ''}
            ${row.mouvementId ? `<a href="#" class="link-pdf btn-link-sm" data-histo-bon="${row.mouvementId}">Bon</a>` : ''}
          </td>
        </tr>
      `).join('');
      tbody.querySelectorAll('[data-histo-facture]').forEach(a => {
        a.addEventListener('click', (e) => { e.preventDefault(); telechargerFacture(a.dataset.histoFacture); });
      });
      tbody.querySelectorAll('[data-histo-bon]').forEach(a => {
        a.addEventListener('click', (e) => { e.preventDefault(); telechargerBonReception(a.dataset.histoBon); });
      });
    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Impossible de charger l\'historique. Vérifiez que les tables reglements_clients et reglements_fournisseurs existent.</td></tr>';
    }
  }

  document.querySelectorAll('.filter-btn-small[data-dette-filter="clients"]').forEach(btn => {
    btn.addEventListener('click', () => {
      detteFilterClients = btn.dataset.value;
      document.querySelectorAll('.filter-btn-small[data-dette-filter="clients"]').forEach(b => b.classList.toggle('active', b.dataset.value === detteFilterClients));
      loadDettesClients();
    });
  });
  document.querySelectorAll('.filter-btn-small[data-dette-filter="fournisseurs"]').forEach(btn => {
    btn.addEventListener('click', () => {
      detteFilterFournisseurs = btn.dataset.value;
      document.querySelectorAll('.filter-btn-small[data-dette-filter="fournisseurs"]').forEach(b => b.classList.toggle('active', b.dataset.value === detteFilterFournisseurs));
      loadDettesFournisseurs();
    });
  });

  function openReglementClient(venteId) {
    document.getElementById('reglement-vente-id').value = venteId;
    openModal('modal-reglement-client');
  }

  async function openHistoriqueClient(venteId) {
    document.getElementById('modal-historique-title').textContent = 'Historique des règlements (dette client)';
    const content = document.getElementById('modal-historique-content');
    content.innerHTML = '<p class="text-muted">Chargement...</p>';
    openModal('modal-historique-reglements');
    const { data: v } = await supabase.from('ventes').select('numero_facture, total, montant_paye, restant_a_payer').eq('id', venteId).single();
    const { data: reglements } = await supabase.from('reglements_clients').select('montant, date').eq('vente_id', venteId).order('date', { ascending: false });
    let html = '';
    if (v) {
      html += `<p><strong>Facture :</strong> ${v.numero_facture || '-'} | <strong>Total :</strong> ${formatNumber(v.total)} FCFA</p>`;
      html += `<p><strong>Payé :</strong> ${formatNumber(v.montant_paye)} FCFA | <strong>Reste :</strong> ${formatNumber(v.restant_a_payer)} FCFA</p>`;
    }
    if (reglements && reglements.length) {
      html += '<table class="data-table" style="margin-top: 1rem;"><thead><tr><th>Date</th><th>Montant</th></tr></thead><tbody>';
      reglements.forEach(r => { html += `<tr><td>${formatDate(r.date)}</td><td>${formatNumber(r.montant)} FCFA</td></tr>`; });
      html += '</tbody></table>';
    } else {
      html += '<p class="text-muted" style="margin-top: 0.5rem;">Aucun détail de règlement enregistré. Les paiements futurs apparaîtront ici.</p>';
    }
    content.innerHTML = html;
  }

  async function openHistoriqueFournisseur(mouvementId) {
    document.getElementById('modal-historique-title').textContent = 'Historique des règlements (dette fournisseur)';
    const content = document.getElementById('modal-historique-content');
    content.innerHTML = '<p class="text-muted">Chargement...</p>';
    openModal('modal-historique-reglements');
    const { data: m } = await supabase.from('mouvements').select('montant_total, montant_paye, restant_a_payer, provenance').eq('id', mouvementId).single();
    const { data: reglements } = await supabase.from('reglements_fournisseurs').select('montant, date').eq('mouvement_id', mouvementId).order('date', { ascending: false });
    let html = '';
    if (m) {
      html += `<p><strong>Total :</strong> ${formatNumber(m.montant_total)} FCFA | <strong>Payé :</strong> ${formatNumber(m.montant_paye)} FCFA | <strong>Reste :</strong> ${formatNumber(m.restant_a_payer)} FCFA</p>`;
    }
    if (reglements && reglements.length) {
      html += '<table class="data-table" style="margin-top: 1rem;"><thead><tr><th>Date</th><th>Montant</th></tr></thead><tbody>';
      reglements.forEach(r => { html += `<tr><td>${formatDate(r.date)}</td><td>${formatNumber(r.montant)} FCFA</td></tr>`; });
      html += '</tbody></table>';
    } else {
      html += '<p class="text-muted" style="margin-top: 0.5rem;">Aucun détail de règlement enregistré. Les paiements futurs apparaîtront ici.</p>';
    }
    content.innerHTML = html;
  }

  document.getElementById('form-reglement-client')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const venteId = document.getElementById('reglement-vente-id').value;
    const montant = Number(document.getElementById('reglement-client-montant').value) || 0;
    if (montant <= 0) { showToast('Veuillez entrer un montant à régler.', 'error'); return; }
    if (btn) { btn.disabled = true; btn.textContent = 'En cours...'; }
    try {
      const { data: v } = await supabase.from('ventes').select('montant_paye, restant_a_payer').eq('id', venteId).single();
      if (!v) { showToast('Vente introuvable', 'error'); return; }
      const newPaye = (Number(v.montant_paye) || 0) + montant;
      const restant = Math.max(0, (Number(v.restant_a_payer) || 0) - montant);
      const [updRes, insRes] = await Promise.all([
        supabase.from('ventes').update({ montant_paye: newPaye, restant_a_payer: restant }).eq('id', venteId),
        supabase.from('reglements_clients').insert({ vente_id: venteId, montant })
      ]);
      if (updRes.error || insRes.error) { showToast('Erreur lors de l\'enregistrement. Réessayez.', 'error'); return; }
      showToast('Paiement enregistré');
      closeModal('modal-reglement-client');
      loadDettesClients();
      loadHistoriqueReglements();
      loadDashboard();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Enregistrer le paiement'; }
    }
  });

  function openReglementFournisseur(mouvementId) {
    document.getElementById('reglement-mouvement-id').value = mouvementId;
    openModal('modal-reglement-fournisseur');
  }

  document.getElementById('form-reglement-fournisseur')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const movId = document.getElementById('reglement-mouvement-id').value;
    const montant = Number(document.getElementById('reglement-fournisseur-montant').value) || 0;
    if (montant <= 0) { showToast('Veuillez entrer un montant à régler.', 'error'); return; }
    if (btn) { btn.disabled = true; btn.textContent = 'En cours...'; }
    try {
      const { data: m } = await supabase.from('mouvements').select('montant_paye, restant_a_payer').eq('id', movId).single();
      if (!m) { showToast('Mouvement introuvable', 'error'); return; }
      const newPaye = (Number(m.montant_paye) || 0) + montant;
      const restant = Math.max(0, (Number(m.restant_a_payer) || 0) - montant);
      const [updRes, insRes] = await Promise.all([
        supabase.from('mouvements').update({ montant_paye: newPaye, restant_a_payer: restant }).eq('id', movId),
        supabase.from('reglements_fournisseurs').insert({ mouvement_id: movId, montant })
      ]);
      if (updRes.error || insRes.error) { showToast('Erreur lors de l\'enregistrement. Réessayez.', 'error'); return; }
      showToast('Paiement enregistré');
      closeModal('modal-reglement-fournisseur');
      loadDettesFournisseurs();
      loadHistoriqueReglements();
      loadDashboard();
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Enregistrer le paiement'; }
    }
  });

  // --- Ventes ---
  let panier = [];

  function loadProduitsSelect() {
    supabase.from('produits').select('id, nom, reference, prix_vente, quantite').gt('quantite', 0).order('nom').then(({ data }) => {
      const sel = document.getElementById('vente-produit');
      if (!sel) return;
      sel.innerHTML = '<option value="">-- Sélectionner un produit --</option>' + (data || []).map(p =>
        `<option value="${p.id}" data-prix="${p.prix_vente}" data-qte="${p.quantite}">${p.nom || p.reference} - ${formatNumber(p.prix_vente)} FCFA (stock: ${p.quantite})</option>`
      ).join('');
    });
  }

  function loadClientsSelect() {
    supabase.from('clients').select('id, nom').order('nom').then(({ data }) => {
      const sel = document.getElementById('vente-client');
      if (!sel) return;
      const first = '<option value="">Vente anonyme (sans client)</option>';
      sel.innerHTML = first + (data || []).map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
    });
  }

  function loadFournisseursSelect() {
    supabase.from('fournisseurs').select('id, nom').order('nom').then(({ data }) => {
      const sel = document.getElementById('mouvement-fournisseur-select');
      if (!sel) return;
      const opts = sel.querySelectorAll('option');
      const first = opts[0] ? opts[0].outerHTML : '<option value="">-- Ou sélectionner un fournisseur --</option>';
      sel.innerHTML = first + (data || []).map(f => `<option value="${f.id}">${f.nom}</option>`).join('');
    });
  }

  function renderPanier() {
    const tbody = document.getElementById('panier-items');
    const totalEl = document.getElementById('panier-total');
    if (!tbody) return;
    const reductionTotale = Number(document.getElementById('vente-reduction-totale').value) || 0;
    let sousTotal = panier.reduce((s, l) => s + (Number(l.sous_total) || 0), 0);
    const total = Math.max(0, sousTotal - reductionTotale);
    tbody.innerHTML = panier.map((l, i) => `
      <tr>
        <td>${l.nom || 'Produit'}</td>
        <td>${l.quantite}</td>
        <td>${formatNumber(l.prix_unitaire)}</td>
        <td>${formatNumber(l.reduction_unitaire)}</td>
        <td>${formatNumber(l.sous_total)}</td>
        <td><button type="button" class="btn btn-sm btn-danger" data-remove="${i}">×</button></td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => { panier.splice(Number(b.dataset.remove), 1); renderPanier(); }));
    if (totalEl) totalEl.textContent = formatNumber(total);
    document.getElementById('btn-valider-vente').disabled = panier.length === 0;
    updateVenteResteInfo();
  }

  function updateVenteResteInfo() {
    const aCredit = document.getElementById('vente-a-credit').checked;
    const group = document.getElementById('vente-montant-paye-group');
    const info = document.getElementById('vente-reste-info');
    const totalEl = document.getElementById('panier-total');
    const total = parseFloat((totalEl && totalEl.textContent) ? totalEl.textContent.replace(/\s/g, '') : 0) || 0;
    if (group) group.classList.toggle('hidden', !aCredit);
    const montantPaye = Number(document.getElementById('vente-montant-paye').value) || 0;
    const reste = Math.max(0, total - montantPaye);
    if (info) info.textContent = aCredit ? `Reste à payer: ${formatNumber(reste)} FCFA → Dette client` : 'Paiement complet (total réglé)';
  }

  document.getElementById('btn-add-produit-vente')?.addEventListener('click', () => {
    const sel = document.getElementById('vente-produit');
    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value) { showToast('Veuillez sélectionner un produit.', 'error'); return; }
    const qte = Number(document.getElementById('vente-quantite').value) || 1;
    const prix = Number(opt.dataset.prix) || 0;
    const stock = Number(opt.dataset.qte) || 0;
    if (qte > stock) { showToast('Stock insuffisant pour cette quantité.', 'error'); return; }
    const reducUnit = 0;
    const sousTotal = (prix - reducUnit) * qte;
    panier.push({
      produit_id: opt.value,
      nom: opt.text.split(' - ')[0],
      quantite: qte,
      prix_unitaire: prix,
      reduction_unitaire: reducUnit,
      sous_total: sousTotal
    });
    renderPanier();
  });

  document.getElementById('vente-a-credit')?.addEventListener('change', updateVenteResteInfo);
  document.getElementById('vente-montant-paye')?.addEventListener('input', updateVenteResteInfo);
  document.getElementById('vente-reduction-totale')?.addEventListener('input', renderPanier);

  document.getElementById('btn-new-client-vente')?.addEventListener('click', () => {
    document.getElementById('vente-client-fields').classList.toggle('hidden');
  });

  document.getElementById('btn-valider-vente')?.addEventListener('click', async () => {
    if (panier.length === 0) return;
    const clientId = document.getElementById('vente-client').value;
    const clientFields = document.getElementById('vente-client-fields');
    const useNewClient = clientFields && !clientFields.classList.contains('hidden');
    let finalClientId = clientId || null;
    if (useNewClient) {
      const nom = document.getElementById('vente-nom').value.trim();
      if (!nom) { showToast('Le nom du client est obligatoire.', 'error'); return; }
      const { data: newC } = await supabase.from('clients').insert({
        nom,
        telephone: document.getElementById('vente-telephone').value.trim() || null,
        email: document.getElementById('vente-email').value.trim() || null,
        adresse: document.getElementById('vente-adresse').value.trim() || null
      }).select('id').single();
      if (!newC) { showToast('Erreur lors de la création du client. Réessayez.', 'error'); return; }
      finalClientId = newC.id;
    }
    const reductionTotale = Number(document.getElementById('vente-reduction-totale').value) || 0;
    const aCredit = document.getElementById('vente-a-credit').checked;
    let sousTotal = panier.reduce((s, l) => s + (Number(l.sous_total) || 0), 0);
    const total = Math.max(0, sousTotal - reductionTotale);
    const montantPaye = aCredit ? (Number(document.getElementById('vente-montant-paye').value) || 0) : total;
    const restant = Math.max(0, total - montantPaye);
    const numeroFacture = 'FAC-' + Date.now();
    const payloadVente = {
      client_id: finalClientId,
      numero_facture: numeroFacture,
      total: total,
      reduction_totale: reductionTotale,
      montant_paye: montantPaye,
      restant_a_payer: restant > 0 ? restant : null
    };
    const { data: vente, error: errV } = await supabase.from('ventes').insert(payloadVente).select('*').single();
    if (errV || !vente) { showToast('Erreur lors de l\'enregistrement de la vente. Réessayez.', 'error'); return; }
    const venteId = vente.id ?? vente.vente_id;
    for (const l of panier) {
      await supabase.from('ventes_lignes').insert({
        vente_id: venteId,
        produit_id: l.produit_id,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
        reduction_unitaire: l.reduction_unitaire,
        sous_total: l.sous_total
      });
      const { data: p } = await supabase.from('produits').select('quantite').eq('id', l.produit_id).single();
      const newQte = Math.max(0, (Number(p?.quantite) || 0) - l.quantite);
      await supabase.from('produits').update({ quantite: newQte }).eq('id', l.produit_id);
      await supabase.from('mouvements').insert({
        produit_id: l.produit_id,
        type: 'sortie',
        quantite: -l.quantite,
        motif: 'Vente ' + numeroFacture
      });
    }
    panier = [];
    renderPanier();
    showToast('Vente enregistrée');
    loadProduits();
    loadProduitsSelect();
    loadDashboard();
    loadVentes();
    if (restant > 0) loadDettesClients();
    if (venteId) telechargerFacture(venteId);
  });

  function renderVentes(sorted, clientsMap) {
    const tbody = document.getElementById('ventes-list');
    if (!tbody) return;
    const clientNom = (v) => clientsMap[v.client_id] || 'Anonyme';
    tbody.innerHTML = (sorted || []).map(v => `
      <tr>
        <td>${v.numero_facture || '-'}</td>
        <td>${clientNom(v)}</td>
        <td>${formatNumber(v.total)}</td>
        <td>${formatDate(v.date || v.created_at)}</td>
        <td><button class="btn btn-sm btn-outline" data-facture="${v.id}">Télécharger</button></td>
      </tr>
    `).join('');
    tbody.querySelectorAll('[data-facture]').forEach(b => b.addEventListener('click', () => telechargerFacture(b.dataset.facture)));
  }

  async function loadVentes() {
    const tbody = document.getElementById('ventes-list');
    if (!tbody) return;
    const cached = getCache('ventes');
    if (cached?.sorted) renderVentes(cached.sorted, cached.clientsMap || {});
    const { data: ventesData, error } = await supabase.from('ventes').select('*');
    if (error) { if (!cached?.sorted) tbody.innerHTML = '<tr><td colspan="5">Impossible de charger les ventes. Réessayez.</td></tr>'; return; }
    const sorted = (ventesData || []).slice().sort((a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0));
    const clientIds = [...new Set(sorted.map(v => v.client_id).filter(Boolean))];
    const clientsMap = {};
    if (clientIds.length) {
      const { data: clients } = await supabase.from('clients').select('id, nom').in('id', clientIds);
      (clients || []).forEach(c => { clientsMap[c.id] = c.nom; });
    }
    renderVentes(sorted, clientsMap);
    setCache('ventes', { sorted, clientsMap });
  }

  // --- PDF ---
  function loadSignatureForPDF(callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      callback(canvas.toDataURL('image/png'));
    };
    img.onerror = () => callback(null);
    img.src = 'images/signature-1771027383272.png';
  }

  function loadLogoForPDF(callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      callback(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => callback(null);
    img.src = 'images/logo.jpeg';
  }

  function addPDFHeader(doc, logoData) {
    const pageW = doc.internal.pageSize.getWidth();
    if (logoData) doc.addImage(logoData, 'JPEG', 20, 15, 30, 20);
    doc.setFontSize(18);
    doc.text('Kouma Fashion', 55, 22);
    doc.setFontSize(10);
    doc.text('Quinzambougou - Immeuble', 55, 28);
    doc.text('Tél: 75 20 18 48', 55, 34);
  }

  function addPDFFooterWithStamp(doc, signatureData) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.height;
    const footerY = pageH - 50;
    doc.setDrawColor(201, 162, 39);
    doc.line(20, footerY, pageW - 20, footerY);
    if (signatureData) {
      doc.addImage(signatureData, 'PNG', 20, footerY - 12, 50, 12);
      doc.setDrawColor(80, 80, 80);
      doc.line(20, footerY + 2, 75, footerY + 2);
      doc.setFontSize(7);
      doc.text('Cachet et signature', 20, footerY + 10);
    }
    doc.setFontSize(9);
    doc.text('Merci pour votre confiance !', pageW - 20, footerY + 8, { align: 'right' });
    doc.text('Kouma Fashion • Tél: 75 20 18 48', pageW - 20, footerY + 14, { align: 'right' });
  }

  function showPDFInModal(blob, title) {
    const url = URL.createObjectURL(blob);
    document.getElementById('modal-pdf-title').textContent = title || 'Aperçu';
    document.getElementById('pdf-iframe').src = url;
    document.getElementById('btn-pdf-download').onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = (title || 'document') + '.pdf';
      a.click();
    };
    openModal('modal-pdf-viewer');
  }

  async function genererFacturePDF(venteId) {
    const { data: vente, error: ev } = await supabase.from('ventes').select('*').eq('id', venteId).single();
    if (ev || !vente) return;
    let client = {};
    if (vente.client_id) {
      const { data: c } = await supabase.from('clients').select('nom, telephone').eq('id', vente.client_id).single();
      if (c) client = c;
    }
    const { data: lignes } = await supabase.from('ventes_lignes').select('*').eq('vente_id', venteId);
    const prodIds = [...new Set((lignes || []).map(l => l.produit_id).filter(Boolean))];
    const produitsMap = {};
    if (prodIds.length) {
      const { data: prods } = await supabase.from('produits').select('id, nom, reference').in('id', prodIds);
      (prods || []).forEach(p => { produitsMap[p.id] = p; });
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    loadLogoForPDF((logoData) => {
      addPDFHeader(doc, logoData);
      doc.setFontSize(16);
      doc.text('FACTURE ' + (vente.numero_facture || venteId), pageW / 2, 50, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Date: ' + formatDate(vente.date), 20, 60);
      doc.text('Client: ' + (client.nom || 'Anonyme'), 20, 68);
      doc.text('Tél: ' + (client.telephone || '-'), 20, 74);
      let y = 90;
      doc.setFontSize(9);
      doc.text('Désignation', 20, y);
      doc.text('Qté', 100, y);
      doc.text('P.U.', 120, y);
      doc.text('Réduct.', 150, y);
      doc.text('Sous-total', 170, y);
      y += 8;
      (lignes || []).forEach(l => {
        const p = produitsMap[l.produit_id];
        const nom = p ? (p.nom || p.reference || 'Produit') : 'Produit';
        doc.text(nom, 20, y);
        doc.text(String(l.quantite), 100, y);
        doc.text(formatNumber(l.prix_unitaire), 120, y);
        doc.text(formatNumber(l.reduction_unitaire || 0), 150, y);
        doc.text(formatNumber(l.sous_total), 170, y);
        y += 6;
      });
      y += 5;
      if (vente.reduction_totale) doc.text('Réduction totale: -' + formatNumber(vente.reduction_totale) + ' FCFA', 20, y), y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL: ' + formatNumber(vente.total) + ' FCFA', 20, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Montant payé: ' + formatNumber(vente.montant_paye || 0) + ' FCFA', 20, y);
      if (vente.restant_a_payer) doc.text('Reste à payer (dette): ' + formatNumber(vente.restant_a_payer) + ' FCFA', 20, y + 6);
      loadSignatureForPDF((sigData) => {
        addPDFFooterWithStamp(doc, sigData);
        const blob = doc.output('blob');
        showPDFInModal(blob, 'Facture-' + (vente.numero_facture || venteId));
      });
    });
  }

  function telechargerFacture(venteId) {
    genererFacturePDF(venteId);
  }

  async function telechargerBonReception(mouvementId) {
    const { data: m, error } = await supabase.from('mouvements').select('*').eq('id', mouvementId).single();
    if (error || !m) return;
    let prodNom = 'Produit', fournNom = m.provenance || '-';
    if (m.produit_id) { const { data: p } = await supabase.from('produits').select('nom, reference').eq('id', m.produit_id).single(); if (p) prodNom = p.nom || p.reference || 'Produit'; }
    if (m.fournisseur_id) { const { data: f } = await supabase.from('fournisseurs').select('nom').eq('id', m.fournisseur_id).single(); if (f) fournNom = f.nom; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    loadLogoForPDF((logoData) => {
      addPDFHeader(doc, logoData);
      doc.setFontSize(16);
      doc.text('BON DE RÉCEPTION', pageW / 2, 50, { align: 'center' });
      doc.setFontSize(10);
      doc.text('Date: ' + formatDate(m.date), 20, 60);
      doc.text('Fournisseur: ' + fournNom, 20, 68);
      doc.text('Produit: ' + prodNom, 20, 76);
      doc.text('Quantité: ' + m.quantite, 20, 84);
      doc.text('Motif: ' + (m.motif || '-'), 20, 92);
      loadSignatureForPDF((sigData) => {
        addPDFFooterWithStamp(doc, sigData);
        const blob = doc.output('blob');
        showPDFInModal(blob, 'BonReception-' + mouvementId);
      });
    });
  }

  // --- Init (dashboard immédiat, autres onglets à la demande) ---
  function initApp() {
    tabLoaded.dashboard = true;
    loadDashboard();
  }

  initAuth();
})();
