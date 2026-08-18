import type { ReactNode } from "react";

/**
 * Cartão com cantoneiras estilo interface de videocassete.
 * Aceita um destaque (o dado principal) e um rodapé opcional.
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
    <div className="group border-cyan/20 bg-crypt/40 hover:border-cyan/50 relative flex h-full flex-col gap-3 border p-6 backdrop-blur-sm transition-colors duration-300 sm:p-8">
      {/* cantoneiras */}
      <span className="border-magenta absolute -top-px -left-px h-4 w-4 border-t-2 border-l-2" />
      <span className="border-magenta absolute -right-px -bottom-px h-4 w-4 border-r-2 border-b-2" />

      <p className="font-mono text-ash text-[0.65rem] tracking-[0.35em] uppercase">
        {label}
      </p>
      <p className="font-heading glow-cyan text-cyan text-xl leading-tight sm:text-2xl">
        {highlight}
      </p>
      {children && (
        <div className="text-bone/70 text-sm leading-relaxed">{children}</div>
      )}
      {footer && <div className="mt-auto pt-2">{footer}</div>}
    </div>
  );
}
