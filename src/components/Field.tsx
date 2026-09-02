/**
 * Campo de formulário do ingresso.
 *
 * É uma linha de preencher, não uma caixa: num ingresso os campos são pautas
 * onde se escreve à mão, e a caixa com borda em volta fazia o corpo do cartão
 * parecer um formulário de site colado dentro do papel.
 *
 * A pauta é grossa de propósito — 2px, e já nasce grossa para o foco não
 * empurrar o campo meio pixel para cima. O que muda no foco é a cor dela e o
 * fundo, e essa mudança é o aviso de onde se está digitando: sem borda em
 * volta, um anel fino não teria onde se apoiar.
 */
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
        className={`bg-bone/[0.04] text-bone placeholder:text-ash/40 focus:border-ember focus:bg-bone/[0.08] w-full border-0 border-b-2 px-3 py-3 text-base transition-colors outline-none ${
          error ? "border-blood" : "border-bone/25"
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
