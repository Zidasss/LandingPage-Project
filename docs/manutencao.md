# Operando o site sozinho

Este é o manual para mexer no site sem precisar de ninguém. Está escrito para
ser lido de cima para baixo na primeira vez, e depois consultado pelo índice.

- [O que o site faz sozinho](#o-que-o-site-faz-sozinho)
- [Mudar preço, data, local, telefone](#mudar-preço-data-local-telefone)
- [Como publicar uma mudança](#como-publicar-uma-mudança)
- [Quando algo dá errado](#quando-algo-dá-errado)
- [O que ainda está pendente](#o-que-ainda-está-pendente)
- [Mexendo no código na sua máquina](#mexendo-no-código-na-sua-máquina)

---

## O que o site faz sozinho

Três coisas acontecem sem ninguém apertar nada. Vale saber quais são, para não
achar que o site quebrou quando ele está funcionando.

**A contagem regressiva vira "A festa começou"** na hora marcada. Automático.

**A venda fecha sozinha no fim do prazo de pagamento** (`ticket.deadline`), e de
qualquer jeito quando a festa começa — a festa é o teto, mesmo que o prazo esteja
configurado errado. Passado o corte, o formulário some e no lugar dele aparece um
botão de WhatsApp.

As duas situações dizem coisas diferentes, de propósito. Quem chega no dia
seguinte ao prazo **não perdeu a festa** — ela ainda vai acontecer —, então o
site diz que o prazo encerrou e manda falar com você. Só depois da festa é que
ele diz que a festa acabou. Para esticar o prazo, mude `ticket.deadline`.

O aviso **"Pague até 25 de setembro"** aparece no ingresso enquanto a venda está
aberta, e some junto com o formulário.

**O selo de vagas aparece e some sozinho**, lendo a coluna PAGO da planilha. As
regras estão em [planilha.md](planilha.md#as-vagas-no-site). Ele nunca conta
quantas pessoas já confirmaram — só quantas vagas sobram — e fica calado até
sobrar pouco, porque "127 vagas restantes" também é propaganda de festa vazia.

E uma coisa que o site **não** faz: confirmar pagamento. Com chave PIX comum não
há como ele saber que o dinheiro entrou. Quem confirma é quem olha o extrato e
escreve `x` na coluna PAGO.

---

## Mudar preço, data, local, telefone

Quase tudo mora num arquivo só: **`src/config/event.ts`**. Mudou lá, mudou no
site inteiro — cartaz, ingresso, PIX, contagem, textos.

| O que mudar | Campo | Cuidado |
| --- | --- | --- |
| Preço | `ticket.price` | Número puro, sem `R$`. O valor da planilha é recalculado a partir daqui, no servidor |
| Quantas pessoas cabem | `ticket.capacity` | É o teto do selo de vagas e do "Lotado" |
| Data e hora | `startsAt` | **Mude `dateLabel` e `timeLabel` junto** — veja abaixo |
| Prazo de pagamento | `ticket.deadline` | Só este campo. O texto "Pague até…" é gerado a partir dele |
| Cardápio (o que está incluso) | `cardapio` | Lista de grupos, cada um com título e itens. Ver abaixo |
| Local | `venue.*` | O `mapsUrl` é link do Google Maps; troque se mudar o endereço |
| WhatsApp | variável `NEXT_PUBLIC_WHATSAPP` na Vercel | Só dígitos, com país e DDD |
| Chave PIX | variável `NEXT_PUBLIC_PIX_KEY` na Vercel | Depois de mudar, **gere um PIX de teste e pague R$ 0,01 para você mesmo** |

### O detalhe da data

A data aparece em dois formatos, e eles não conversam entre si:

```ts
startsAt: "2026-10-16T19:00:00-03:00",  // o relógio: contagem e fechamento da venda
dateLabel: "16 de outubro",             // o texto que a pessoa lê
timeLabel: "19h",                       // idem
```

`startsAt` é o que a máquina usa; os outros dois são o que o olho lê. Mudar só
um deixa o site dizendo uma coisa e contando outra. O `-03:00` no fim é o fuso
de Brasília — mantenha.

O prazo de pagamento **não** tem esse problema: só existe `ticket.deadline`, e o
texto "Pague até 25 de setembro" é gerado a partir dele. Mudou a data, mudou o
texto. O `23:59:59` no fim é de propósito — o prazo é *até* o dia 25, então quem
paga às onze da noite do 25 pagou dentro do prazo.

### O cardápio

A lista do cartão **"Incluso"** sai inteira do campo `cardapio` no `event.ts`.
Cada grupo é um título e uma lista de itens:

```ts
{
  titulo: "Drinks",
  itens: ["Caipirinha de limão", "Caipirinha de morango"],
},
```

Acrescentar, tirar ou renomear grupo é só mexer nessa lista — nenhum componente
precisa ser tocado, e o layout se reorganiza sozinho (duas colunas ao lado do
texto no computador, empilhado no celular).

Os itens são curtos de propósito: detalhe demais no site vira promessa a cumprir
na porta. A litragem do chope saiu por isso — o que importa é que tem chope.

O grupo **"Do caldeirão"** tem uma marca a mais, `aDefinir: true`, que é o que
faz aparecer o aviso "▶ segredo até a porta". Ele existe porque os nomes das
bebidas temáticas ainda dependem de acerto com o local. Escrever "bebida
temática 1" soaria inacabado; assim soa intenção. **Quando os nomes existirem,
troque os itens e apague a linha `aDefinir: true`** — o aviso some junto.

O mesmo vale para a comida: se o `finger food` ganhar descrição, é só trocar os
itens do grupo "Para comer".

### A casa pegando fogo

A última cena da página são **duas artes empilhadas**: a casa limpa e a casa
em chamas. O que se anima é a máscara que revela a de cima, de baixo para cima,
conforme a rolagem — não há quadros de animação.

Na pasta `public/` moram quatro arquivos:

| Arquivo | Para que serve |
| --- | --- |
| `casa.png`, `casa-fogo.png` | as fontes, com fundo transparente. O site **não** usa estes |
| `casa.webp`, `casa-fogo.webp` | o que o site serve: o mesmo desenho achatado sobre o vermelho |

O achatamento não é capricho: com o fundo transparente as duas juntas pesavam
793KB, e sobre o vermelho pesam 251KB. Num traço denso assim, o canal alfa é o
que mais custa a comprimir.

**Para trocar a arte**, substitua os `.png` e gere os `.webp` de novo:

```python
from PIL import Image
v = Image.new("RGBA", (1080, 1350), (255, 26, 18, 255))   # o vermelho do site
for f in ("casa", "casa-fogo"):
    im = Image.open(f"public/{f}.png").convert("RGBA")
    Image.alpha_composite(v, im).convert("RGB").save(
        f"public/{f}.webp", "WEBP", quality=72, method=6)
```

As duas artes **não precisam ser o mesmo desenho** — as atuais não são, foram
geradas separadas. Basta que concordem no lugar da casa, do telhado e do chão:
a frente da máscara é borrada, e a diferença de traço na faixa que está passando
lê como tremida de calor. O que não pode é mudar o enquadramento.

### O que NÃO mudar sem pensar

- `pix.receiverName` e `pix.receiverCity` precisam bater com o cadastro do banco,
  e têm limite de 25 e 15 caracteres. Errado, o QR pode ser recusado.
- A chave PIX aparece no HTML da página — é assim que PIX estático funciona,
  não tem como esconder. Por isso: **chave aleatória criada no app do banco,
  nunca seu CPF.**

---

## Como publicar uma mudança

A Vercel publica sozinha a cada push na `master`. Então:

1. Edite o arquivo (dá para fazer pelo site do GitHub: abra o arquivo, ícone de
   lápis, **Commit changes**)
2. Espere ~1 minuto
3. Recarregue o site

**Mudou variável de ambiente na Vercel?** Aí não basta salvar: vá em
**Deployments → ⋯ do deploy mais recente → Redeploy**. Variável só entra em
build novo. Esse é o passo mais fácil de esquecer.

---

## Quando algo dá errado

### O PIX sumiu / "Chave PIX não configurada"

A variável `NEXT_PUBLIC_PIX_KEY` está vazia na Vercel. Atenção: **criada em
branco conta como vazia** — já aconteceu. Preencha e dê Redeploy. Se preferir,
apague a variável: o site tem um valor padrão embutido que funciona.

### Os pedidos não chegam na planilha

Nessa ordem:

1. Abra a URL do script com a frase secreta no fim
   (`.../exec?segredo=SUA-FRASE`) e veja o que volta — a tabela de respostas
   está em [planilha.md](planilha.md#se-algo-falhar)
2. Se ela responde certo, o problema é a Vercel: `SHEETS_WEBHOOK_URL` está
   apontando para a implantação atual? Houve Redeploy depois de trocar?
3. Confira que `SHEETS_WEBHOOK_SECRET` é **idêntica** à frase no topo do script

**A venda não para por isso.** Sem planilha o PIX continua aparecendo e a pessoa
continua mandando o comprovante no WhatsApp — o registro se recupera por ali.
Nenhuma venda se perde.

### O selo de vagas não aparece

Provavelmente está certo: enquanto houver folga ele fica calado de propósito.
Com 130 lugares, ele só abre a boca quando sobrarem **26 vagas ou menos**.

Para testar sem esperar a festa encher, marque temporariamente `110` na coluna
Ingressos de uma linha paga, espere um minuto e recarregue **duas vezes** (a
primeira serve o cache velho e dispara a busca; a segunda mostra). Depois
devolva o valor real.

### O site apareceu sem estilo, todo branco

Aconteceu comigo em desenvolvimento, não em produção: um servidor antigo servindo
HTML que aponta para um CSS que não existe mais. Feche tudo (`pkill -f next`) e
rode `npm run dev` de novo.

### A coluna PAGO está com um `x` mas não conta

Qualquer texto na célula conta como pago. **Cuidado com caixa de seleção:**
desmarcada ela guarda `FALSE`, que é texto e conta como pago. Use letra, não
caixa de seleção.

---

## O que ainda está pendente

- [ ] **Trocar `SHEETS_WEBHOOK_URL` na Vercel** pela URL da implantação nova do
      Apps Script (a que responde `{"confirmados":N}`), e dar Redeploy. Sem isso
      o selo de vagas não aparece e os pedidos vão para um endereço aposentado.
- [ ] Apagar as linhas de teste da planilha e a aba `Página1` vazia
- [ ] Arquivar a implantação antiga do Apps Script, para ninguém tropeçar nela
- [ ] Conferir se a Associação Volvo comporta mesmo as 130 pessoas (a
      `ticket.capacity` foi ajustada de 80 para 130 na intenção de "tentar
      meter até 130" — se o local não permitir, o número precisa voltar)

---

## Mexendo no código na sua máquina

```bash
npm install        # uma vez
npm run dev        # servidor em http://localhost:3000
npm test           # 55 testes; roda em ~1 segundo
npm run lint
npm run build      # o que a Vercel faz; se passar aqui, passa lá
```

Antes de publicar qualquer mudança de código, rode `npm test` e `npm run build`.
Os testes cobrem justamente o que dá errado quieto: o cálculo do PIX, a
validação do pedido, as regras de vaga, o fechamento da venda.

### Onde fica o quê

```
src/config/event.ts       tudo que muda de ano para ano
src/app/page.tsx          a montagem da página
src/components/           cada pedaço da tela
src/lib/                  as regras, sem tela — é onde estão os testes
docs/planilha.md          a planilha e o Apps Script
```

O código está comentado em português, e os comentários explicam **por que** cada
coisa é como é — inclusive os erros que já foram cometidos e não devem voltar.
Quando for mexer em algo, leia o comentário acima primeiro: várias linhas que
parecem estranhas estão assim porque a alternativa óbvia quebrou.
