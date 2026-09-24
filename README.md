# EasyBook API

## Rodando
1. `npm install`
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` e `JWT_SECRET`
3. `npx prisma migrate dev --name init`
4. `npm run seed`
5. `npm start`

## Rotas
| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | /books | não | Lista livros (`?genre=Fantasia` filtra) |
| GET | /books/:id | não | Busca um livro |
| POST | /books | sim | Cadastra livro |
| DELETE | /books/:id | sim | Remove livro |
| POST | /auth/register | não | Cria usuário |
| POST | /auth/login | não | Retorna o token JWT |

Para rotas protegidas, envie o header `Authorization: Bearer <token>`.
