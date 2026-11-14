import { useState } from 'react';
import type { FormEvent } from 'react';

import { MfaCodeForm } from '@/components/admin/MfaCodeForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAddMfaFactor } from '@/hooks/use-admin-mfa-factors';

interface Props {
  existingNames: string[];
  onDone: () => void;
}

/** Name a backup device, scan its QR, and confirm a code from it (M-026). */
export function MfaAddFactorForm({ existingNames, onDone }: Props) {
  const add = useAddMfaFactor();
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const isDuplicate = existingNames.some(n => n.toLowerCase() === trimmed.toLowerCase());

  function handleStart(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || isDuplicate) return;
    void add.start(trimmed);
  }

  async function handleCode(code: string) {
    const accepted = await add.confirm(code);
    if (accepted) onDone();
    return accepted;
  }

  if (!add.enrolment) {
    return (
      <form onSubmit={handleStart} className="space-y-3 rounded-md border border-border p-4">
        <div>
          <Label htmlFor="mfa-factor-name">Name for this device</Label>
          <Input
            id="mfa-factor-name"
            className="mt-1.5"
            placeholder="For example, Alan's tablet"
            value={name}
            maxLength={40}
            onChange={e => setName(e.target.value)}
          />
          {isDuplicate && (
            <p className="mt-1 text-xs text-destructive">An authenticator already has that name.</p>
          )}
        </div>
        {add.error && <p className="text-sm text-destructive">{add.error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={!trimmed || isDuplicate || add.isPending}>
            {add.isPending ? 'Preparing...' : 'Continue'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <p className="text-sm text-muted-foreground">
        Scan this with the authenticator app on the backup device, then enter the code it shows.
      </p>
      <div className="flex justify-center rounded-md bg-white p-4">
        <img src={add.enrolment.qrCode} alt="QR code for the backup authenticator" className="h-40 w-40" />
      </div>
      <code className="block break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground">
        {add.enrolment.secret}
      </code>
      <MfaCodeForm
        label="Code from the backup device"
        submitLabel="Confirm backup device"
        isPending={add.isPending}
        error={add.error}
        onSubmit={handleCode}
      />
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          add.reset();
          onDone();
        }}
      >
        Cancel
      </Button>
    </div>
  );
}
