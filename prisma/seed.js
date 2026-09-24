   const prisma = require("../src/database/prisma");

async function main() {
  const total = await prisma.book.count();
  if (total > 0) {
    console.log("Banco já possui livros, seed ignorado.");
    return;
  }

  await prisma.book.createMany({
    data: [
      { title: "Dom Casmurro", author: "Machado de Assis", genre: "Romance", rating: 4.6 },
      { title: "O Hobbit", author: "J.R.R. Tolkien", genre: "Fantasia", rating: 4.8 },
      { title: "Sapiens", author: "Yuval Noah Harari", genre: "História", rating: 4.7 },
    ],
  });
  console.log("Livros iniciais criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
