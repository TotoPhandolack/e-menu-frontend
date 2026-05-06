// src/app/cashier/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Order, getCashierOrders, payOrder, getRestaurants, Restaurant } from '@/lib/api';
import { toast } from 'sonner';

// ---- helpers ----
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('lo-LA', {
        style: 'currency',
        currency: 'LAK',
        minimumFractionDigits: 0,
    }).format(amount);
}

function timeAgo(date: string | number | Date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ຫາກໍສັ່ງ';
    if (mins < 60) return `${mins} ນາທີກ່ອນ`;
    const hrs = Math.floor(mins / 60);
    return `${hrs} ຊົ່ວໂມງກ່ອນ`;
}

// ---- Order Card ----
function OrderCard({
    order,
    onPay,
    paying,
}: {
    order: Order;
    onPay: (id: string) => void;
    paying: boolean;
}) {
    const table = order.table as { table_number: string } | null | undefined;

    return (
        <div className="order-card">
            <div className="order-card-header">
                <div className="table-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="2" y="7" width="20" height="15" rx="2" />
                        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                    ໂຕະ {table?.table_number ?? '—'}
                </div>
                <span className="order-time">{timeAgo(order.created_at)}</span>
            </div>

            <div className="order-items">
                {order.orderItems.map((item) => (
                    <div key={item.id} className="order-item-row">
                        <span className="item-qty">×{item.quantity}</span>
                        <span className="item-name">{item.menuItem.name}</span>
                        <span className="item-subtotal">
                            {formatCurrency(item.quantity * item.unit_price)}
                        </span>
                    </div>
                ))}
            </div>

            {order.orderItems.some((i) => i.special_note) && (
                <div className="special-notes">
                    {order.orderItems
                        .filter((i) => i.special_note)
                        .map((i) => (
                            <span key={i.id} className="note-chip">
                                💬 {i.menuItem.name}: {i.special_note}
                            </span>
                        ))}
                </div>
            )}

            <div className="order-card-footer">
                <div className="total-section">
                    <span className="total-label">ລວມທັງໝົດ</span>
                    <span className="total-amount">{formatCurrency(Number(order.total_amount))}</span>
                </div>
                <button
                    className={`pay-btn${paying ? ' paying' : ''}`}
                    onClick={() => onPay(order.id)}
                    disabled={paying}
                    id={`pay-btn-${order.id}`}
                >
                    {paying ? (
                        <span className="btn-spinner" />
                    ) : (
                        <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="1" y="4" width="22" height="16" rx="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            ຮັບເງິນ
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ---- Main Page ----
export default function CashierPage() {
    const { admin, logout } = useAuthStore();
    const router = useRouter();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [paidCount, setPaidCount] = useState(0);

    // Guard: only cashier/admin can access
    useEffect(() => {
        if (!admin) router.push('/login');
    }, [admin, router]);

    // Load restaurants
    useEffect(() => {
        getRestaurants().then(({ data }) => {
            setRestaurants(data);
            if (data.length > 0) setSelectedRestaurant(data[0].id);
        });
    }, []);

    // Load served orders
    const fetchOrders = useCallback(() => {
        if (!selectedRestaurant) return;
        setLoading(true);
        getCashierOrders(selectedRestaurant)
            .then(({ data }) => setOrders(data))
            .catch(() => toast.error('ໂຫຼດ orders ບໍ່ສຳເລັດ'))
            .finally(() => setLoading(false));
    }, [selectedRestaurant]);

    useEffect(() => {
        fetchOrders();
        // Poll every 15 seconds for new SERVED orders
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handlePay = async (order_id: string) => {
        setPayingId(order_id);
        try {
            await payOrder(order_id);
            setOrders((prev) => prev.filter((o) => o.id !== order_id));
            setPaidCount((c) => c + 1);
            toast.success('ຮັບເງິນສຳເລັດ ✓');
        } catch {
            toast.error('ຮັບເງິນບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່');
        } finally {
            setPayingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const totalPending = orders.reduce(
        (sum, o) => sum + Number(o.total_amount),
        0,
    );

    return (
        <div className="cashier-root">
            {/* ── Header ── */}
            <header className="cashier-header">
                <div className="header-brand">
                    <div className="header-logo">
                        <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                            <rect width="28" height="28" rx="7" fill="white" fillOpacity="0.2" />
                            <path d="M8 20 Q14 8 20 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                            <circle cx="14" cy="10" r="2" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="header-title">Cashier</h1>
                        <p className="header-sub">ໜ້າຮັບເງິນ</p>
                    </div>
                </div>

                <div className="header-controls">
                    <select
                        className="restaurant-select"
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        id="restaurant-select"
                    >
                        {restaurants.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>

                    <div className="cashier-name">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        {admin?.name}
                    </div>

                    <button className="logout-btn" onClick={handleLogout} id="cashier-logout-btn">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        ອອກ
                    </button>
                </div>
            </header>

            {/* ── Stats Bar ── */}
            <div className="stats-bar">
                <div className="stat-card">
                    <span className="stat-icon">🧾</span>
                    <div>
                        <p className="stat-value">{orders.length}</p>
                        <p className="stat-label">ລໍຖ້າຊຳລະ</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💰</span>
                    <div>
                        <p className="stat-value">{formatCurrency(totalPending)}</p>
                        <p className="stat-label">ຍອດຄ້າງຊຳລະ</p>
                    </div>
                </div>
                <div className="stat-card stat-card-success">
                    <span className="stat-icon">✅</span>
                    <div>
                        <p className="stat-value">{paidCount}</p>
                        <p className="stat-label">ຊຳລະແລ້ວ (session)</p>
                    </div>
                </div>
            </div>

            {/* ── Orders Grid ── */}
            <main className="cashier-main">
                {loading ? (
                    <div className="empty-state">
                        <div className="loading-ring" />
                        <p>ກຳລັງໂຫຼດ...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🍽️</div>
                        <h2>ບໍ່ມີ order ລໍຖ້າຊຳລະ</h2>
                        <p>ລູກຄ້າຍັງບໍ່ໄດ້ຮ້ອງຂໍ bill</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onPay={handlePay}
                                paying={payingId === order.id}
                            />
                        ))}
                    </div>
                )}
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .cashier-root {
                    min-height: 100vh;
                    background: #f4f7f4;
                    font-family: 'Inter', sans-serif;
                    color: #1a2e1d;
                    display: flex;
                    flex-direction: column;
                }

                /* ── Header ── */
                .cashier-header {
                    background: linear-gradient(135deg, #3a5a40 0%, #2c4430 100%);
                    color: white;
                    padding: 0 1.5rem;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 2px 12px rgba(42,64,48,0.3);
                    position: sticky;
                    top: 0;
                    z-index: 40;
                }
                .header-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .header-logo {
                    width: 38px;
                    height: 38px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .header-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    line-height: 1;
                }
                .header-sub {
                    font-size: 0.75rem;
                    opacity: 0.65;
                    margin-top: 0.1rem;
                }
                .header-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .restaurant-select {
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.25);
                    color: white;
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.625rem;
                    font-size: 0.8125rem;
                    font-family: inherit;
                    outline: none;
                    cursor: pointer;
                }
                .restaurant-select option { color: #1a2e1d; background: white; }
                .cashier-name {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    font-size: 0.8125rem;
                    opacity: 0.85;
                }
                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.25);
                    color: white;
                    padding: 0.375rem 0.75rem;
                    border-radius: 0.625rem;
                    font-size: 0.8125rem;
                    font-family: inherit;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .logout-btn:hover { background: rgba(255,255,255,0.25); }

                /* ── Stats ── */
                .stats-bar {
                    display: flex;
                    gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    background: white;
                    border-bottom: 1px solid #e5ede7;
                    flex-wrap: wrap;
                }
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    background: #f4f7f4;
                    border: 1px solid #e0ebe2;
                    border-radius: 1rem;
                    padding: 0.875rem 1.25rem;
                    flex: 1;
                    min-width: 160px;
                }
                .stat-card-success {
                    background: #f0f8f1;
                    border-color: #b8dbbe;
                }
                .stat-icon { font-size: 1.5rem; }
                .stat-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1a2e1d;
                    line-height: 1;
                }
                .stat-label {
                    font-size: 0.75rem;
                    color: #6a8a6f;
                    margin-top: 0.2rem;
                }

                /* ── Main ── */
                .cashier-main {
                    flex: 1;
                    padding: 1.5rem;
                }

                /* ── Grid ── */
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1.25rem;
                }

                /* ── Order Card ── */
                .order-card {
                    background: white;
                    border: 1px solid #e0ebe2;
                    border-radius: 1.25rem;
                    padding: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    box-shadow: 0 2px 8px rgba(42,64,48,0.06);
                    transition: transform 0.2s, box-shadow 0.2s;
                    animation: cardIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes cardIn {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .order-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(42,64,48,0.1);
                }

                .order-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .table-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                    background: #3a5a40;
                    color: white;
                    font-size: 0.8125rem;
                    font-weight: 600;
                    padding: 0.3125rem 0.75rem;
                    border-radius: 100px;
                }
                .order-time {
                    font-size: 0.75rem;
                    color: #8aaa8e;
                }

                /* Items list */
                .order-items {
                    display: flex;
                    flex-direction: column;
                    gap: 0.375rem;
                    border-top: 1px solid #f0f4f1;
                    border-bottom: 1px solid #f0f4f1;
                    padding: 0.625rem 0;
                }
                .order-item-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }
                .item-qty {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: white;
                    background: #b8d4ba;
                    border-radius: 4px;
                    padding: 0.1rem 0.375rem;
                    min-width: 28px;
                    text-align: center;
                }
                .item-name {
                    flex: 1;
                    color: #2a3e2d;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .item-subtotal {
                    font-size: 0.8125rem;
                    color: #5a7a5f;
                    font-weight: 500;
                    white-space: nowrap;
                }

                /* Special notes */
                .special-notes {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .note-chip {
                    font-size: 0.75rem;
                    color: #6a7a4a;
                    background: #f5f8e8;
                    border: 1px solid #dde8b0;
                    border-radius: 0.5rem;
                    padding: 0.25rem 0.625rem;
                }

                /* Footer */
                .order-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.75rem;
                }
                .total-section {
                    display: flex;
                    flex-direction: column;
                }
                .total-label {
                    font-size: 0.7rem;
                    color: #8aaa8e;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .total-amount {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #1a2e1d;
                }

                .pay-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: linear-gradient(135deg, #3a5a40 0%, #2c4430 100%);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    padding: 0.625rem 1.125rem;
                    font-size: 0.875rem;
                    font-weight: 600;
                    font-family: inherit;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
                    box-shadow: 0 3px 10px rgba(58,90,64,0.35);
                    white-space: nowrap;
                }
                .pay-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 5px 14px rgba(58,90,64,0.4);
                }
                .pay-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-spinner {
                    width: 15px;
                    height: 15px;
                    border: 2px solid rgba(255,255,255,0.35);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    display: inline-block;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* Empty / loading */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 4rem 2rem;
                    color: #6a8a6f;
                    text-align: center;
                }
                .empty-icon { font-size: 3.5rem; }
                .empty-state h2 { font-size: 1.125rem; font-weight: 600; color: #2c4430; }
                .empty-state p { font-size: 0.875rem; }

                .loading-ring {
                    width: 44px;
                    height: 44px;
                    border: 3px solid #d4e8d6;
                    border-top-color: #3a5a40;
                    border-radius: 50%;
                    animation: spin 0.9s linear infinite;
                }

                @media (max-width: 640px) {
                    .cashier-header { padding: 0 1rem; }
                    .stats-bar { padding: 1rem; }
                    .cashier-main { padding: 1rem; }
                    .cashier-name { display: none; }
                }
            `}</style>
        </div>
    );
}
