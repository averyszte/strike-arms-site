import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductImportPreview } from '@/components/admin/ProductImportPreview';
import { useProductImport } from '@/hooks/use-product-import';
import { useToast } from '@/hooks/use-toast';
import { planIsEmpty, planProductImport, type ImportPlan } from '@/lib/product-import';
import type { ImportOutcome } from '@/types/product-import';
import type { Product } from '@/types/product';

/**
 * Read the file, show what it would do, and only then write anything.
 *
 * Nothing is sent to the database until the preview has been shown and the
 * button under it has been pressed. If the write is partial -- there is no
 * transaction across PostgREST -- the failures are listed by slug rather than
 * summarised, because "3 rows failed" is not something anyone can act on.
 */

/** Big enough for a catalogue several times over; small enough not to hang the tab. */
const MAX_BYTES = 4 * 1024 * 1024;

interface Props {
  open: boolean;
  products: Product[];
  onClose: () => void;
}

export function ProductImportDialog({ open, products, onClose }: Props) {
  const [fileName, setFileName] = useState('');
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [readError, setReadError] = useState('');
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const importProducts = useProductImport();
  const { toast } = useToast();

  function reset() {
    setFileName('');
    setPlan(null);
    setReadError('');
    setOutcome(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File | undefined) {
    setPlan(null);
    setOutcome(null);
    setReadError('');
    if (!file) return;
    setFileName(file.name);
    if (file.size > MAX_BYTES) {
      setReadError('That file is too big to preview here. Split it into smaller files.');
      return;
    }
    try {
      setPlan(planProductImport(await file.text(), products));
    } catch {
      setReadError('That file could not be read.');
    }
  }

  async function handleConfirm() {
    if (!plan) return;
    try {
      const result = await importProducts.mutateAsync(plan);
      setOutcome(result);
      setPlan(null);
      toast({
        title: `${result.created} created, ${result.updated} updated`,
        description: result.failures.length > 0 ? 'Some rows were refused.' : undefined,
        variant: result.failures.length > 0 ? 'destructive' : undefined,
      });
    } catch (error) {
      toast({
        title: 'The import stopped',
        description: error instanceof Error ? error.message : 'Nothing further was written.',
        variant: 'destructive',
      });
    }
  }

  const canConfirm = plan !== null && !plan.fatal && !planIsEmpty(plan);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import products from CSV</DialogTitle>
          <DialogDescription>
            Export first, edit the file, then upload it here. Rows are matched on Slug. Only the
            columns present in the file are written, so a file of just Slug and Price changes prices
            and nothing else. Stock is never imported &mdash; use Adjust stock, so the inventory
            history records who changed it and why.
          </DialogDescription>
        </DialogHeader>

        {!outcome && (
          <div className="space-y-1.5">
            <Input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
            {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
          </div>
        )}

        {readError && <p className="text-sm text-destructive">{readError}</p>}

        {plan && <ProductImportPreview plan={plan} />}

        {outcome && (
          <div className="space-y-3">
            <p className="text-sm text-foreground">
              {outcome.created} created, {outcome.updated} updated.
            </p>
            {outcome.failures.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
                  Refused by the database
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {outcome.failures.map((failure) => (
                    <li key={failure.slug}>
                      <span className="font-mono text-foreground">{failure.slug}</span> &mdash;{' '}
                      {failure.message}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Everything else was written. Fixing those rows and uploading the same file again
                  is safe.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {outcome ? 'Close' : 'Cancel'}
          </Button>
          {!outcome && (
            <Button
              onClick={() => void handleConfirm()}
              disabled={!canConfirm || importProducts.isPending}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              {importProducts.isPending ? 'Importing...' : 'Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
