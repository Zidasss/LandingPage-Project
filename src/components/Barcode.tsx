import { barrasDoCodigo } from "@/lib/barras";

/**
 * O código de barras impresso no pé do ingresso.
 *
 * Enfeite, e assumido como tal: `aria-hidden`, porque quem usa leitor de tela
 * não ganha nada ouvindo quarenta e quatro barras. O que importa é o código
 * escrito ao lado, e esse é texto de verdade.
 */
export function Barcode({ valor }: { valor: string }) {
  return (
    <div aria-hidden className="flex h-11 items-stretch gap-[2px]">
      {barrasDoCodigo(valor).map((largura, i) => (
        <span
          key={i}
          className="bg-bone/70"
          style={{ width: `${largura}px` }}
        />
      ))}
    </div>
  );
}
