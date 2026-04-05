// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error('ກະລຸນາໃສ່ອີເມລ ແລະ ລະຫັດຜ່ານ');
            return;
        }
        setLoading(true);
        try {
            const { data } = await login(email, password);
            setAuth(data.access_token, data.admin);
            toast.success(`ຍິນດີຕ້ອນຮັບ ${data.admin.name}!`);
            router.push('/dashboard');
        } catch {
            toast.error('ອີເມລ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-sm space-y-6">
                {/* Logo / Title */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-semibold text-slate-900">E-Menu</h1>
                    <p className="text-sm text-slate-500">ເຂົ້າສູ່ລະບົບສຳລັບຜູ້ດູແລ</p>
                </div>

                {/* Form */}
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">ອີເມລ</label>
                        <Input
                            type="email"
                            placeholder="admin@restaurant.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">ລະຫັດຜ່ານ</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
                </Button>
            </div>
        </div>
    );
}