/** Campo de formulário no visual de terminal antigo. */
export function Field({
  id,
  label,
  error,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-left">
      <label
        htmlFor={id}
        className="font-mono text-ash text-[0.65rem] tracking-[0.3em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : hint ? `${id}-dica` : undefined}
        className={`bg-void/70 text-bone placeholder:text-ash/40 focus:border-cyan focus:ring-cyan/30 w-full border px-4 py-3 text-base transition-colors outline-none focus:ring-2 ${
          error ? "border-magenta" : "border-cyan/25"
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-erro`} className="font-mono text-magenta text-xs">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-dica`} className="font-mono text-ash/60 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
