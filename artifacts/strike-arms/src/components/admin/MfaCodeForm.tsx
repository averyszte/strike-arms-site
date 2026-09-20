import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const SLOTS = [0, 1, 2, 3, 4, 5];

interface Props {
  label: string;
  submitLabel: string;
  isPending: boolean;
  error: string | null;
  /** Returns false when the code was rejected, so the field can be cleared. */
  onSubmit: (code: string) => Promise<boolean>;
}

export function MfaCodeForm({ label, submitLabel, isPending, error, onSubmit }: Props) {
  const [code, setCode] = useState('');

  async function submit(value: string) {
    if (isPending || value.length !== 6) return;
    const accepted = await onSubmit(value);
    if (!accepted) setCode('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void submit(code);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <InputOTP
          maxLength={6}
          pattern="^\d*$"
          value={code}
          onChange={setCode}
          onComplete={value => void submit(value)}
          disabled={isPending}
          autoFocus
        >
          <InputOTPGroup>
            {SLOTS.map(i => (
              <InputOTPSlot key={i} index={i} className="h-11 w-11 text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isPending || code.length !== 6}>
        {isPending ? 'Checking…' : submitLabel}
      </Button>
    </form>
  );
}
