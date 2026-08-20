/** Campo de formulário do ingresso: escuro, com foco em brasa. */
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
        className="font-heading text-ash text-[0.62rem] font-bold tracking-[0.3em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : hint ? `${id}-dica` : undefined}
        className={`bg-ink/70 text-bone placeholder:text-ash/40 focus:border-ember focus:ring-ember/30 w-full border px-4 py-3 text-base transition-colors outline-none focus:ring-2 ${
          error ? "border-blood" : "border-bone/20"
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-erro`} className="font-heading text-blood text-xs font-semibold">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-dica`} className="text-ash/70 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
