import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Minus, Trash2, ChevronLeft,
  Calendar, ShoppingBag, Send,
  Check, Pencil, Download, BarChart3,
} from 'lucide-react';

// ============================================================
// PALETA DE COLORES
// ============================================================
const C = {
  bg: '#FAF6F0',
  card: '#FFFFFF',
  ink: '#1E2A3A',
  inkLight: '#6B7280',
  accent: '#1E3A5F',
  accent2: '#C8553D',
  success: '#3F7D58',
  danger: '#B8392E',
  warm: '#E8DCC8',
  border: '#E5DDD2',
};

const SERIF = 'Fraunces, Georgia, serif';
const SANS = 'Manrope, system-ui, sans-serif';

// ============================================================
// DATOS POR DEFECTO (editables desde Admin)
// ============================================================
const DEFAULT_PRODUCTS = [
  { id: 'p1',  name: 'Falafel',   price: 3500, emoji: '🧆' },
  { id: 'p2',  name: 'Hummus',    price: 2500, emoji: '🥣' },
  { id: 'p3',  name: 'Jalá',      price: 3000, emoji: '🍞' },
  { id: 'p4',  name: 'Bourekas',  price: 2000, emoji: '🥟' },
  { id: 'p5',  name: 'Empanada',  price: 2500, emoji: '🫓' },
  { id: 'p6',  name: 'Kibbeh',    price: 3000, emoji: '🥮' },
  { id: 'p7',  name: 'Ensalada',  price: 3500, emoji: '🥗' },
  { id: 'p8',  name: 'Gaseosa',   price: 1500, emoji: '🥤' },
  { id: 'p9',  name: 'Agua',      price: 1000, emoji: '💧' },
  { id: 'p10', name: 'Café',      price: 1500, emoji: '☕' },
  { id: 'p11', name: 'Té',        price: 1000, emoji: '🫖' },
  { id: 'p12', name: 'Postre',    price: 2500, emoji: '🍰' },
];

const PAYMENT_METHODS = [
  { id: 'cash',     label: 'Efectivo',       emoji: '💵' },
  { id: 'transfer', label: 'Transferencia',  emoji: '📱' },
  { id: 'card',     label: 'Tarjeta',        emoji: '💳' },
];

const COMMON_EMOJIS = [
  '🧆','🥣','🍞','🥟','🫓','🥮','🥗','🥤','💧','☕','🫖','🍰',
  '🥯','🥙','🌯','🥖','🧀','🍪','🍯','🥧','🍇','🥒','🍅','🫒','🍽️','✨',
];

// ============================================================
// HELPERS
// ============================================================
const formatCLP = (n) => '$' + Math.round(n || 0).toLocaleString('es-CL');
const todayISO  = () => new Date().toISOString().slice(0, 10);
const formatDateTime = (iso) => new Date(iso).toLocaleString('es-CL', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const calcTotal = (items) => items.reduce((s, i) => s + i.price * i.qty, 0);
const uid = () => 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// localStorage helpers (replacing window.storage)
function loadKey(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch { return defaultVal; }
}
function saveKey(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { console.error('Storage error:', e); }
}

// ============================================================
// MODAL GENÉRICO
// ============================================================
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30, 42, 58, 0.55)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 max-w-md w-full shadow-2xl"
        style={{ background: C.card }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================
// FORMULARIO DE PRODUCTO (admin)
// ============================================================
function ProductForm({ product, onSave, onClose }) {
  const [name,  setName]  = useState(product.name  || '');
  const [price, setPrice] = useState(product.price || '');
  const [emoji, setEmoji] = useState(product.emoji || '🍽️');

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontFamily: SERIF, color: C.ink }} className="text-2xl mb-4 font-bold">
        {product.id ? 'Editar producto' : 'Agregar producto'}
      </h2>

      <label style={{ color: C.ink, fontFamily: SANS }} className="block text-base mb-1 font-semibold">
        Nombre
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border-2 p-3 text-lg outline-none mb-4"
        style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
        autoFocus
      />

      <label style={{ color: C.ink, fontFamily: SANS }} className="block text-base mb-1 font-semibold">
        Precio (CLP)
      </label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-xl border-2 p-3 text-lg outline-none mb-4"
        style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
      />

      <label style={{ color: C.ink, fontFamily: SANS }} className="block text-base mb-2 font-semibold">
        Ícono
      </label>
      <div className="flex flex-wrap gap-2 mb-5">
        {COMMON_EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className="text-3xl p-2 rounded-lg transition"
            style={{
              background: emoji === e ? C.accent2 : C.bg,
              border: `1px solid ${emoji === e ? C.accent2 : C.border}`,
            }}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl py-4 text-lg font-semibold"
          style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            if (name.trim() && price) {
              onSave({ id: product.id, name: name.trim(), price: Number(price), emoji });
            }
          }}
          className="flex-1 rounded-xl py-4 text-lg font-semibold"
          style={{
            background: name.trim() && price ? C.accent2 : '#CCCCCC',
            color: 'white',
            fontFamily: SANS,
          }}
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// DIÁLOGO "PRODUCTO ESPECIAL" (durante la venta)
// ============================================================
function CustomItemDialog({ onSave, onClose }) {
  const [name,  setName]  = useState('');
  const [price, setPrice] = useState('');

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontFamily: SERIF, color: C.ink }} className="text-2xl mb-2 font-bold">
        Producto especial
      </h2>
      <p style={{ color: C.inkLight, fontFamily: SANS }} className="text-base mb-4">
        Para algo que no está en el menú
      </p>

      <label style={{ color: C.ink, fontFamily: SANS }} className="block text-base mb-1 font-semibold">
        Nombre
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Galletitas caseras"
        className="w-full rounded-xl border-2 p-3 text-lg outline-none mb-4"
        style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
        autoFocus
      />

      <label style={{ color: C.ink, fontFamily: SANS }} className="block text-base mb-1 font-semibold">
        Precio (CLP)
      </label>
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Ej: 1500"
        className="w-full rounded-xl border-2 p-3 text-lg outline-none mb-5"
        style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
      />

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl py-4 text-lg font-semibold"
          style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
        >
          Cancelar
        </button>
        <button
          onClick={() => { if (name.trim() && price) onSave(name.trim(), Number(price)); }}
          className="flex-1 rounded-xl py-4 text-lg font-semibold"
          style={{
            background: name.trim() && price ? C.accent2 : '#CCCCCC',
            color: 'white',
            fontFamily: SANS,
          }}
        >
          Agregar
        </button>
      </div>
    </Modal>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function POSShul() {
  const [view, setView]               = useState('home'); // home | order | pay | success | admin
  const [adminTab, setAdminTab]       = useState('summary'); // summary | products | history
  const [products, setProducts]       = useState([]);
  const [orders, setOrders]           = useState([]);
  const [nextNum, setNextNum]         = useState(1);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [paidOrder, setPaidOrder]     = useState(null);

  // diálogos
  const [showNewOrder, setShowNewOrder]           = useState(false);
  const [newOrderName, setNewOrderName]           = useState('');
  const [showCustom, setShowCustom]               = useState(false);
  const [editingProduct, setEditingProduct]       = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder]     = useState(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);

  // filtros admin
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate,   setToDate]   = useState(todayISO());

  // --- carga inicial (localStorage) ---
  useEffect(() => {
    const prods = loadKey('shul_products', null) ?? (() => {
      saveKey('shul_products', DEFAULT_PRODUCTS);
      return DEFAULT_PRODUCTS;
    })();
    const ords = loadKey('shul_orders', []);
    const n    = loadKey('shul_nextNum', 1);
    setProducts(prods);
    setOrders(ords);
    setNextNum(n);
    setLoading(false);
  }, []);

  // --- derivados ---
  const currentOrder = orders.find((o) => o.id === currentOrderId);
  const openOrders   = orders
    .filter((o) => o.status === 'open')
    .sort((a, b) => b.number - a.number);

  const filteredOrders = useMemo(() => {
    const from = new Date(fromDate + 'T00:00:00').getTime();
    const to   = new Date(toDate   + 'T23:59:59').getTime();
    return orders.filter(
      (o) =>
        o.status === 'paid' &&
        new Date(o.paidAt).getTime() >= from &&
        new Date(o.paidAt).getTime() <= to,
    );
  }, [orders, fromDate, toDate]);

  // --- persistencia ---
  function persistOrders(next)   { setOrders(next);   saveKey('shul_orders',   next); }
  function persistProducts(next) { setProducts(next); saveKey('shul_products', next); }
  function persistNum(n)         { setNextNum(n);     saveKey('shul_nextNum',  n);    }

  // --- acciones ---
  function createOrder() {
    const id  = uid();
    const num = nextNum;
    const order = {
      id, number: num,
      customerName: newOrderName.trim(),
      items: [],
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    persistOrders([...orders, order]);
    persistNum(num + 1);
    setCurrentOrderId(id);
    setNewOrderName('');
    setShowNewOrder(false);
    setView('order');
  }

  function addToOrder(product) {
    if (!currentOrder) return;
    const items = [...currentOrder.items];
    const idx   = items.findIndex((i) => i.productId === product.id);
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + 1 };
    else items.push({
      productId: product.id, name: product.name,
      emoji: product.emoji, price: product.price, qty: 1,
    });
    persistOrders(orders.map((o) => o.id === currentOrder.id ? { ...o, items } : o));
  }

  function updateQty(productId, delta) {
    if (!currentOrder) return;
    const items = currentOrder.items
      .map((i) => i.productId === productId ? { ...i, qty: i.qty + delta } : i)
      .filter((i) => i.qty > 0);
    persistOrders(orders.map((o) => o.id === currentOrder.id ? { ...o, items } : o));
  }

  function addCustomItem(name, price) {
    if (!currentOrder) return;
    const items = [...currentOrder.items, {
      productId: 'custom_' + uid(),
      name, price, emoji: '✨', qty: 1,
    }];
    persistOrders(orders.map((o) => o.id === currentOrder.id ? { ...o, items } : o));
    setShowCustom(false);
  }

  function deleteOrder(id) {
    persistOrders(orders.filter((o) => o.id !== id));
    setConfirmDeleteOrder(null);
    if (currentOrderId === id) { setCurrentOrderId(null); setView('home'); }
  }

  function payOrder(method) {
    if (!currentOrder) return;
    const total   = calcTotal(currentOrder.items);
    const updated = {
      ...currentOrder,
      status: 'paid',
      paymentMethod: method,
      total,
      paidAt: new Date().toISOString(),
    };
    persistOrders(orders.map((o) => o.id === currentOrder.id ? updated : o));
    setPaidOrder(updated);
    setView('success');
  }

  function sendWhatsApp(order) {
    const customerLine = order.customerName ? ` · ${order.customerName}` : '';
    const lines = [
      `*Comprobante — Ventas Shul*`,
      `Orden #${order.number}${customerLine}`,
      formatDateTime(order.paidAt),
      ``,
    ];
    order.items.forEach((i) => {
      lines.push(`• ${i.qty}× ${i.name} — ${formatCLP(i.price * i.qty)}`);
    });
    lines.push(``);
    lines.push(`*TOTAL: ${formatCLP(order.total)}*`);
    const m = PAYMENT_METHODS.find((p) => p.id === order.paymentMethod);
    if (m) lines.push(`Pago: ${m.label}`);
    lines.push(``);
    lines.push(`¡Muchas gracias!`);
    const url = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
  }

  function exportCSV() {
    const headers = ['Orden', 'Cliente', 'Fecha', 'Hora', 'Productos', 'Total', 'Medio de pago'];
    const rows = filteredOrders.map((o) => {
      const d = new Date(o.paidAt);
      return [
        o.number,
        o.customerName || '',
        d.toLocaleDateString('es-CL'),
        d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        o.items.map((i) => `${i.qty}x ${i.name}`).join('; '),
        o.total,
        PAYMENT_METHODS.find((p) => p.id === o.paymentMethod)?.label || '',
      ];
    });
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `ventas-shul-${fromDate}_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================================================
  // SUB-COMPONENTES DE LAYOUT
  // ============================================================

  function Header({ title, onBack, right }) {
    return (
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: `1px solid ${C.border}`, background: C.card }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg flex-shrink-0"
              style={{ background: C.warm }}
              aria-label="Volver"
            >
              <ChevronLeft size={28} style={{ color: C.ink }} />
            </button>
          )}
          <h1
            style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }}
            className="text-2xl truncate"
          >
            {title}
          </h1>
        </div>
        {right}
      </div>
    );
  }

  // ============================================================
  // VISTAS
  // ============================================================

  // ====== HOME ======
  function renderHome() {
    const now       = new Date();
    const dateLabel = now.toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
    });

    return (
      <div className="min-h-screen" style={{ background: C.bg }}>
        <Header
          title="Ventas Shul"
          right={
            <button
              onClick={() => setView('admin')}
              className="px-4 py-3 rounded-lg flex items-center gap-2"
              style={{ background: C.warm, color: C.ink, fontFamily: SANS, fontWeight: 600 }}
            >
              <BarChart3 size={20} />
              <span className="hidden sm:inline">Resumen</span>
            </button>
          }
        />

        <div className="max-w-2xl mx-auto p-4 md:p-6">
          <p style={{ color: C.inkLight, fontFamily: SANS }} className="text-base capitalize mb-6">
            {dateLabel}
          </p>

          {openOrders.length > 0 && (
            <div className="mb-6">
              <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-xl mb-3">
                Órdenes abiertas ({openOrders.length})
              </h2>
              <div className="space-y-3">
                {openOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-2xl shadow-sm flex items-stretch"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                  >
                    <button
                      onClick={() => { setCurrentOrderId(o.id); setView('order'); }}
                      className="flex-1 text-left p-5 rounded-l-2xl transition active:bg-gray-50"
                    >
                      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                        <span style={{ fontFamily: SERIF, color: C.accent2, fontWeight: 700 }} className="text-3xl">
                          #{o.number}
                        </span>
                        {o.customerName && (
                          <span style={{ color: C.ink, fontFamily: SANS }} className="text-xl font-semibold">
                            {o.customerName}
                          </span>
                        )}
                      </div>
                      <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-base">
                        {o.items.reduce((s, i) => s + i.qty, 0)} productos · {formatCLP(calcTotal(o.items))}
                      </div>
                    </button>
                    <button
                      onClick={() => setConfirmDeleteOrder(o.id)}
                      className="px-4 flex items-center"
                      style={{ background: 'transparent' }}
                      aria-label="Eliminar orden"
                    >
                      <div className="p-2 rounded-lg" style={{ background: '#FBEEEC' }}>
                        <Trash2 size={20} style={{ color: C.danger }} />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowNewOrder(true)}
            className="w-full rounded-2xl p-8 shadow-lg transition active:scale-95"
            style={{ background: C.accent2, color: 'white' }}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Plus size={40} strokeWidth={3} />
              <span style={{ fontFamily: SERIF, fontWeight: 700 }} className="text-3xl md:text-4xl">
                Nueva orden
              </span>
            </div>
            <div style={{ fontFamily: SANS }} className="text-base opacity-90">
              Tocá para empezar una venta
            </div>
          </button>

          {openOrders.length === 0 && (
            <div
              className="mt-8 p-6 rounded-2xl text-center"
              style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
            >
              <p className="text-base">
                No hay órdenes abiertas. Tocá <b>Nueva orden</b> para empezar.
              </p>
            </div>
          )}
        </div>

        {showNewOrder && (
          <Modal onClose={() => { setShowNewOrder(false); setNewOrderName(''); }}>
            <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-2xl mb-2">
              Nueva orden #{nextNum}
            </h2>
            <p style={{ color: C.inkLight, fontFamily: SANS }} className="text-base mb-4">
              Nombre del cliente o mesa <i>(opcional)</i>
            </p>
            <input
              value={newOrderName}
              onChange={(e) => setNewOrderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createOrder(); }}
              placeholder="Ej: Sara, Mesa fondo..."
              className="w-full rounded-xl border-2 p-4 text-xl outline-none"
              style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowNewOrder(false); setNewOrderName(''); }}
                className="flex-1 rounded-xl py-4 text-lg font-semibold"
                style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
              >
                Cancelar
              </button>
              <button
                onClick={createOrder}
                className="flex-1 rounded-xl py-4 text-lg font-semibold"
                style={{ background: C.accent2, color: 'white', fontFamily: SANS }}
              >
                Crear orden
              </button>
            </div>
          </Modal>
        )}

        {confirmDeleteOrder && (
          <Modal onClose={() => setConfirmDeleteOrder(null)}>
            <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-2xl mb-2">
              ¿Eliminar orden?
            </h2>
            <p style={{ color: C.inkLight, fontFamily: SANS }} className="text-base mb-5">
              La orden se descarta y <b>no</b> queda registrada como venta.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteOrder(null)}
                className="flex-1 rounded-xl py-4 text-lg font-semibold"
                style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
              >
                No, volver
              </button>
              <button
                onClick={() => deleteOrder(confirmDeleteOrder)}
                className="flex-1 rounded-xl py-4 text-lg font-semibold"
                style={{ background: C.danger, color: 'white', fontFamily: SANS }}
              >
                Sí, eliminar
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ====== ORDER ======
  function renderOrder() {
    if (!currentOrder) { setView('home'); return null; }
    const items = currentOrder.items;
    const total = calcTotal(items);
    const title = `#${currentOrder.number}${currentOrder.customerName ? ' · ' + currentOrder.customerName : ''}`;

    return (
      <div className="min-h-screen pb-40" style={{ background: C.bg }}>
        <Header
          title={title}
          onBack={() => { setView('home'); setCurrentOrderId(null); }}
        />

        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-xl mb-4">
            Tocá un producto para agregarlo
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => addToOrder(p)}
                className="rounded-2xl p-4 text-center shadow-sm transition active:scale-95"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="text-5xl mb-2">{p.emoji}</div>
                <div style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }} className="text-lg mb-1">
                  {p.name}
                </div>
                <div style={{ color: C.accent2, fontFamily: SERIF, fontWeight: 700 }} className="text-xl">
                  {formatCLP(p.price)}
                </div>
              </button>
            ))}
            <button
              onClick={() => setShowCustom(true)}
              className="rounded-2xl p-4 text-center transition active:scale-95"
              style={{ border: `2px dashed ${C.accent}`, background: 'transparent' }}
            >
              <div className="text-5xl mb-2">✨</div>
              <div style={{ color: C.accent, fontFamily: SANS, fontWeight: 600 }} className="text-lg">
                Otro
              </div>
              <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm">
                producto especial
              </div>
            </button>
          </div>

          {items.length > 0 && (
            <div
              className="rounded-2xl p-5 mb-4"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <h3 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-xl mb-3">
                En esta orden
              </h3>
              <div>
                {items.map((i, idx) => (
                  <div
                    key={i.productId}
                    className="flex items-center gap-3 py-3 flex-wrap"
                    style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}
                  >
                    <span className="text-3xl">{i.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }} className="text-lg truncate">
                        {i.name}
                      </div>
                      <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm">
                        {formatCLP(i.price)} c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(i.productId, -1)}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: C.warm, color: C.ink }}
                        aria-label="Restar"
                      >
                        <Minus size={22} strokeWidth={3} />
                      </button>
                      <span
                        style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }}
                        className="text-2xl w-10 text-center"
                      >
                        {i.qty}
                      </span>
                      <button
                        onClick={() => updateQty(i.productId, 1)}
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: C.accent2, color: 'white' }}
                        aria-label="Sumar"
                      >
                        <Plus size={22} strokeWidth={3} />
                      </button>
                    </div>
                    <div style={{ color: C.ink, fontFamily: SERIF, fontWeight: 700 }} className="text-xl w-24 text-right">
                      {formatCLP(i.price * i.qty)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* barra fija inferior */}
        <div
          className="fixed bottom-0 left-0 right-0 p-4 shadow-2xl"
          style={{ background: C.card, borderTop: `1px solid ${C.border}` }}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm">Total</div>
              <div style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-3xl md:text-4xl truncate">
                {formatCLP(total)}
              </div>
            </div>
            <button
              onClick={() => items.length > 0 && setView('pay')}
              disabled={items.length === 0}
              className="rounded-xl px-8 py-5 transition active:scale-95"
              style={{
                background: items.length > 0 ? C.success : '#CCCCCC',
                color: 'white',
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: '1.5rem',
                cursor: items.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Cobrar →
            </button>
          </div>
        </div>

        {showCustom && (
          <CustomItemDialog onSave={addCustomItem} onClose={() => setShowCustom(false)} />
        )}
      </div>
    );
  }

  // ====== PAY ======
  function renderPay() {
    if (!currentOrder) { setView('home'); return null; }
    const total = calcTotal(currentOrder.items);

    return (
      <div className="min-h-screen" style={{ background: C.bg }}>
        <Header title="Cobrar" onBack={() => setView('order')} />
        <div className="max-w-2xl mx-auto p-4 md:p-6">
          <div
            className="rounded-2xl p-8 text-center mb-6 shadow-sm"
            style={{ background: C.card, border: `1px solid ${C.border}` }}
          >
            <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm mb-2 uppercase tracking-widest">
              Orden #{currentOrder.number}{currentOrder.customerName ? ' · ' + currentOrder.customerName : ''}
            </div>
            <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-base mb-3">
              Total a cobrar
            </div>
            <div style={{ fontFamily: SERIF, color: C.accent2, fontWeight: 700 }} className="text-6xl md:text-7xl">
              {formatCLP(total)}
            </div>
          </div>

          <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-2xl mb-4 text-center">
            ¿Cómo paga?
          </h2>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => payOrder(m.id)}
                className="w-full rounded-2xl py-6 px-6 flex items-center gap-5 shadow-sm transition active:scale-95"
                style={{ background: C.card, border: `2px solid ${C.border}`, color: C.ink }}
              >
                <span className="text-5xl">{m.emoji}</span>
                <span style={{ fontFamily: SERIF, fontWeight: 700 }} className="text-2xl md:text-3xl">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ====== SUCCESS ======
  function renderSuccess() {
    if (!paidOrder) { setView('home'); return null; }
    const o = paidOrder;

    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: C.bg }}>
        <div
          className="max-w-md w-full rounded-3xl p-8 text-center shadow-lg"
          style={{ background: C.card, border: `1px solid ${C.border}` }}
        >
          <div
            className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: C.success }}
          >
            <Check size={56} strokeWidth={3} style={{ color: 'white' }} />
          </div>
          <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-3xl mb-2">
            ¡Cobro registrado!
          </h2>
          <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-lg mb-1">
            Orden #{o.number}{o.customerName ? ' · ' + o.customerName : ''}
          </div>
          <div style={{ fontFamily: SERIF, color: C.accent2, fontWeight: 700 }} className="text-5xl mb-6">
            {formatCLP(o.total)}
          </div>
          <div className="space-y-3">
            <button
              onClick={() => sendWhatsApp(o)}
              className="w-full rounded-xl py-5 flex items-center justify-center gap-3 shadow"
              style={{ background: '#25D366', color: 'white', fontFamily: SANS, fontWeight: 700 }}
            >
              <Send size={24} />
              <span className="text-xl">Enviar por WhatsApp</span>
            </button>
            <button
              onClick={() => { setPaidOrder(null); setCurrentOrderId(null); setView('home'); }}
              className="w-full rounded-xl py-5 text-xl font-semibold"
              style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== ADMIN ======
  function renderAdmin() {
    const totalPeriod = filteredOrders.reduce((s, o) => s + o.total, 0);
    const byPayment   = PAYMENT_METHODS.map((m) => {
      const list = filteredOrders.filter((o) => o.paymentMethod === m.id);
      return { ...m, total: list.reduce((s, o) => s + o.total, 0), count: list.length };
    });
    const productAgg = {};
    filteredOrders.forEach((o) => {
      o.items.forEach((i) => {
        if (!productAgg[i.name]) productAgg[i.name] = { name: i.name, emoji: i.emoji, qty: 0, total: 0 };
        productAgg[i.name].qty   += i.qty;
        productAgg[i.name].total += i.price * i.qty;
      });
    });
    const productList = Object.values(productAgg).sort((a, b) => b.total - a.total);

    return (
      <div className="min-h-screen" style={{ background: C.bg }}>
        <Header title="Resumen y gestión" onBack={() => setView('home')} />
        <div className="max-w-6xl mx-auto p-4 md:p-6">

          {/* tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto">
            {[
              { id: 'summary',  label: 'Resumen',   icon: BarChart3   },
              { id: 'products', label: 'Productos',  icon: ShoppingBag },
              { id: 'history',  label: 'Historial',  icon: Calendar    },
            ].map((t) => {
              const Icon   = t.icon;
              const active = adminTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setAdminTab(t.id)}
                  className="px-4 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap"
                  style={{
                    background: active ? C.accent : C.card,
                    color: active ? 'white' : C.ink,
                    border: `1px solid ${active ? C.accent : C.border}`,
                    fontFamily: SANS,
                    fontWeight: 600,
                  }}
                >
                  <Icon size={18} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* filtro de fecha */}
          {(adminTab === 'summary' || adminTab === 'history') && (
            <div
              className="flex flex-wrap items-center gap-3 mb-5 p-4 rounded-xl"
              style={{ background: C.card, border: `1px solid ${C.border}` }}
            >
              <span style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }}>Desde</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-lg border p-2"
                style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
              />
              <span style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }}>Hasta</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-lg border p-2"
                style={{ borderColor: C.border, fontFamily: SANS, color: C.ink }}
              />
              <div className="flex gap-2 ml-auto flex-wrap">
                <button
                  onClick={() => { setFromDate(todayISO()); setToDate(todayISO()); }}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: C.warm, color: C.ink, fontFamily: SANS, fontWeight: 600 }}
                >
                  Hoy
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    setFromDate(d.toISOString().slice(0, 10));
                    setToDate(todayISO());
                  }}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: C.warm, color: C.ink, fontFamily: SANS, fontWeight: 600 }}
                >
                  Últ. 7 días
                </button>
                <button
                  onClick={() => {
                    const d = new Date();
                    d.setDate(1);
                    setFromDate(d.toISOString().slice(0, 10));
                    setToDate(todayISO());
                  }}
                  className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: C.warm, color: C.ink, fontFamily: SANS, fontWeight: 600 }}
                >
                  Este mes
                </button>
              </div>
            </div>
          )}

          {/* tab: resumen */}
          {adminTab === 'summary' && (
            <>
              <div
                className="rounded-2xl p-6 mb-5 shadow-sm"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm uppercase tracking-wider mb-1">
                  Total vendido en el período
                </div>
                <div style={{ fontFamily: SERIF, color: C.accent2, fontWeight: 700 }} className="text-5xl md:text-6xl">
                  {formatCLP(totalPeriod)}
                </div>
                <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-base mt-2">
                  {filteredOrders.length} órdenes pagadas
                </div>
              </div>

              <h3 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-xl mb-3">
                Por medio de pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {byPayment.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl p-5 shadow-sm"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{m.emoji}</span>
                      <span style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }}>{m.label}</span>
                    </div>
                    <div style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-3xl">
                      {formatCLP(m.total)}
                    </div>
                    <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm">
                      {m.count} {m.count === 1 ? 'orden' : 'órdenes'}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-xl mb-3">
                Por producto
              </h3>
              <div
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                {productList.length === 0 ? (
                  <div className="p-6 text-center" style={{ color: C.inkLight, fontFamily: SANS }}>
                    No hay ventas en el período seleccionado.
                  </div>
                ) : (
                  productList.map((p, idx) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between p-4 flex-wrap gap-2"
                      style={{ borderTop: idx > 0 ? `1px solid ${C.border}` : 'none' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl">{p.emoji}</span>
                        <div className="min-w-0">
                          <div style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }} className="text-lg truncate">
                            {p.name}
                          </div>
                          <div style={{ color: C.inkLight, fontFamily: SANS }} className="text-sm">
                            {p.qty} unidades
                          </div>
                        </div>
                      </div>
                      <div style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-xl">
                        {formatCLP(p.total)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* tab: productos */}
          {adminTab === 'products' && (
            <>
              <button
                onClick={() => setEditingProduct({ id: null, name: '', price: '', emoji: '🍽️' })}
                className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
                style={{ background: C.accent2, color: 'white', fontFamily: SANS, fontWeight: 600 }}
              >
                <Plus size={20} />
                Agregar producto
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl p-4 flex items-center gap-3 shadow-sm"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                  >
                    <span className="text-4xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: C.ink, fontFamily: SANS, fontWeight: 600 }} className="text-lg truncate">
                        {p.name}
                      </div>
                      <div style={{ color: C.accent2, fontFamily: SERIF, fontWeight: 700 }} className="text-lg">
                        {formatCLP(p.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-3 rounded-lg"
                      style={{ background: C.warm }}
                      aria-label="Editar"
                    >
                      <Pencil size={18} style={{ color: C.ink }} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteProduct(p)}
                      className="p-3 rounded-lg"
                      style={{ background: '#FBEEEC' }}
                      aria-label="Eliminar"
                    >
                      <Trash2 size={18} style={{ color: C.danger }} />
                    </button>
                  </div>
                ))}
              </div>
              {products.length === 0 && (
                <div
                  className="rounded-2xl p-6 text-center mt-4"
                  style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
                >
                  No hay productos. Tocá <b>Agregar producto</b> para crear el primero.
                </div>
              )}
            </>
          )}

          {/* tab: historial */}
          {adminTab === 'history' && (
            <>
              <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
                <h3 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 600 }} className="text-xl">
                  Ventas ({filteredOrders.length})
                </h3>
                <button
                  onClick={exportCSV}
                  disabled={filteredOrders.length === 0}
                  className="px-4 py-3 rounded-xl flex items-center gap-2"
                  style={{
                    background: filteredOrders.length > 0 ? C.accent : '#CCCCCC',
                    color: 'white',
                    fontFamily: SANS,
                    fontWeight: 600,
                  }}
                >
                  <Download size={20} />
                  Exportar a Excel
                </button>
              </div>

              {filteredOrders.length === 0 ? (
                <div
                  className="rounded-2xl p-8 text-center"
                  style={{ background: C.card, color: C.inkLight, fontFamily: SANS, border: `1px solid ${C.border}` }}
                >
                  No hay ventas en el período seleccionado.
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead style={{ background: C.warm }}>
                        <tr>
                          {['#', 'Cliente', 'Fecha y hora', 'Productos', 'Pago', 'Total'].map((h, i) => (
                            <th
                              key={h}
                              className={`p-3 text-sm font-semibold ${i === 5 ? 'text-right' : ''}`}
                              style={{ color: C.ink, fontFamily: SANS }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...filteredOrders].reverse().map((o) => {
                          const m = PAYMENT_METHODS.find((p) => p.id === o.paymentMethod);
                          return (
                            <tr key={o.id} style={{ borderTop: `1px solid ${C.border}` }}>
                              <td className="p-3" style={{ fontFamily: SERIF, color: C.accent2, fontWeight: 700 }}>
                                #{o.number}
                              </td>
                              <td className="p-3" style={{ color: C.ink, fontFamily: SANS }}>
                                {o.customerName || '—'}
                              </td>
                              <td className="p-3 text-sm" style={{ color: C.inkLight, fontFamily: SANS }}>
                                {formatDateTime(o.paidAt)}
                              </td>
                              <td className="p-3 text-sm" style={{ color: C.ink, fontFamily: SANS }}>
                                {o.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                              </td>
                              <td className="p-3" style={{ color: C.ink, fontFamily: SANS }}>
                                {m ? `${m.emoji} ${m.label}` : '—'}
                              </td>
                              <td className="p-3 text-right" style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }}>
                                {formatCLP(o.total)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSave={(data) => {
              if (data.id) {
                persistProducts(products.map((p) => (p.id === data.id ? data : p)));
              } else {
                persistProducts([...products, { ...data, id: uid() }]);
              }
              setEditingProduct(null);
            }}
            onClose={() => setEditingProduct(null)}
          />
        )}

        {confirmDeleteProduct && (
          <Modal onClose={() => setConfirmDeleteProduct(null)}>
            <h2 style={{ fontFamily: SERIF, color: C.ink, fontWeight: 700 }} className="text-2xl mb-2">
              ¿Eliminar producto?
            </h2>
            <p style={{ color: C.inkLight, fontFamily: SANS }} className="text-base mb-5">
              Se eliminará <b>{confirmDeleteProduct.name}</b> del menú. Las ventas anteriores siguen guardadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteProduct(null)}
                className="flex-1 rounded-xl py-4 text-lg font-semibold"
                style={{ background: C.warm, color: C.ink, fontFamily: SANS }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  persistProducts(products.filter((p) => p.id !== confirmDeleteProduct.id));
                  setConfirmDeleteProduct(null);
                }}
                className="flex-1 rounded-xl py-4 text-lg font-semibold"
                style={{ background: C.danger, color: 'white', fontFamily: SANS }}
              >
                Sí, eliminar
              </button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Manrope:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Manrope', system-ui, sans-serif; }
        button, input, select, textarea { font-family: inherit; }
        input[type="date"] { min-width: 140px; }
      `}</style>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
          <div style={{ fontFamily: SERIF, color: C.ink }} className="text-2xl">Cargando…</div>
        </div>
      ) : view === 'home'    ? renderHome()
        : view === 'order'   ? renderOrder()
        : view === 'pay'     ? renderPay()
        : view === 'success' ? renderSuccess()
        : view === 'admin'   ? renderAdmin()
        : renderHome()
      }
    </>
  );
}
