"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { toast } from "react-toastify";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { clearTokenCache } from "@/lib/api";
import { LanguageSwitcher } from "@/components/languageSwitcher";
import { useLangStore, type LangCode } from "@/stores/langStore";

const T: Record<
  LangCode,
  {
    welcomeBack: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    newHere: string;
    createAccount: string;
    errorEmpty: string;
    errorInvalid: string;
    welcome: (name: string) => string;
  }
> = {
  en: {
    welcomeBack: "Welcome back",
    subtitle: "Sign in to E-Menu",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    newHere: "New here?",
    createAccount: "Create an account",
    errorEmpty: "Please enter your email and password",
    errorInvalid: "Invalid email or password",
    welcome: (name) => `Welcome back, ${name}!`,
  },
  lo: {
    welcomeBack: "ຍິນດີຕ້ອນຮັບກັບມາ",
    subtitle: "ເຂົ້າສູ່ລະບົບ E-Menu",
    email: "ອີເມລ",
    password: "ລະຫັດຜ່ານ",
    submit: "ເຂົ້າສູ່ລະບົບ",
    newHere: "ຍັງບໍ່ມີບັນຊີ?",
    createAccount: "ສ້າງບັນຊີໃໝ່",
    errorEmpty: "ກະລຸນາໃສ່ອີເມລ ແລະ ລະຫັດຜ່ານ",
    errorInvalid: "ອີເມລ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ",
    welcome: (name) => `ຍິນດີຕ້ອນຮັບ ${name}!`,
  },
  th: {
    welcomeBack: "ยินดีต้อนรับกลับ",
    subtitle: "เข้าสู่ระบบ E-Menu",
    email: "อีเมล",
    password: "รหัสผ่าน",
    submit: "เข้าสู่ระบบ",
    newHere: "ยังไม่มีบัญชี?",
    createAccount: "สร้างบัญชีใหม่",
    errorEmpty: "กรุณากรอกอีเมลและรหัสผ่าน",
    errorInvalid: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    welcome: (name) => `ยินดีต้อนรับ ${name}!`,
  },
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const lang = useLangStore((s) => s.lang) as LangCode;
  const t = T[lang];

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error(t.errorEmpty);
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        toast.error(t.errorInvalid);
        return;
      }
      clearTokenCache(); // drop any stale token so the new session is used immediately
      const session = await getSession();
      toast.success(t.welcome(session?.admin?.name ?? ""));
      if (session?.admin?.role === "CASHIER") {
        router.push("/cashier");
      } else {
        router.push("/dashboard");
      }
    } catch {
      toast.error(t.errorInvalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex items-center justify-center bg-yellow-400 px-4 py-12 ">
      <div className="w-full max-w-4xl animate-slideUp">
        <div className="relative grid overflow-hidden rounded-2xl ring-1 ring-foreground/10 bg-background md:grid-cols-2 shadow-[-8px_8px_0px_0px_rgba(0,_0,_0,_0.1)]">
          {/* Language switcher */}
          <LanguageSwitcher className="absolute right-3 top-3 z-20" />

          {/* Left — image */}
          <div className="hidden p-2 md:block">
            <div className="relative min-h-140 overflow-hidden rounded-2xl">
              <Image
                src="/images/customer.png"
                alt="E-Menu"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 0px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right — login form */}
          <div className="flex flex-col justify-center p-8 sm:p-10">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/logo.png"
                alt="E-Menu"
                width={100}
                height={100}
                priority
                className="h-20 w-auto rounded-sm object-contain"
              />
            </div>

            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {t.welcomeBack}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t.subtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoComplete="email"
                  className="h-11 rounded-xl shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    autoComplete="current-password"
                    className="h-11 rounded-xl shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)] pr-10"
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
                className="w-full h-11 mt-1 rounded-xl bg-yellow-400 text-primary-foreground shadow-[-6px_8px_0px_-2px_rgba(0,_0,_0,_0.1)] hover:bg-yellow-500"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {t.submit}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t.newHere}{" "}
              <Link
                href="/register"
                className="font-semibold text-primary-strong underline-offset-4 hover:underline"
              >
                {t.createAccount}
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
