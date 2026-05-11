"use client";

import { useState } from "react";
import { Users, List, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
  Bill,
  SplitBillEqualResult,
  SplitBillByItemResult,
} from "@/lib/api";

interface Props {
  open: boolean;
  bill: Bill | null;
  onClose: () => void;
  onSplitEqual: (parts: number) => Promise<SplitBillEqualResult | null>;
  onSplitByItem: (
    splits: { label: string; item_ids: string[] }[],
  ) => Promise<SplitBillByItemResult | null>;
}

type Mode = "equal" | "by_item";

function formatRp(n: number | string) {
  return `₭${Number(n).toLocaleString('en-US')}`;
}

export function SplitBillModal({
  open,
  bill,
  onClose,
  onSplitEqual,
  onSplitByItem,
}: Props) {
  const [mode, setMode] = useState<Mode>("equal");
  const [parts, setParts] = useState(2);
  const [equalResult, setEqualResult] = useState<SplitBillEqualResult | null>(
    null,
  );
  const [byItemResult, setByItemResult] =
    useState<SplitBillByItemResult | null>(null);

  // by-item state: each person has a set of item_ids they're paying for
  const [personCount, setPersonCount] = useState(2);
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);

  if (!bill) return null;

  const handleReset = () => {
    setEqualResult(null);
    setByItemResult(null);
    setAssignments({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSplitEqual = async () => {
    setLoading(true);
    const res = await onSplitEqual(parts);
    setLoading(false);
    if (res) setEqualResult(res);
  };

  const handleSplitByItem = async () => {
    const splits: { label: string; item_ids: string[] }[] = Array.from(
      { length: personCount },
      (_, i) => ({
        label: `Person ${i + 1}`,
        item_ids: bill.items
          .filter((item) => assignments[item.id] === String(i))
          .map((item) => item.id),
      }),
    ).filter((s) => s.item_ids.length > 0);

    if (splits.length === 0) return;

    setLoading(true);
    const res = await onSplitByItem(splits);
    setLoading(false);
    if (res) setByItemResult(res);
  };

  const hasResult = equalResult || byItemResult;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Split Bill
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] px-5 py-4 space-y-4">
          {hasResult ? (
            /* ── Results ── */
            <>
              {equalResult && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Total {formatRp(equalResult.total_amount)} split between{" "}
                    {equalResult.splits.length} people
                  </p>
                  {equalResult.splits.map((s) => (
                    <div
                      key={s.label}
                      className="flex justify-between items-center px-3 py-2.5 bg-muted/50 rounded-xl"
                    >
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="text-sm font-bold">
                        {formatRp(s.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {byItemResult && (
                <div className="space-y-3">
                  {byItemResult.splits.map((s) => (
                    <div key={s.label} className="border rounded-xl p-3">
                      <p className="font-semibold text-sm mb-2">{s.label}</p>
                      {s.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between text-[12px] text-muted-foreground"
                        >
                          <span>
                            {item.quantity}× {item.name}
                          </span>
                          <span>{formatRp(item.line_total)}</span>
                        </div>
                      ))}
                      <Separator className="my-1.5" />
                      <div className="flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span>{formatRp(s.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full h-9 text-sm"
                onClick={handleReset}
              >
                Recalculate
              </Button>
            </>
          ) : (
            /* ── Configuration ── */
            <>
              {/* mode toggle */}
              <div className="grid grid-cols-2 gap-2">
                {(["equal", "by_item"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all",
                      mode === m
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30",
                    )}
                  >
                    {m === "equal" ? (
                      <>
                        <Users size={14} strokeWidth={2} /> Equal
                      </>
                    ) : (
                      <>
                        <List size={14} strokeWidth={2} /> By Item
                      </>
                    )}
                  </button>
                ))}
              </div>

              {mode === "equal" ? (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Number of People
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setParts((p) => Math.max(2, p - 1))}
                    >
                      −
                    </Button>
                    <span className="font-bold text-lg w-6 text-center">
                      {parts}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setParts((p) => p + 1)}
                    >
                      +
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      = {formatRp(Math.ceil(bill.total_amount / parts))} /
                      person
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Number of People
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() =>
                          setPersonCount((p) => Math.max(2, p - 1))
                        }
                      >
                        −
                      </Button>
                      <span className="font-bold text-lg w-6 text-center">
                        {personCount}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setPersonCount((p) => p + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Assign each item to a person:
                  </p>
                  <div className="space-y-1.5">
                    {bill.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/30 rounded-lg"
                      >
                        <span className="text-[12px] flex-1 truncate">
                          {item.quantity}× {item.name}
                        </span>
                        <select
                          value={assignments[item.id] ?? ""}
                          onChange={(e) =>
                            setAssignments((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          className="text-[11px] border rounded-md px-2 py-1 bg-background max-w-22.5"
                        >
                          <option value="">— select —</option>
                          {Array.from({ length: personCount }, (_, i) => (
                            <option key={i} value={String(i)}>
                              Person {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!hasResult && (
          <DialogFooter className="px-5 pb-5 pt-3 border-t">
            <Button
              className="w-full h-10 font-bold text-sm"
              onClick={mode === "equal" ? handleSplitEqual : handleSplitByItem}
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate Split"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
