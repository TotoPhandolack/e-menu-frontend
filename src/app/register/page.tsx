'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerAdmin, getRestaurants, type Restaurant } from '@/lib/api';
import { toast } from "react-toastify";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
        <div className="min-h-svh flex items-center justify-center bg-yellow-400 px-4 py-12 ">
            <div className="w-full max-w-md animate-slideUp">
                <div className="relative overflow-hidden rounded-2xl ring-1 ring-foreground/10 bg-background shadow-[-8px_8px_0px_0px_rgba(0,_0,_0,_0.1)]">
                    <div className="flex flex-col justify-center p-8 sm:p-10">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <Image
                                src="/images/user.png"
                                alt="Register"
                                width={100}
                                height={100}
                                priority
                                className="h-20 w-auto rounded-sm object-contain"
                            />
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
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    className="h-11 rounded-xl shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)]"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="cashier@restaurant.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="h-11 rounded-xl shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)]"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Min. 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        className="h-11 rounded-xl shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)] pr-10"
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
                                    <Input
                                        id="confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        className="h-11 rounded-xl shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)] pr-10"
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
                                <Select
                                    value={restaurantId}
                                    onValueChange={setRestaurantId}
                                    disabled={loadingRestaurants}
                                >
                                    <SelectTrigger
                                        id="restaurant"
                                        className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)] data-placeholder:text-muted-foreground"
                                    >
                                        <SelectValue placeholder={loadingRestaurants ? 'Loading restaurants…' : 'Select a restaurant'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {restaurants.map((r) => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={role}
                                    onValueChange={(v) => setRole(v as 'CASHIER' | 'ADMIN')}
                                >
                                    <SelectTrigger
                                        id="role"
                                        className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)]"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASHIER">Cashier</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full h-11 mt-1 rounded-xl bg-yellow-400 text-primary-foreground shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)] hover:bg-yellow-500"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading && <Loader2 size={15} className="animate-spin" />}
                                Create Account
                            </Button>
                        </div>

                        <p className="mt-6 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href="/login"
                                className="font-semibold text-primary-strong underline-offset-4 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-5 text-center text-xs text-muted-foreground/50">
                    Restaurant management system · E-Menu
                </p>
            </div>
        </div>
    );
}
