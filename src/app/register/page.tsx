'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerAdmin, getRestaurants, type Restaurant } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Store,
    ShieldCheck,
    ChevronDown,
    ArrowLeft,
    Loader2,
} from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [restaurantId, setRestaurantId] = useState('');
    const [role, setRole] = useState<'CASHIER' | 'ADMIN'>('CASHIER');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);

    useEffect(() => {
        getRestaurants()
            .then(({ data }) => setRestaurants(data))
            .catch(() => toast.error('Failed to load restaurants'))
            .finally(() => setLoadingRestaurants(false));
    }, []);

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !password || !restaurantId) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await registerAdmin({ name, email, password, restaurant_id: restaurantId, role });
            toast.success('Account created! You can now log in.');
            router.push('/login');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message ?? 'Registration failed');
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
                        <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            Register a cashier or admin for your restaurant
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    className="h-10 pl-9"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="cashier@restaurant.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="h-10 pl-9"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="h-10 pl-9 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Toggle password"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="confirm">Confirm Password</Label>
                            <div className="relative">
                                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                <Input
                                    id="confirm"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="h-10 pl-9 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Toggle confirm password"
                                >
                                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Restaurant */}
                        <div className="space-y-1.5">
                            <Label htmlFor="restaurant">Restaurant</Label>
                            <div className="relative">
                                <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                                <select
                                    id="restaurant"
                                    value={restaurantId}
                                    onChange={(e) => setRestaurantId(e.target.value)}
                                    disabled={loadingRestaurants}
                                    className="h-10 w-full appearance-none rounded-lg border border-input bg-transparent pl-9 pr-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                                >
                                    <option value="">
                                        {loadingRestaurants ? 'Loading restaurants…' : 'Select a restaurant'}
                                    </option>
                                    {restaurants.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label htmlFor="role">Role</Label>
                            <div className="relative">
                                <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'CASHIER' | 'ADMIN')}
                                    className="h-10 w-full appearance-none rounded-lg border border-input bg-transparent pl-9 pr-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground"
                                >
                                    <option value="CASHIER">Cashier</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        <Button
                            className="w-full h-10"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Create Account'}
                        </Button>
                    </div>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <button
                            onClick={() => router.push('/login')}
                            className="font-semibold text-primary underline-offset-4 hover:underline"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                <button
                    onClick={() => router.push('/login')}
                    className="mt-4 mx-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={14} />
                    Back to Login
                </button>
            </div>
        </div>
    );
}
