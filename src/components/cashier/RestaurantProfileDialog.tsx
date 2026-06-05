"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Camera,
  Plus,
  Trash2,
  Loader2,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import type { Admin, TeamMember } from "@/lib/api";
import {
  uploadRestaurantLogo,
  updateRestaurantProfile,
  cashierGetTeam,
  cashierAddTeamMember,
  cashierRemoveTeamMember,
  resolveImageUrl,
} from "@/lib/api";

// ─── Theme presets ───────────────────────────────────────────────────────────

interface ThemePreset {
  key: string;
  label: string;
  primary: string;
  primaryForeground: string;
  ring: string;
  dot: string; // display color for the swatch
}

const THEME_PRESETS: ThemePreset[] = [
  {
    key: "default",
    label: "Default",
    primary: "oklch(0.205 0 0)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.708 0 0)",
    dot: "#1a1a1a",
  },
  {
    key: "blue",
    label: "Blue",
    primary: "oklch(0.546 0.245 264)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.546 0.245 264)",
    dot: "#3b82f6",
  },
  {
    key: "green",
    label: "Green",
    primary: "oklch(0.527 0.154 150)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.527 0.154 150)",
    dot: "#22c55e",
  },
  {
    key: "orange",
    label: "Orange",
    primary: "oklch(0.65 0.2 55)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.65 0.2 55)",
    dot: "#f97316",
  },
  {
    key: "purple",
    label: "Purple",
    primary: "oklch(0.491 0.27 292)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.491 0.27 292)",
    dot: "#a855f7",
  },
  {
    key: "rose",
    label: "Rose",
    primary: "oklch(0.59 0.24 15)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.59 0.24 15)",
    dot: "#f43f5e",
  },
  {
    key: "teal",
    label: "Teal",
    primary: "oklch(0.55 0.15 195)",
    primaryForeground: "oklch(0.985 0 0)",
    ring: "oklch(0.55 0.15 195)",
    dot: "#14b8a6",
  },
  {
    key: "amber",
    label: "Amber",
    primary: "oklch(0.68 0.18 75)",
    primaryForeground: "oklch(0.2 0 0)",
    ring: "oklch(0.68 0.18 75)",
    dot: "#f59e0b",
  },
];

export function applyTheme(themeKey: string) {
  const preset =
    THEME_PRESETS.find((p) => p.key === themeKey) ?? THEME_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--primary-foreground", preset.primaryForeground);
  root.style.setProperty("--ring", preset.ring);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  admin: Admin | null;
  onProfileUpdated: (updates: {
    logo_url?: string;
    theme_color?: string;
    name?: string;
  }) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RestaurantProfileDialog({
  open,
  onOpenChange,
  admin,
  onProfileUpdated,
}: Props) {
  const restaurantId = admin?.restaurant_id ?? "";
  const [tab, setTab] = useState("profile");

  // Profile tab state
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    resolveImageUrl(admin?.restaurant?.logo_url),
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [restaurantName, setRestaurantName] = useState(
    admin?.restaurant?.name ?? "",
  );
  const [savingName, setSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Team tab state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamFetched, setTeamFetched] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"CASHIER" | "ADMIN">("CASHIER");
  const [showPassword, setShowPassword] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // Theme tab state
  const [selectedTheme, setSelectedTheme] = useState(
    admin?.restaurant?.theme_color ?? "default",
  );
  const [savingTheme, setSavingTheme] = useState(false);

  // Sync logo/name when admin prop changes (e.g. after re-fetch)
  useEffect(() => {
    setLogoPreview(resolveImageUrl(admin?.restaurant?.logo_url));
    setRestaurantName(admin?.restaurant?.name ?? "");
    setSelectedTheme(admin?.restaurant?.theme_color ?? "default");
  }, [admin]);

  // Load team when tab becomes active
  useEffect(() => {
    if (tab === "team" && !teamFetched) {
      setTeamLoading(true);
      cashierGetTeam()
        .then((res) => setTeam(res.data))
        .catch(() => toast.error("Failed to load team"))
        .finally(() => {
          setTeamLoading(false);
          setTeamFetched(true);
        });
    }
  }, [tab, teamFetched]);

  // ─── Logo upload ────────────────────────────────────────────────────────────

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const res = await uploadRestaurantLogo(restaurantId, file);
      const newUrl = resolveImageUrl(res.data.logo_url);
      setLogoPreview(newUrl);
      onProfileUpdated({ logo_url: res.data.logo_url ?? undefined });
      toast.success("Logo updated");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ─── Save restaurant name ────────────────────────────────────────────────────

  async function handleSaveName() {
    if (!restaurantName.trim()) return;
    setSavingName(true);
    try {
      await updateRestaurantProfile(restaurantId, {
        name: restaurantName.trim(),
      });
      onProfileUpdated({ name: restaurantName.trim() });
      toast.success("Restaurant name updated");
    } catch {
      toast.error("Failed to update name");
    } finally {
      setSavingName(false);
    }
  }

  // ─── Team actions ─────────────────────────────────────────────────────────

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;
    setAddingMember(true);
    try {
      const res = await cashierAddTeamMember({
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      });
      setTeam((prev) => [...prev, res.data]);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      toast.success(`${res.data.name} added to team`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Failed to add team member");
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(member: TeamMember) {
    try {
      await cashierRemoveTeamMember(member.id);
      setTeam((prev) => prev.filter((m) => m.id !== member.id));
      toast.success(`${member.name} removed`);
    } catch {
      toast.error("Failed to remove member");
    }
  }

  // ─── Theme save ──────────────────────────────────────────────────────────

  async function handleSaveTheme() {
    setSavingTheme(true);
    try {
      await updateRestaurantProfile(restaurantId, {
        theme_color: selectedTheme,
      });
      applyTheme(selectedTheme);
      onProfileUpdated({ theme_color: selectedTheme });
      toast.success("Theme saved");
    } catch {
      toast.error("Failed to save theme");
    } finally {
      setSavingTheme(false);
    }
  }

  const restaurantInitials = (admin?.restaurant?.name ?? "R")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-base font-bold">
            Restaurant Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex flex-col">
          <div className="px-6 pt-3">
            <TabsList className="h-8 w-full bg-muted/40">
              <TabsTrigger
                value="profile"
                className="flex-1 text-xs font-semibold"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="flex-1 text-xs font-semibold"
              >
                Team
              </TabsTrigger>
              <TabsTrigger
                value="theme"
                className="flex-1 text-xs font-semibold"
              >
                Theme
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ─── Profile Tab ──────────────────────────────────────────── */}
          <TabsContent value="profile" className="px-6 py-5 space-y-5 mt-0">
            {/* Logo upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                  {logoPreview ? (
                    <AvatarImage
                      src={logoPreview}
                      alt="Restaurant logo"
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {restaurantInitials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingLogo ? (
                    <Loader2 size={18} className="text-white animate-spin" />
                  ) : (
                    <Camera size={18} className="text-white" />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <p className="text-xs text-muted-foreground">
                Click logo to upload (max 5 MB)
              </p>
            </div>

            {/* Restaurant name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Restaurant Name</Label>
              <div className="flex gap-2">
                <Input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Restaurant name"
                  className="h-9 text-sm"
                />
                <Button
                  size="sm"
                  disabled={savingName || !restaurantName.trim()}
                  onClick={handleSaveName}
                  className="h-9 px-4 shrink-0"
                >
                  {savingName ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>

            {/* Current cashier info (read-only) */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1 text-sm">
              <p className="text-xs text-muted-foreground font-medium">
                Your Account
              </p>
              <p className="font-semibold">{admin?.name}</p>
              <p className="text-muted-foreground text-xs">{admin?.email}</p>
              <Badge variant="secondary" className="text-[10px] mt-1">
                {admin?.role}
              </Badge>
            </div>
          </TabsContent>

          {/* ─── Team Tab ─────────────────────────────────────────────── */}
          <TabsContent value="team" className="mt-0">
            <div className="px-6 pt-4 pb-5 space-y-4">
              {/* Member list */}
              <div className="space-y-1 max-h-44 overflow-y-auto">
                {teamLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2
                      size={20}
                      className="animate-spin text-muted-foreground"
                    />
                  </div>
                ) : team.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No team members yet.
                  </p>
                ) : (
                  team.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {m.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {m.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[10px]">
                          {m.role}
                        </Badge>
                        {m.id !== admin?.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Remove {m.name}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this account and
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleRemoveMember(m)}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add member form */}
              <div className="border-t pt-4">
                <p className="text-xs font-semibold mb-3 flex items-center gap-1.5">
                  <Plus size={12} />
                  Add New Member
                </p>
                <form onSubmit={handleAddMember} className="space-y-2">
                  <Input
                    placeholder="Full name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 text-sm"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-8 text-sm"
                    required
                  />
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-8 text-sm pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={newRole}
                      onChange={(e) =>
                        setNewRole(e.target.value as "CASHIER" | "ADMIN")
                      }
                      className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="CASHIER">Cashier</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-8 px-4"
                      disabled={
                        addingMember || !newName || !newEmail || !newPassword
                      }
                    >
                      {addingMember ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* ─── Theme Tab ────────────────────────────────────────────── */}
          <TabsContent value="theme" className="px-6 pt-4 pb-5 mt-0 space-y-4">
            <p className="text-xs text-muted-foreground">
              Choose a primary color for your cashier interface.
            </p>
            <div className="grid grid-cols-4 gap-3">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setSelectedTheme(preset.key)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="h-10 w-10 rounded-full ring-2 ring-offset-2 transition-all flex items-center justify-center"
                    style={{
                      backgroundColor: preset.dot,
                      outline:
                        selectedTheme === preset.key
                          ? `2px solid ${preset.dot}`
                          : "2px solid transparent",
                      outlineOffset: "2px",
                    }}
                  >
                    {selectedTheme === preset.key && (
                      <Check
                        size={16}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <Button
              onClick={handleSaveTheme}
              disabled={savingTheme}
              className="w-full h-9"
            >
              {savingTheme ? (
                <Loader2 size={14} className="animate-spin mr-2" />
              ) : null}
              Save Theme
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
