# ADR-003 - Autenticação com JWT

## Status
Aceita

## Data
24/09/2026

## Responsável
Equipe EasyBook

## Contexto
A EasyBook já persiste livros no PostgreSQL (ADR-002). Agora precisamos identificar
os usuários e proteger operações que alteram dados, como cadastrar e remover livros.
A aplicação é um monólito em Node.js com Express, organizado em camadas, ainda em
fase inicial, sem infraestrutura de nuvem contratada e sem necessidade de login social.

## Alternativas consideradas
1. JWT com bcryptjs, implementado na própria aplicação
2. AWS Cognito
3. Login com Google (OAuth)
4. Sessões no servidor com cookies

## Decisão
Implementar autenticação com JWT, guardando as senhas como hash com bcryptjs.
O módulo fica isolado em src/modules/auth, com rotas de cadastro (/auth/register),
login (/auth/login) e verificação do usuário autenticado (/auth/me). Os endpoints
POST e DELETE de /books exigem um token válido, e as consultas (GET) continuam públicas.

## Justificativa
- Simples de implementar e de explicar no contexto atual do projeto.
- Não depende de serviço externo nem gera custo.
- O token é stateless: o servidor não precisa guardar sessões, o que facilita
  rodar mais de uma instância da aplicação.
- Combina bem com uma API REST consumida por diferentes clientes (navegador, app, Postman).
- As senhas nunca são armazenadas em texto puro: só o hash do bcrypt fica no banco.

## Consequências

### Positivas
- Controle total do fluxo de cadastro e login.
- Nenhum custo ou dependência de terceiros.
- Fácil de testar localmente.
- O middleware de autenticação pode proteger qualquer rota nova com uma linha.

### Negativas
- A equipe assume a responsabilidade pela segurança (hash, segredo, expiração do token).
- Um token emitido não pode ser revogado antes de expirar sem um mecanismo extra.
- Não oferece recuperação de senha, confirmação de e-mail, login social nem MFA prontos.
- O JWT_SECRET precisa ser protegido no .env e nunca versionado.

## Critérios de revisão
Esta decisão deverá ser reavaliada quando:
1. Houver necessidade de login social, MFA ou recuperação de senha.
2. Vários sistemas precisarem compartilhar a mesma base de usuários.
3. Surgirem requisitos de conformidade ou segurança que justifiquem um serviço
   gerenciado, como o AWS Cognito.
4. For necessário revogar tokens imediatamente (por exemplo, ao bloquear um usuário).

## Notas
O segredo do token fica na variável de ambiente JWT_SECRET. O token expira em 1 dia.