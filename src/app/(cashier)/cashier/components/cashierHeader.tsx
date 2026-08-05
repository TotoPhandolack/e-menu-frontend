// src/app/(cashier)/cashier/components/cashierHeader.tsx
"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "./notificationBell";
import { LanguageSwitcher } from "@/components/languageSwitcher";
import { useTranslations } from "@/lib/i18n";
import type { Admin, Order } from "@/lib/api";
import { resolveImageUrl } from "@/lib/api";

interface Props {
  admin: Admin | null;
  initials: string;
  pendingOrders: Order[];
  fetchLiveOrders: () => void;
  onProfileClick: () => void;
  onGoToLiveOrders: (order: Order) => void;
}

export function CashierHeader({ admin, initials, pendingOrders, fetchLiveOrders, onProfileClick, onGoToLiveOrders }: Props) {
  const t = useTranslations();
  const logoUrl = resolveImageUrl(admin?.restaurant?.logo_url);

  return (
    <div className="bg-background border-b px-4 md:px-7 py-3 md:py-3.5 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 shrink-0">
      {/* Row 1 (mobile) / Left (desktop): user info + notifications */}
      <div className="flex items-center justify-between md:justify-start gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onProfileClick}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            title={t.cashier.header.restaurantSettings}
          >
            <Avatar className="h-9 w-9 md:h-11 md:w-11 ring-2 ring-primary/20 hover:ring-primary/60 transition-all cursor-pointer">
              {logoUrl ? (
                <AvatarImage src={logoUrl} alt="Restaurant logo" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
          <div>
            <p className="font-bold text-sm leading-tight">
              {admin?.name ?? t.cashier.header.cashierFallback}
            </p>
            <p className="text-xs text-muted-foreground">
              {admin?.restaurant?.name ?? ""}
            </p>
          </div>
          <NotificationBell
            pendingOrders={pendingOrders}
            onRefresh={fetchLiveOrders}
            onOrderClick={onGoToLiveOrders}
          />
        </div>

        {/* Sign out now lives in the restaurant profile dialog (avatar → Profile) */}
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher align="right" />
        </div>
      </div>

      {/* Row 2 (mobile) / Center (desktop): navigation tabs */}
      <div className="flex-1 flex justify-center">
        <TabsList className="h-9 bg-muted/50 w-full md:w-auto">
          <TabsTrigger
            value="order"
            className="flex-1 md:flex-none text-sm font-semibold md:px-6"
          >
            {t.cashier.header.tabOrder}
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="relative flex-1 md:flex-none text-sm font-semibold md:px-6"
          >
            {t.cashier.header.tabActivity}
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex">
                <span className="absolute inset-0 rounded-full bg-destructive opacity-75 animate-ping" />
                <span className="relative bg-destructive text-white text-[9px] font-bold min-w-4 h-4 rounded-full flex items-center justify-center px-1 leading-none">
                  {pendingOrders.length}
                </span>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="flex-1 md:flex-none text-sm font-semibold md:px-6"
          >
            {t.cashier.header.tabManage}
          </TabsTrigger>
        </TabsList>
      </div>
    </div>
  );
}
