import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Props = {
  id: string;
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
};

/** The "you may hold my details to reply" tick box on the enquiry forms. */
export function ConsentField({ id, checked, error, onChange }: Props) {
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="flex items-start gap-2">
        <Checkbox
          id={id}
          checked={checked}
          aria-describedby={error ? errorId : undefined}
          onCheckedChange={(next) => onChange(next === true)}
        />
        <Label htmlFor={id} className="text-sm font-normal leading-relaxed">
          I am happy for Strike Arms to hold these details in order to reply to me.
        </Label>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
