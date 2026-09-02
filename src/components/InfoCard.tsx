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
    <div className="border-ink/35 flex h-full flex-col border-t pt-6">
      <p className="font-heading text-ink/60 text-[0.6rem] font-bold tracking-[0.32em] uppercase">
        {label}
      </p>
      {/*
        O destaque é o que a pessoa lê de longe, e por isso salta bem acima do
        corpo — antes os dois tinham tamanhos próximos e nada dominava: o bloco
        lia como um parágrafo com uma linha em negrito. A distância entre os
        dois é o que transforma a mesma informação em hierarquia.
      */}
      <p className="font-display text-ink mt-3 text-4xl leading-[0.98] sm:text-5xl">
        {highlight}
      </p>
      {children && (
        <div className="text-ink/75 mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed">
          {children}
        </div>
      )}
      {footer && <div className="mt-auto pt-5">{footer}</div>}
    </div>
  );
}
