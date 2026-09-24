const prisma = require("../../database/prisma");

async function listBooks(genre) {
  return prisma.book.findMany({
    where: genre ? { genre } : undefined,
    orderBy: { id: "asc" },
  });
}

async function getBookById(id) {
  return prisma.book.findUnique({ where: { id } });
}

async function createBook(data) {
  return prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      genre: data.genre,
      rating: data.rating,
    },
  });
}

async function deleteBook(id) {
  return prisma.book.delete({ where: { id } });
}

module.exports = { listBooks, getBookById, createBook, deleteBook };
