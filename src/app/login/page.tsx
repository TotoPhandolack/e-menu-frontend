'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            if (data.admin.role === 'CASHIER') {
                router.push('/cashier');
            } else {
                router.push('/dashboard');
            }
        } catch {
            toast.error('ອີເມລ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-svh flex items-center justify-center bg-muted/40 px-4 py-12">
            <div className="w-full max-w-sm animate-slideUp">
                <div className="rounded-2xl border bg-background shadow-sm p-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950">
                            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                                <path d="M8 20 Q14 8 20 20" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                                <circle cx="14" cy="10" r="2.2" fill="white" />
                            </svg>
                        </div>
                    </div>

                    <div className="mb-7 text-center">
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">ເຂົ້າສູ່ລະບົບ E-Menu</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email">ອີເມລ</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                autoComplete="email"
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    autoComplete="current-password"
                                    className="h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full h-10 mt-1"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : 'ເຂົ້າສູ່ລະບົບ'}
                        </Button>
                    </div>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        New here?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground/50">
                    Restaurant management system · E-Menu
                </p>
            </div>
        </div>
    );
}
