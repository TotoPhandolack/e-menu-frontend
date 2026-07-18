'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/i18n';

interface Props {
  open: boolean;
  itemName: string;
  currentNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export function NoteEditDialog({ open, itemName, currentNote, onSave, onClose }: Props) {
  const t = useTranslations();
  const [note, setNote] = useState(currentNote);

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.cashier.note.title(itemName)}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Label className="text-sm mb-2 block">{t.cashier.note.label}</Label>
          <Textarea
            placeholder={t.cashier.note.placeholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.common.cancel}</Button>
          <Button onClick={handleSave}>{t.common.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
