# A planilha dos pedidos

Cada pedido de ingresso vira uma linha numa planilha do Google. Não há banco de
dados nem painel: a planilha é o registro, e é nela que se marca quem pagou.

## Como funciona

1. A pessoa preenche o formulário e toca em **gerar pix**. O site mostra o QR e,
   ao mesmo tempo, manda o pedido para a planilha com o status em branco.
2. Ela paga e toca em **já fiz o pix**. A coluna _Disse que pagou_ recebe a data.
   Isso **não** é confirmação — é o aviso de que existe um comprovante para
   conferir.
3. Você olha o extrato da conta. Bateu, escreve `x` na coluna **PAGO**.

O site nunca escreve na coluna PAGO. Quem confirma dinheiro é quem vê o extrato:
com chave PIX comum não há como o site saber que o dinheiro entrou.

## Montando (uma vez só, ~5 minutos)

### 1. Crie a planilha

Crie uma planilha nova no Google Sheets. O nome é livre; a aba será criada pelo
script.

### 2. Cole o script

Na planilha: **Extensões → Apps Script**. Apague o que estiver lá e cole:

```js
/** Troque por uma frase secreta qualquer e use a MESMA na Vercel. */
const SEGREDO = 'troque-esta-frase';

const COLUNAS = [
  'Quando', 'Código', 'Nome', 'E-mail', 'WhatsApp',
  'Ingressos', 'Valor', 'Disse que pagou', 'PAGO',
];

function doPost(e) {
  const dados = JSON.parse(e.postData.contents);

  if (SEGREDO && dados.segredo !== SEGREDO) {
    return ContentService.createTextOutput('nao autorizado');
  }

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName('Pedidos') || planilha.insertSheet('Pedidos');

  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
  }

  // Procura o pedido pelo código, na coluna B.
  const total = Math.max(aba.getLastRow(), 1);
  const codigos = aba.getRange(1, 2, total, 1).getValues().flat();
  const linha = codigos.indexOf(dados.txid) + 1;

  if (dados.acao === 'pagou') {
    if (linha > 1) {
      aba.getRange(linha, 8).setValue(new Date());
    } else {
      // Sem a linha do pedido (caso raro), registra assim mesmo com o aviso.
      aba.appendRow([new Date(), dados.txid, dados.nome, dados.email,
        "'" + dados.whatsapp, dados.ingressos, dados.valor, new Date(), '']);
    }
    return ContentService.createTextOutput('ok');
  }

  // Pedido novo. Se o código já existe, não duplica.
  if (linha > 1) return ContentService.createTextOutput('ja existe');

  aba.appendRow([new Date(), dados.txid, dados.nome, dados.email,
    // O apóstrofo trava o telefone como texto: sem ele o Sheets come o zero
    // da frente e transforma número longo em notação científica.
    "'" + dados.whatsapp, dados.ingressos, dados.valor, '', '']);

  return ContentService.createTextOutput('ok');
}
```

Troque `troque-esta-frase` por uma frase sua e **guarde**, que ela vai na Vercel.

### 3. Publique o script

**Implantar → Nova implantação → Tipo: App da Web**

- _Executar como_: **Eu**
- _Quem pode acessar_: **Qualquer pessoa**

Autorize quando pedir (vai avisar que o app não é verificado — é seu, siga em
"Avançado → Acessar projeto"). Copie a **URL do app da web** que aparece no fim;
ela termina em `/exec`.

> "Qualquer pessoa" é o que permite o site escrever. O que protege é a frase
> secreta: sem ela, o script recusa a linha.

### 4. Ligue na Vercel

No projeto na Vercel: **Settings → Environment Variables**, e crie as duas:

| Nome                    | Valor                                  |
| ----------------------- | -------------------------------------- |
| `SHEETS_WEBHOOK_URL`    | a URL que termina em `/exec`           |
| `SHEETS_WEBHOOK_SECRET` | a mesma frase secreta que está no script |

Depois **Redeploy**, para o site enxergar as variáveis.

### 5. Confira

Abra o site, preencha o formulário com seus dados e gere o PIX. Deve aparecer
uma linha na planilha. Toque em **já fiz o pix** e a coluna _Disse que pagou_
deve receber a data.

## Se algo falhar

O site foi feito para **nunca** derrubar a venda por causa da planilha. Se ela
estiver fora do ar ou mal configurada, o PIX continua aparecendo normalmente e a
pessoa vê a mensagem pedindo para mandar o comprovante com o código. Nesse caso
o registro se recupera pelo comprovante — nenhuma venda se perde.

Sem as variáveis configuradas, o site funciona igual e simplesmente não registra.

## Mudando o preço

O valor da linha é calculado no servidor a partir de `src/config/event.ts`
(`ticket.price`), nunca do que o navegador manda. Mudou o preço lá, as linhas
novas já saem com o valor novo.
