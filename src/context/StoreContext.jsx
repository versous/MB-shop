import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cleanPhoneNumber } from '../lib/whatsapp';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SETTINGS } from './initialData';

const StoreContext = createContext();
const PAGE_SIZE = 1000;

const fetchAllRows = async (table, orderColumn) => {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderColumn, { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return rows;
    from += PAGE_SIZE;
  }
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [dataMode, setDataMode] = useState(isSupabaseConfigured() ? 'loading' : 'local');
  const [loadError, setLoadError] = useState('');
  const [realtimeError, setRealtimeError] = useState('');
  const [analyticsRevision, setAnalyticsRevision] = useState(0);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Helper pour initialiser ou récupérer le stockage local
  const getStoredData = (key, fallback) => {
    try {
      const item = localStorage.getItem(`mb_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch (err) {
      throw new Error(`Les données locales « ${key} » sont illisibles : ${err.message}`);
    }
  };

  const saveStoredData = (key, data) => {
    try {
      localStorage.setItem(`mb_${key}`, JSON.stringify(data));
    } catch (e) {
      showNotification(`Impossible d'enregistrer les données locales : ${e.message}`, 'error');
      throw e;
    }
  };

  const requireWritableStore = () => {
    if (dataMode === 'loading' || dataMode === 'error' || (isSupabaseConfigured() && dataMode !== 'supabase')) {
      const error = new Error('Les données ne sont pas synchronisées. Actualisez avant de modifier.');
      showNotification(error.message, 'error');
      throw error;
    }
  };

  // 1. CHARGEMENT DES DONNÉES
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    if (isSupabaseConfigured() && supabase) {
      try {
        const [prods, setsResult, ords] = await Promise.all([
          fetchAllRows('products', 'created_at'),
          supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
          fetchAllRows('orders', 'order_date')
        ]);
        if (setsResult.error) throw setsResult.error;
        if (!setsResult.data) throw new Error('Les paramètres de la boutique sont absents de Supabase.');

        setProducts(prods);
        setSettings((current) => (
          JSON.stringify(current) === JSON.stringify(setsResult.data) ? current : setsResult.data
        ));
        setOrders(ords);
        setDataMode('supabase');
      } catch (err) {
        console.error('Erreur de chargement Supabase :', err);
        setProducts([]);
        setOrders([]);
        setSettings({});
        setDataMode('error');
        setLoadError(err.message || 'Impossible de charger les données Supabase.');
      }
    } else {
      try {
        fallbackToLocal();
        setDataMode('local');
      } catch (err) {
        console.error('Erreur de chargement des données locales :', err);
        setProducts([]);
        setOrders([]);
        setSettings({});
        setDataMode('error');
        setLoadError(err.message || 'Impossible de charger les données locales.');
      }
    }

    setLoading(false);
  }, []);

  const fallbackToLocal = () => {
    const localProds = getStoredData('products', INITIAL_PRODUCTS);
    const localOrders = getStoredData('orders', INITIAL_ORDERS);
    const localSets = getStoredData('settings', INITIAL_SETTINGS);
    if (!Array.isArray(localProds) || !Array.isArray(localOrders) ||
      !localSets || typeof localSets !== 'object' || Array.isArray(localSets)) {
      throw new Error('Les données locales ont un format invalide. Elles n’ont pas été chargées.');
    }

    setProducts(localProds);
    setOrders(localOrders);
    setSettings(localSets);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      const handleStorageChange = (event) => {
        if (event.key === 'mb_products') setProducts(getStoredData('products', INITIAL_PRODUCTS));
        if (event.key === 'mb_orders') setOrders(getStoredData('orders', INITIAL_ORDERS));
        if (event.key === 'mb_settings') setSettings(getStoredData('settings', INITIAL_SETTINGS));
        if (event.key === 'mb_analytics_events') setAnalyticsRevision((revision) => revision + 1);
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }

    const channel = supabase
      .channel('admin-store-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, fetchData)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'analytics_events',
        filter: 'event_type=eq.whatsapp_click'
      }, () => setAnalyticsRevision((revision) => revision + 1))
      .subscribe((status) => {
        setRealtimeError(
          status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'
            ? 'La synchronisation en temps réel est indisponible. Actualisez les données.'
            : ''
        );
      });

    const handleFocus = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // 2. GESTION DES PRODUITS (CRUD)
  const addProduct = async (productData) => {
    requireWritableStore();
    const newProduct = {
      ...productData,
      id: crypto.randomUUID(),
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: productData.is_active ?? true,
      stock_status: productData.stock_status || 'in_stock'
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      setProducts((prev) => [data, ...prev]);
    } else {
      const updated = [newProduct, ...products];
      saveStoredData('products', updated);
      setProducts(updated);
    }

    showNotification('Produit ajouté avec succès !', 'success');
    return newProduct;
  };

  const updateProduct = async (id, updatedFields, expectedUpdatedAt) => {
    requireWritableStore();
    const currentProduct = products.find((product) => product.id === id);
    if (!currentProduct) {
      const error = new Error('Ce produit ne figure plus dans les données synchronisées. Actualisez la page.');
      showNotification(error.message, 'error');
      throw error;
    }
    const payload = {
      ...updatedFields,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      let query = supabase
        .from('products')
        .update(payload)
        .eq('id', id);
      const revision = expectedUpdatedAt || currentProduct.updated_at;
      if (revision) query = query.eq('updated_at', revision);
      const { data, error } = await query.select().maybeSingle();

      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      if (!data) {
        const conflict = new Error('Ce produit a été modifié ailleurs. Actualisez puis recommencez.');
        showNotification(conflict.message, 'error');
        throw conflict;
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
    } else {
      const updated = products.map((p) => (p.id === id ? { ...p, ...payload } : p));
      saveStoredData('products', updated);
      setProducts(updated);
    }

    showNotification('Produit mis à jour avec succès.', 'success');
  };

  const deleteProduct = async (id, expectedUpdatedAt) => {
    requireWritableStore();
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('products').delete().eq('id', id);
      const revision = expectedUpdatedAt || products.find((product) => product.id === id)?.updated_at;
      if (revision) query = query.eq('updated_at', revision);
      const { data, error } = await query.select('id').maybeSingle();
      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      if (!data) {
        const conflict = new Error('Ce produit a été modifié ou supprimé ailleurs. Actualisez puis recommencez.');
        showNotification(conflict.message, 'error');
        throw conflict;
      }
    }
    const updated = products.filter((p) => p.id !== id);
    if (!isSupabaseConfigured()) saveStoredData('products', updated);
    setProducts(updated);
    showNotification('Produit supprimé.', 'success');
  };

  const toggleProductActive = async (id) => {
    const product = products.find((item) => item.id === id);
    if (!product) {
      const error = new Error('Ce produit ne figure plus dans les données synchronisées. Actualisez la page.');
      showNotification(error.message, 'error');
      throw error;
    }
    await updateProduct(id, { is_active: !product.is_active }, product.updated_at);
  };

  // 3. GESTION DES COMMANDES (CRUD)
  const addOrder = async (orderData) => {
    requireWritableStore();
    const quantity = Number(orderData.quantity);
    const unitPrice = Number(orderData.unit_price);
    const deliveryFee = Number(orderData.delivery_fee);
    if (!orderData.customer_name?.trim() || !cleanPhoneNumber(orderData.customer_phone) ||
      !orderData.product_name?.trim() || !orderData.color?.trim() || !orderData.size?.trim() ||
      !orderData.location?.trim() || !Number.isInteger(quantity) || quantity < 1 ||
      !Number.isFinite(unitPrice) || unitPrice < 0 ||
      !Number.isFinite(deliveryFee) || deliveryFee < 0) {
      const error = new Error('Les informations de la commande sont incomplètes ou invalides.');
      showNotification(error.message, 'error');
      throw error;
    }
    if (orderData.product_id) {
      const product = products.find((item) => item.id === orderData.product_id);
      if (!product || !product.is_active || product.stock_status === 'out_of_stock') {
        const error = new Error('Ce produit est indisponible et ne peut pas être commandé.');
        showNotification(error.message, 'error');
        throw error;
      }
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const orderDate = orderData.order_date
      ? new Date(orderData.order_date).toISOString()
      : now;
    const localOrderNumber = `CMD-${now.slice(2, 4)}${now.slice(5, 7)}-${id.slice(0, 8).toUpperCase()}`;
    const newOrder = {
      ...orderData,
      id,
      order_number: localOrderNumber,
      order_date: orderDate,
      created_at: now,
      updated_at: now,
      status: orderData.status || 'En attente',
      delivery_fee: deliveryFee,
      unit_price: unitPrice,
      quantity,
      total_amount: (unitPrice * quantity) + deliveryFee
    };

    if (isSupabaseConfigured() && supabase) {
      const { id: _id, order_number: _orderNumber, total_amount: _totalAmount, ...orderPayload } = newOrder;
      const { data, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      setOrders((prev) => [data, ...prev]);
      showNotification(`Commande ${data.order_number} enregistrée !`, 'success');
      return data;
    } else {
      const updated = [newOrder, ...orders];
      saveStoredData('orders', updated);
      setOrders(updated);
    }

    showNotification(`Commande ${localOrderNumber} enregistrée !`, 'success');
    return newOrder;
  };

  const updateOrder = async (id, updatedFields, {
    notify = true,
    allowDeliveryConfirmation = false,
    expectedUpdatedAt
  } = {}) => {
    requireWritableStore();
    const currentOrder = orders.find((order) => order.id === id);
    if (!currentOrder) {
      const error = new Error('Cette commande ne figure plus dans les données synchronisées. Actualisez la page.');
      showNotification(error.message, 'error');
      throw error;
    }
    if (updatedFields.status === 'Livrée' && currentOrder.status !== 'Livrée' && !allowDeliveryConfirmation) {
      const error = new Error('Confirmez une livraison depuis la rubrique Gestion Livraisons.');
      showNotification(error.message, 'error');
      throw error;
    }
    const nextOrder = { ...currentOrder, ...updatedFields };
    if (!nextOrder.customer_name?.trim() || !cleanPhoneNumber(nextOrder.customer_phone) ||
      !nextOrder.product_name?.trim() || !nextOrder.color?.trim() || !nextOrder.size?.trim() ||
      !nextOrder.location?.trim() || !Number.isInteger(Number(nextOrder.quantity)) ||
      Number(nextOrder.quantity) < 1 || !Number.isFinite(Number(nextOrder.unit_price)) ||
      Number(nextOrder.unit_price) < 0 || !Number.isFinite(Number(nextOrder.delivery_fee)) ||
      Number(nextOrder.delivery_fee) < 0) {
      const error = new Error('Les informations de la commande sont incomplètes ou invalides.');
      showNotification(error.message, 'error');
      throw error;
    }
    const payload = {
      ...updatedFields,
      ...(updatedFields.order_date
        ? { order_date: new Date(updatedFields.order_date).toISOString() }
        : {}),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      let query = supabase
        .from('orders')
        .update(payload)
        .eq('id', id);
      const revision = expectedUpdatedAt || currentOrder.updated_at;
      if (revision) query = query.eq('updated_at', revision);
      const { data, error } = await query.select().maybeSingle();

      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      if (!data) {
        const conflict = new Error('Cette commande a été modifiée ailleurs. Actualisez puis recommencez.');
        showNotification(conflict.message, 'error');
        throw conflict;
      }
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
    } else {
      const updated = orders.map((o) => {
        if (o.id !== id) return o;
        const order = { ...o, ...payload };
        order.total_amount =
          Number(order.unit_price) * Number(order.quantity) + Number(order.delivery_fee || 0);
        return order;
      });
      saveStoredData('orders', updated);
      setOrders(updated);
    }

    if (notify) showNotification('Commande mise à jour.', 'success');
  };

  const deleteOrder = async (id, expectedUpdatedAt) => {
    requireWritableStore();
    if (isSupabaseConfigured() && supabase) {
      let query = supabase.from('orders').delete().eq('id', id);
      const revision = expectedUpdatedAt || orders.find((order) => order.id === id)?.updated_at;
      if (revision) query = query.eq('updated_at', revision);
      const { data, error } = await query.select('id').maybeSingle();
      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      if (!data) {
        const conflict = new Error('Cette commande a été modifiée ou supprimée ailleurs. Actualisez puis recommencez.');
        showNotification(conflict.message, 'error');
        throw conflict;
      }
    }
    const updated = orders.filter((o) => o.id !== id);
    if (!isSupabaseConfigured()) saveStoredData('orders', updated);
    setOrders(updated);
    showNotification('Commande supprimée.', 'success');
  };

  // 4. GESTION DES LIVRAISONS
  const markOrderDelivered = async (id, { deliveryPerson, deliveredAt, notes, expectedUpdatedAt }) => {
    const order = orders.find((item) => item.id === id);
    if (!order || !['Confirmée', 'En préparation', 'En livraison'].includes(order.status)) {
      const error = new Error('Cette commande ne peut pas être marquée comme livrée dans son état actuel.');
      showNotification(error.message, 'error');
      throw error;
    }
    if (!deliveryPerson?.trim()) {
      const error = new Error('Le nom du livreur est obligatoire pour confirmer la livraison.');
      showNotification(error.message, 'error');
      throw error;
    }
    const deliveryTimestamp = new Date(deliveredAt || Date.now());
    if (Number.isNaN(deliveryTimestamp.getTime())) {
      const error = new Error('La date de livraison est invalide.');
      showNotification(error.message, 'error');
      throw error;
    }
    const payload = {
      status: 'Livrée',
      delivery_person: deliveryPerson.trim(),
      delivered_at: deliveryTimestamp.toISOString(),
      notes: notes ?? ''
    };
    await updateOrder(id, payload, {
      notify: false,
      allowDeliveryConfirmation: true,
      expectedUpdatedAt
    });
    showNotification('Commande marquée comme livrée !', 'success');
  };

  // 5. GESTION DES PARAMÈTRES
  const updateSettings = async (newSettings) => {
    requireWritableStore();
    if (newSettings.whatsapp_number && !cleanPhoneNumber(newSettings.whatsapp_number)) {
      const error = new Error('Le numéro WhatsApp doit contenir entre 8 et 15 chiffres au format international.');
      showNotification(error.message, 'error');
      throw error;
    }
    const payload = {
      ...newSettings,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      let query = supabase
        .from('store_settings')
        .update(payload)
        .eq('id', 1);
      if (settings.updated_at) query = query.eq('updated_at', settings.updated_at);
      const { data, error } = await query.select().maybeSingle();

      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
      if (!data) {
        const conflict = new Error('Les paramètres ont été modifiés ailleurs. Actualisez puis recommencez.');
        showNotification(conflict.message, 'error');
        throw conflict;
      }
      setSettings(data);
    } else {
      saveStoredData('settings', payload);
      setSettings(payload);
    }

    showNotification('Paramètres de la boutique enregistrés !', 'success');
  };

  // 6. CALCUL ET EXTRACTION ANALYTIQUE RÉELLE (FILTRABLE PAR PÉRIODE)
  const getAnalyticsData = useCallback(async (period = '7days') => {
    let allEvents = [];

    if (isSupabaseConfigured() && supabase) {
      allEvents = await fetchAllRows('analytics_events', 'created_at');
    } else {
      allEvents = getStoredData('analytics_events', []);
    }
    if (!Array.isArray(allEvents)) {
      throw new Error('Les événements analytiques ont un format invalide.');
    }

    // Filtrer par date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date(0);

    if (period === 'today') {
      startDate = today;
    } else if (period === '7days') {
      startDate = new Date(today.getTime() - 6 * 86400000);
    } else if (period === '30days') {
      startDate = new Date(today.getTime() - 29 * 86400000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } // 'all' garde new Date(0)

    const filteredEvents = allEvents.filter((e) => new Date(e.created_at) >= startDate);
    const filteredOrders = orders.filter((o) => new Date(o.order_date || o.created_at) >= startDate);
    const filteredDeliveries = orders.filter(
      (o) => o.status === 'Livrée' && o.delivered_at && new Date(o.delivered_at) >= startDate
    );

    // Métriques calculées selon les spécifications :
    // 1. Visiteurs uniques (set de visitor_id)
    const uniqueVisitorsSet = new Set(filteredEvents.map((e) => e.visitor_id));
    const uniqueVisitors = uniqueVisitorsSet.size;

    // Sessions uniques
    const uniqueSessionsSet = new Set(filteredEvents.map((e) => e.session_id));
    const uniqueSessions = uniqueSessionsSet.size;

    // Pages consultées
    const pageViews = filteredEvents.filter((e) => e.event_type === 'page_view' || e.event_type === 'product_view').length;

    // 2. Clics WhatsApp
    const whatsappClicks = filteredEvents.filter((e) => e.event_type === 'whatsapp_click').length;

    // 3. Commandes
    const totalOrders = filteredOrders.length;

    // 4. Livraisons effectuées (commandes au statut 'Livrée' sans doublon)
    const deliveredOrders = filteredDeliveries.length;

    // 5. Commandes en attente
    const pendingOrders = filteredOrders.filter((o) => o.status === 'En attente').length;

    // 6. Commandes annulées
    const cancelledOrders = filteredOrders.filter((o) => o.status === 'Annulée').length;

    // Groupement par jour pour les graphiques
    // Créer un dictionnaire de dates clés
    const daysMap = {};
    const getBucket = (value) => {
      const date = new Date(value);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const key = period === 'all'
        ? `${date.getFullYear()}-${month}`
        : `${date.getFullYear()}-${month}-${day}`;
      if (!daysMap[key]) {
        daysMap[key] = {
          date: period === 'all'
            ? date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
            : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          visitors: 0,
          whatsappClicks: 0,
          orders: 0,
          deliveries: 0,
          _visitorSet: new Set()
        };
      }
      return daysMap[key];
    };

    if (period !== 'all') {
      const daysCount = period === 'today'
        ? 1
        : period === '7days'
          ? 7
          : period === '30days'
            ? 30
            : now.getDate();
      for (let i = daysCount - 1; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 86400000);
        getBucket(date);
      }
    }

    filteredEvents.forEach((event) => {
      const bucket = getBucket(event.created_at);
      bucket._visitorSet.add(event.visitor_id);
      if (event.event_type === 'whatsapp_click') {
        bucket.whatsappClicks += 1;
      }
    });

    filteredOrders.forEach((order) => {
      getBucket(order.order_date || order.created_at).orders += 1;
    });

    filteredDeliveries.forEach((order) => {
      getBucket(order.delivered_at).deliveries += 1;
    });

    const chartData = Object.entries(daysMap)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, day]) => ({
      date: day.date,
      visitors: day._visitorSet.size,
      whatsappClicks: day.whatsappClicks,
      orders: day.orders,
      deliveries: day.deliveries
      }));

    // Top produits consultés et générant des clics
    const productStats = {};
    products.forEach((p) => {
      productStats[p.id] = { id: p.id, name: p.name, category: p.category, views: 0, clicks: 0, price: p.price };
    });

    filteredEvents.forEach((e) => {
      if (e.product_id && productStats[e.product_id]) {
        if (e.event_type === 'product_view') productStats[e.product_id].views += 1;
        if (e.event_type === 'whatsapp_click') productStats[e.product_id].clicks += 1;
      }
    });

    const topViewedProducts = Object.values(productStats).sort((a, b) => b.views - a.views);
    const topClickedProducts = Object.values(productStats).sort((a, b) => b.clicks - a.clicks);

    return {
      uniqueVisitors,
      uniqueSessions,
      pageViews,
      whatsappClicks,
      totalOrders,
      deliveredOrders,
      pendingOrders,
      cancelledOrders,
      chartData,
      topViewedProducts,
      topClickedProducts
    };
  }, [orders, products, analyticsRevision]);

  const getWhatsAppClicks = useCallback(async (page = 0, pageSize = 50) => {
    const from = page * pageSize;
    if (isSupabaseConfigured() && supabase) {
      const { data, error, count } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'whatsapp_click')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      return { data: data || [], count: count || 0 };
    }

    const clicks = getStoredData('analytics_events', [])
      .filter((event) => event.event_type === 'whatsapp_click')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: clicks.slice(from, from + pageSize), count: clicks.length };
  }, []);

  const resetAnalytics = async () => {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('analytics_events')
        .delete()
        .neq('event_type', 'none_placeholder');
      if (error) {
        showNotification(error.message, 'error');
        throw error;
      }
    }
    localStorage.removeItem('mb_analytics_events');
    setAnalyticsRevision((revision) => revision + 1);
    showNotification('Statistiques réinitialisées avec succès !', 'success');
  };

  const value = {
    products,
    orders,
    settings,
    loading,
    dataMode,
    loadError,
    realtimeError,
    analyticsRevision,
    notification,
    showNotification,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    addOrder,
    updateOrder,
    deleteOrder,
    markOrderDelivered,
    updateSettings,
    getAnalyticsData,
    getWhatsAppClicks,
    resetAnalytics,
    refreshData: fetchData
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
