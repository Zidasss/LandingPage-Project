import type { ReactNode } from "react";

/**
 * Um dado do cartaz: rótulo pequeno, o dado em destaque e o detalhe embaixo.
 * Sem caixa nem fundo — só uma régua preta separando, como num impresso.
 */
export function InfoCard({
  label,
  highlight,
  children,
  footer,
}: {
  label: string;
  highlight: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="border-ink/35 flex h-full flex-col gap-2 border-t pt-5">
      <p className="font-heading text-ink/70 text-[0.62rem] font-bold tracking-[0.3em] uppercase">
        {label}
      </p>
      <p className="font-display text-ink text-2xl leading-[1.05] sm:text-3xl">
        {highlight}
      </p>
      {children && (
        <div className="text-ink/85 text-sm leading-relaxed">{children}</div>
      )}
      {footer && <div className="mt-auto pt-3">{footer}</div>}
    </div>
  );
}
