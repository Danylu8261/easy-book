# EasyBook - Respostas das missões

## Missão 3 - Persistência com PostgreSQL e Prisma

### Qual problema arquitetural resolvemos ao adicionar persistência?
Os dados ficavam num array na memória do processo Node.js e desapareciam quando o
servidor reiniciava. Ao gravar no PostgreSQL, os livros e usuários sobrevivem a
reinicializações e deploys. Comprovei isso cadastrando livros, reiniciando o servidor
e consultando de novo: os livros continuaram na lista.

### Por que PostgreSQL faz sentido para a EasyBook neste momento?
Os dados são estruturados e tendem a ter relacionamentos (livros, usuários e, no futuro,
empréstimos). O PostgreSQL oferece integridade (tipos, unicidade de e-mail, chaves) e
transações, é gratuito, maduro e muito usado em produção. A decisão está detalhada na
ADR-002.

### Qual é a responsabilidade do Prisma?
Fazer a ponte entre o código JavaScript e o banco. Ele traduz chamadas como
prisma.book.findMany() em consultas SQL, gera o cliente a partir do schema.prisma e
versiona a estrutura do banco por meio de migrations.

### O que acontece com a API se o banco ficar indisponível?
A API continua no ar, mas as rotas que dependem do banco falham. Nos controllers, o
try/catch captura o erro e a API responde 500 com "Erro interno do servidor", em vez de
derrubar o processo. Rotas que não usam o banco continuam respondendo.

### Que vantagens ganhamos em relação ao array em memória?
- Persistência entre reinicializações.
- Suporte a várias instâncias da aplicação acessando o mesmo banco.
- Consultas com filtro e ordenação (por exemplo, ?genre=).
- Integridade dos dados (e-mail único, tipos definidos).
- Estrutura do banco versionada em migrations.

### Que nova complexidade foi adicionada?
- Instalar, configurar e manter um servidor de banco.
- Variáveis de ambiente (DATABASE_URL) e cuidado para não versionar o .env.
- Migrations a cada mudança no schema.
- Uma nova dependência externa: se o banco cair, a API perde a maior parte da função.

### Quais trade-offs surgiram com essa decisão?
Trocamos simplicidade e velocidade de desenvolvimento por durabilidade e integridade.
Cada requisição agora depende de rede e banco, o que aumenta a latência em relação à
memória, e a equipe precisa aprender e manter Prisma, migrations e o próprio PostgreSQL.

### O desenho arquitetural precisa ser atualizado?
Sim. Antes:

```
Cliente -> API -> Array em memória
```

Agora:

```
Cliente -> API (Express) -> Prisma -> PostgreSQL
```

## Missão 4 - Arquitetura em camadas e autenticação

### Estrutura do projeto

```
src/
├── database/prisma.js
├── modules/
│   ├── books/   (routes, controller, service)
│   └── auth/    (routes, controller, service, middleware)
└── app.js
server.js
```

### Por que não deixar tudo dentro do server.js?
Um único arquivo com rotas, validação, acesso ao banco e inicialização do servidor cresce
sem controle e fica difícil de ler, testar e manter. Separar por responsabilidade facilita
encontrar onde mexer, reduz o risco de quebrar outras partes e permite que mais de uma
pessoa trabalhe no projeto.

### Qual a responsabilidade de cada camada?
- **server.js:** carregar o .env e ligar o servidor na porta.
- **app.js:** configurar a aplicação (middlewares, JSON, CORS) e registrar as rotas.
- **Routes:** definir os caminhos e apontar cada um para a função do Controller,
  aplicando o middleware de autenticação onde for preciso.
- **Controller:** receber a requisição HTTP, validar a entrada, chamar o Service e devolver
  a resposta com o status correto.
- **Service:** concentrar as operações e regras do domínio (livros, cadastro, login).
- **Database:** disponibilizar a conexão com o banco (Prisma) para o restante da aplicação.

### Por que o Service não deveria depender de req e res?
Porque req e res são detalhes do HTTP. Sem eles, o Service pode ser reaproveitado por
outros meios (um script, uma fila, testes automatizados) e testado sem subir um servidor.

### Por que as Routes não acessam diretamente o Prisma?
Para manter cada camada com uma responsabilidade. As rotas só direcionam o tráfego.
Se elas falassem com o banco, as regras e o acesso a dados ficariam espalhados, e trocar
o banco ou a regra exigiria mexer em vários lugares.

### O comportamento externo da API mudou?
Não na organização interna: GET e POST de /books continuam iguais para quem consome a API.
As mudanças visíveis vieram da autenticação, que passou a exigir token em POST e DELETE.

### Que vantagem essa organização traz quando o sistema crescer?
Cada novo domínio (empréstimos, autores, avaliações) entra como um novo módulo em
src/modules, sem bagunçar os existentes. O projeto continua sendo um monólito, mas
organizado por responsabilidades e preparado para crescer.

### Que nova complexidade essa organização adiciona?
Mais arquivos e mais níveis de indireção para uma operação simples. Em um projeto muito
pequeno isso parece exagero, e o Service, hoje, é uma camada fina que só repassa
chamadas ao Prisma. O ganho aparece conforme surgem regras de negócio e novos módulos.

### Pesquisa: como implementar autenticação?
- **JWT:** o servidor gera um token assinado após o login, e o cliente o envia no header
  Authorization. É stateless, simples e sem custo, mas o token não pode ser revogado
  facilmente antes de expirar e a segurança fica por conta da equipe.
- **AWS Cognito:** serviço gerenciado com cadastro, login, recuperação de senha, MFA e
  login social prontos. Reduz o trabalho de segurança, mas traz dependência da AWS,
  custo e mais configuração.
- **Login com Google (OAuth):** o usuário entra com a conta Google. É prático para o
  usuário, mas depende de um provedor externo e ainda exige uma forma de sessão ou token.
- **Sessões com cookies:** o servidor guarda a sessão. É simples, mas exige armazenar
  estado, o que atrapalha a escala com várias instâncias.

### Qual solução escolhi e por quê?
JWT com bcryptjs. Para o contexto atual da EasyBook (monólito pequeno, sem nuvem
contratada e sem necessidade de login social) ele é o mais simples e barato, e ainda
permite escalar por ser stateless. O trade-off é assumir a segurança na própria
aplicação. O registro completo está na ADR-003.

### Implementação (desafio opcional)
Implementei o login: POST /auth/register, POST /auth/login e GET /auth/me. O POST e o
DELETE de /books exigem token, e o GET continua público. Testei os casos com token
válido (sucesso) e sem token (erro 401 "Token não fornecido").