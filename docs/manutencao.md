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

**A venda fecha quando a festa começa.** Passada a hora, o formulário some e no
lugar dele aparece um botão de WhatsApp. Isso existe porque, sem ele, o site
continuaria cobrando R$ 80 por um ingresso de uma festa que já aconteceu, e a
pessoa só descobriria depois de pagar. Se você quiser continuar vendendo depois
do horário, é só mudar a data em `src/config/event.ts`.

**O selo de vagas aparece e some sozinho**, lendo a coluna PAGO da planilha. As
regras estão em [planilha.md](planilha.md#as-vagas-no-site). Ele fala pouco de
propósito: abaixo de 10 confirmados não diz nada, porque "3 de 80" é propaganda
de festa vazia.

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
| Local | `venue.*` | O `mapsUrl` é link do Google Maps; troque se mudar o endereço |
| WhatsApp | variável `NEXT_PUBLIC_WHATSAPP` na Vercel | Só dígitos, com país e DDD |
| Chave PIX | variável `NEXT_PUBLIC_PIX_KEY` na Vercel | Depois de mudar, **gere um PIX de teste e pague R$ 0,01 para você mesmo** |

### O detalhe da data

A data aparece em dois formatos, e eles não conversam entre si:

```ts
startsAt: "2026-10-16T16:00:00-03:00",  // o relógio: contagem e fechamento da venda
dateLabel: "16 de outubro",             // o texto que a pessoa lê
timeLabel: "16h",                       // idem
```

`startsAt` é o que a máquina usa; os outros dois são o que o olho lê. Mudar só
um deixa o site dizendo uma coisa e contando outra. O `-03:00` no fim é o fuso
de Brasília — mantenha.

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

Provavelmente está certo: abaixo de 10 confirmados ele fica calado de propósito.
Para testar, marque temporariamente `10` na coluna Ingressos de uma linha paga,
espere um minuto e recarregue **duas vezes** (a primeira serve o cache velho e
dispara a busca; a segunda mostra).

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
- [ ] Confirmar `ticket.price` e `ticket.capacity` (estão marcados como
      provisórios no `event.ts` desde o começo)

---

## Mexendo no código na sua máquina

```bash
npm install        # uma vez
npm run dev        # servidor em http://localhost:3000
npm test           # 48 testes; roda em ~1 segundo
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
