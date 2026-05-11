'use client';

import { useState } from 'react';
import {
  Bell,
  Plus,
  Minus,
  Edit2,
  AlertCircle,
  ShoppingBag,
  Coffee,
  GlassWater,
  IceCream,
  Wheat,
  Cake,
  LayoutGrid,
} from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', name: 'Semua Menu', count: 93, Icon: LayoutGrid },
  { id: 'kopi', name: 'Minuman Kopi', count: 23, Icon: Coffee },
  { id: 'non-kopi', name: 'Minuman Non Kopi', count: 14, Icon: GlassWater },
  { id: 'eskrim', name: 'Es Krim', count: 44, Icon: IceCream },
  { id: 'roti', name: 'Roti', count: 12, Icon: Wheat },
  { id: 'kue', name: 'Kue', count: 23, Icon: Cake },
];

const PRODUCTS = [
  {
    id: '1',
    name: 'Hot Cappucino',
    desc: 'Espresso dengan busa susu yang lembut dan creamy',
    price: 22000,
    category: 'kopi',
    emoji: '☕',
    bg: '#ddd8f8',
  },
  {
    id: '2',
    name: 'Classic Americano',
    desc: 'Espresso hitam halus dan ringan.',
    price: 20000,
    category: 'kopi',
    emoji: '🥤',
    bg: '#d8e8f8',
  },
  {
    id: '3',
    name: 'Rich Espresso Shot',
    desc: 'Espresso pekat untuk pencinta kopi sejati',
    price: 25000,
    category: 'kopi',
    emoji: '☕',
    bg: '#d8d8f5',
  },
  {
    id: '4',
    name: 'Hazelnut Mocha Bliss',
    desc: 'Espresso, cokelat, dan hazelnut pilihan',
    price: 33000,
    category: 'kopi',
    emoji: '🧋',
    bg: '#e8ddf8',
  },
  {
    id: '5',
    name: 'Dark Chocolate Coffe',
    desc: 'Coklat hangat dengan espresso premium',
    price: 28000,
    category: 'kopi',
    emoji: '🍫',
    bg: '#e0d8f5',
  },
  {
    id: '6',
    name: 'Creamy Caramel Latte',
    desc: 'Espresso lembut dengan karamel manis',
    price: 22000,
    category: 'kopi',
    emoji: '🥛',
    bg: '#f0e8d8',
  },
  {
    id: '7',
    name: 'Vanilla Sky Delight',
    desc: 'Es krim vanilla lembut rasa klasik terbaik',
    price: 28000,
    category: 'eskrim',
    emoji: '🍦',
    bg: '#f8f0d8',
  },
  {
    id: '8',
    name: 'Minty Cool Breeze',
    desc: 'Es krim mint segar cokelat renyah',
    price: 20000,
    category: 'eskrim',
    emoji: '🍧',
    bg: '#d8f0e8',
  },
  {
    id: '9',
    name: 'Golden Egg Toast',
    desc: 'Roti panggang lembut gurih dengan telur',
    price: 22000,
    category: 'roti',
    emoji: '🍳',
    bg: '#f8f0d0',
  },
  {
    id: '10',
    name: 'Vanilla Dream Muffin',
    desc: 'Muffin lembut rasa vanila yang menggugah',
    price: 18000,
    category: 'kue',
    emoji: '🧁',
    bg: '#f8e8d8',
  },
  {
    id: '11',
    name: 'Veggie Garden Wrap',
    desc: 'Wrap sehat isi sayuran segar pilihan',
    price: 25000,
    category: 'roti',
    emoji: '🌯',
    bg: '#d8f0d8',
  },
  {
    id: '12',
    name: 'Chocolate Fudge Cake',
    desc: 'Kue cokelat lembut dan kaya rasa premium',
    price: 32000,
    category: 'kue',
    emoji: '🎂',
    bg: '#e8d8f0',
  },
];

type Product = (typeof PRODUCTS)[number];

interface CartItem {
  product: Product;
  quantity: number;
  note: string;
}

const INITIAL_CART: CartItem[] = [
  { product: PRODUCTS[0], quantity: 1, note: 'Hot, Less Sugar' },
  { product: PRODUCTS[2], quantity: 1, note: 'Hot, No Sugar' },
  { product: PRODUCTS[3], quantity: 1, note: 'Tambahan Espresso' },
  { product: PRODUCTS[7], quantity: 1, note: 'Tidak ada tambahan' },
  { product: PRODUCTS[8], quantity: 1, note: 'Tidak ada tambahan' },
];

const TAX_RATE = 0.12;

function formatRp(n: number) {
  return `Rp${n.toLocaleString('id-ID')}`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CashierPOSPage() {
  const [activeTab, setActiveTab] = useState<'pesan' | 'aktifitas'>('pesan');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>(INITIAL_CART);
  const [selectedTable, setSelectedTable] = useState('');
  const [orderType, setOrderType] = useState('Dine In');

  const filteredProducts =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1, note: 'Tidak ada tambahan' }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const subTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tax = Math.round(subTotal * TAX_RATE);
  const total = subTotal + tax;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: '#f0f0f8',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 14,
        color: '#111827',
      }}
    >
      {/* ══════════════════════════════════════════
          LEFT PANEL — Menu browser
      ══════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* ─ Top header ─ */}
        <div
          style={{
            background: 'white',
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            borderBottom: '1px solid #ebebf5',
            flexShrink: 0,
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b85f0, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 15,
                border: '2.5px solid #c7c4f8',
                flexShrink: 0,
              }}
            >
              K1
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Kasir 1</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Farra Fitriyani</div>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              gap: 36,
            }}
          >
            {(['pesan', 'aktifitas'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: 15,
                  color: activeTab === tab ? '#6366f1' : '#9ca3af',
                  paddingBottom: 4,
                  borderBottom: activeTab === tab ? '2.5px solid #6366f1' : '2.5px solid transparent',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}
              >
                {tab === 'pesan' ? 'Pesan' : 'Aktifitas'}
              </button>
            ))}
          </div>

          {/* Spacer so avatar doesn't pull tabs off-center */}
          <div style={{ width: 58 }} />
        </div>

        {/* ─ Category tabs ─ */}
        <div
          className="no-scrollbar"
          style={{
            background: 'white',
            padding: '14px 28px',
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            flexShrink: 0,
            borderBottom: '1px solid #ebebf5',
          }}
        >
          {CATEGORIES.map(({ id, name, count, Icon }) => {
            const active = activeCategory === id;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 18px',
                  borderRadius: 14,
                  border: active ? '2px solid #6366f1' : '2px solid #e5e7eb',
                  background: active ? '#6366f1' : 'white',
                  color: active ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.2 }}>{name}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                    {count} Stok Produk
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─ Product grid ─ */}
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              gap: 16,
            }}
          >
            {filteredProducts.map((product) => {
              const inCart = cart.some((i) => i.product.id === product.id);
              return (
                <div
                  key={product.id}
                  style={{
                    background: 'white',
                    borderRadius: 18,
                    padding: 14,
                    boxShadow: '0 1px 4px rgba(99,102,241,0.06)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      '0 6px 18px rgba(99,102,241,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow =
                      '0 1px 4px rgba(99,102,241,0.06)';
                  }}
                >
                  {/* Product image placeholder */}
                  <div
                    style={{
                      background: product.bg,
                      borderRadius: 12,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 52,
                      marginBottom: 12,
                    }}
                  >
                    {product.emoji}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#111827',
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#9ca3af',
                      marginBottom: 10,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {product.desc}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                      {formatRp(product.price)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        border: `2px solid ${inCart ? '#6366f1' : '#d1d5db'}`,
                        background: inCart ? '#6366f1' : 'white',
                        color: inCart ? 'white' : '#9ca3af',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Order summary
      ══════════════════════════════════════════ */}
      <div
        style={{
          width: 380,
          flexShrink: 0,
          background: 'white',
          borderLeft: '1px solid #ebebf5',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ─ Panel header ─ */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f3f4f6',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="#111827" strokeWidth={1.8} />
            <span style={{ fontWeight: 700, fontSize: 17 }}>Daftar Pesanan</span>
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 8,
            }}
          >
            <Bell size={20} color="#9ca3af" strokeWidth={1.8} />
          </button>
        </div>

        {/* ─ Table + type selectors ─ */}
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            gap: 10,
            borderBottom: '1px solid #f3f4f6',
            flexShrink: 0,
          }}
        >
          {[
            {
              value: selectedTable,
              onChange: (v: string) => setSelectedTable(v),
              options: [
                { label: 'Pilih Meja', value: '' },
                ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
                  label: `Meja ${n}`,
                  value: String(n),
                })),
              ],
            },
            {
              value: orderType,
              onChange: (v: string) => setOrderType(v),
              options: [
                { label: 'Dine In', value: 'Dine In' },
                { label: 'Take Away', value: 'Take Away' },
              ],
            },
          ].map((sel, idx) => (
            <select
              key={idx}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: 10,
                border: '1.5px solid #e5e7eb',
                fontSize: 13,
                fontWeight: 500,
                color: '#374151',
                fontFamily: 'inherit',
                background: 'white',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {sel.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* ─ Cart items ─ */}
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '4px 20px' }}
        >
          {cart.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#d1d5db',
                gap: 10,
              }}
            >
              <ShoppingBag size={44} strokeWidth={1.2} />
              <p style={{ fontSize: 13 }}>Belum ada item dipilih</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid #f9fafb',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: item.product.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  {item.product.emoji}
                </div>

                {/* Info block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: '#111827',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.product.name}
                    </span>
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#d1d5db',
                        flexShrink: 0,
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      <Edit2 size={13} strokeWidth={1.8} />
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: '#9ca3af',
                      marginTop: 2,
                      marginBottom: 6,
                    }}
                  >
                    {item.note}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
                      {formatRp(item.product.price)}
                    </span>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => updateQty(item.product.id, 1)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '1.5px solid #d1d5db',
                          background: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#374151',
                          padding: 0,
                        }}
                      >
                        <Plus size={11} strokeWidth={2.5} />
                      </button>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          minWidth: 16,
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, -1)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '1.5px solid #d1d5db',
                          background: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#374151',
                          padding: 0,
                        }}
                      >
                        <Minus size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─ Payment summary ─ */}
        <div
          style={{
            padding: '16px 20px 20px',
            borderTop: '1px solid #f3f4f6',
            flexShrink: 0,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Pembayaran</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row label="Sub Total" value={formatRp(subTotal)} />
            <Row label="Tax (12%)" value={`+${formatRp(tax)}`} valueColor="#059669" />
            <Row label="Diskon" value="Rp0" valueColor="#059669" />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 14,
              paddingTop: 14,
              borderTop: '1px solid #f3f4f6',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>TOTAL</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{formatRp(total)}</span>
          </div>

          {/* Discount link */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
            }}
          >
            <AlertCircle size={16} color="#ef4444" strokeWidth={2} />
            <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>
              Cek Diskon disini!
            </span>
          </button>

          {/* Place order button */}
          <button
            style={{
              width: '100%',
              marginTop: 14,
              padding: '15px',
              background: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1f2937';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#111827';
            }}
          >
            Buat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Row({
  label,
  value,
  valueColor = '#111827',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: valueColor }}>{value}</span>
    </div>
  );
}
