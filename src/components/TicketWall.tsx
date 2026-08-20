import { Ticket } from "@/components/Ticket";

/**
 * A parede de ingressos que corre atrás do formulário.
 *
 * Cada fileira desliza em loop; fileiras vizinhas correm em sentidos opostos,
 * para a parede parecer viva sem puxar o olho para um lado só. O conteúdo de
 * cada fileira é duplicado e a animação desloca exatamente 50% — por isso a
 * emenda entre as cópias é invisível.
 *
 * É transform puro, então roda na camada de composição e não pesa nem em
 * celular. Fica escurecida pelo spotlight que a seção pinta por cima.
 */
const FILEIRAS = 6;
const POR_FILEIRA = 6;

export function TicketWall() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col justify-center gap-4 overflow-hidden">
      {Array.from({ length: FILEIRAS }, (_, fila) => {
        const tickets = Array.from({ length: POR_FILEIRA * 2 });
        return (
          <div key={fila} className="flex w-max">
            <div
              className={`flex w-max shrink-0 gap-4 pr-4 ${
                fila % 2 === 0 ? "animate-marquee" : "animate-marquee-slow"
              }`}
              style={fila % 2 === 1 ? { animationDirection: "reverse" } : undefined}
            >
              {tickets.map((_, i) => (
                <Ticket key={i} className="-rotate-1" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
