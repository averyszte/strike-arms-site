/**
 * Hidden from people and from screen readers, but not with `display: none` —
 * some bots skip what is displayed none. It is moved off-screen instead, taken
 * out of the tab order, and told not to autofill, so a password manager cannot
 * fill it in on a real customer's behalf and get them silently dropped.
 *
 * The id is passed in because two forms on one page with the same input id is
 * a broken label, and a broken label is what a screen reader reads out.
 */
export function HoneypotField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name="website"
        type="text"
        value={value}
        tabIndex={-1}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
