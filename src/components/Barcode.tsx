/**
 * Código de barras decorativo — o selo gráfico que ancora o canto do cartaz.
 * As barras vêm de uma sequência fixa para o desenho não mudar a cada render.
 */
const BARS = [3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 4, 2, 1, 1, 3, 2, 4, 1, 1, 2, 3,
  1, 2, 4, 1, 1, 2, 3, 1];

export function Barcode({ code }: { code: string }) {
  return (
    <div aria-hidden className="select-none">
      <div className="flex h-12 items-stretch gap-[3px]">
        {BARS.map((weight, i) => (
          <span
            key={i}
            className="bg-bone"
            style={{ width: `${weight}px` }}
          />
        ))}
      </div>
      <p className="font-mono text-bone mt-2 text-[0.65rem] tracking-[0.3em]">
        {code}
      </p>
    </div>
  );
}
