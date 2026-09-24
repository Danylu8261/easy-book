# ADR-001 - Armazenar livros em memória

## Status
Substituída pela ADR-002

## Data
23/09/2026

## Responsável
Equipe EasyBook

## Contexto
Estamos desenvolvendo a primeira versão da API da EasyBook. A aplicação precisa permitir consultar livros (GET /books) e cadastrar novos livros (POST /books). O produto está em fase de prototipação, e a prioridade é validar o fluxo rapidamente antes de aumentar a complexidade.

## Alternativas consideradas
1. Array em memória
2. PostgreSQL
3. MongoDB
4. SQLite
5. Arquivo JSON

## Decisão
Adotar um array em memória para armazenar os livros na versão inicial.

## Justificativa
- Desenvolvimento rápido e baixa complexidade.
- Nenhuma infraestrutura ou custo adicional.
- Facilita os primeiros testes de GET e POST.

## Consequências

### Positivas
- Protótipo funcionando em minutos.
- Nenhuma configuração externa.

### Negativas
- Os dados são perdidos quando o servidor reinicia (comprovado no teste de reinicialização).
- Não serve para múltiplas instâncias da aplicação.
- Sem integridade, relacionamentos nem consultas avançadas.

## Critérios de revisão
Reavaliar quando o MVP for validado, quando for necessário manter dados entre reinicializações ou quando surgirem relacionamentos entre entidades (por exemplo, usuários e empréstimos).

## Notas
Decisão temporária. A escolha do mecanismo de persistência está registrada na ADR-002.
