'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  itemName: string;
  currentNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export function NoteEditDialog({ open, itemName, currentNote, onSave, onClose }: Props) {
  const [note, setNote] = useState(currentNote);

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Note for {itemName}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Label className="text-sm mb-2 block">Special note</Label>
          <Textarea
            placeholder="e.g. No sugar, ice on the side..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
