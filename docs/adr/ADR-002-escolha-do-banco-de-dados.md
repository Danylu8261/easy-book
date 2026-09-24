# ADR-002 - Escolha do banco de dados: PostgreSQL com Prisma

## Status
Aceita

## Data
23/09/2026

## Responsável
Equipe EasyBook

## Contexto
A ADR-001 mostrou que o array em memória perde os dados a cada reinicialização. Agora a API precisa de persistência real. Além de livros, já existem usuários com autenticação, e devem surgir relacionamentos (usuário x livro, empréstimos), além de filtros e consultas mais elaboradas.

## Alternativas consideradas
1. PostgreSQL
2. MongoDB
3. SQLite
4. Firebase
5. Arquivo JSON

## Decisão
Adotar PostgreSQL como banco de dados e Prisma como ORM.

## Justificativa
- Os dados são estruturados e relacionais (livros, usuários, futuros empréstimos).
- Oferece integridade (chaves, unicidade de email, tipos) e transações.
- É gratuito, maduro e amplamente usado em produção.
- Prisma dá tipagem, migrações e consultas legíveis, sem SQL manual.
- Suporta múltiplas instâncias da aplicação acessando o mesmo banco.

## Consequências

### Positivas
- Os dados sobrevivem a reinicializações e deploys.
- Consultas com filtros, ordenação e relacionamentos.
- Restrições do banco protegem a consistência (ex.: email único).

### Negativas
- Exige instalar e manter um servidor de banco (ou serviço na nuvem).
- Adiciona dependências (Prisma) e uma etapa de migração do schema.
- Mais configuração (DATABASE_URL, variáveis de ambiente) e mais pontos de falha.
- Cada requisição depende da rede/banco, com latência maior que a memória.

## Critérios de revisão
Reavaliar se o volume de leituras exigir cache ou réplicas, se o custo de hospedagem do banco se tornar relevante, ou se o modelo de dados passar a ser majoritariamente sem esquema fixo.

## Notas
Substitui a ADR-001. O acesso ao banco fica isolado em src/prisma.js e nos controllers, então trocar o banco no futuro afeta poucos arquivos.
