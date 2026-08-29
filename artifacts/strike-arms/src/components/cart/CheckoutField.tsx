import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CheckoutFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function CheckoutField({
  id,
  label,
  value,
  error,
  type = 'text',
  autoComplete,
  required = false,
  onChange,
}: CheckoutFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5"
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
