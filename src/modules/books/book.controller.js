const bookService = require("./book.service");

async function list(req, res) {
  try {
    const books = await bookService.listBooks(req.query.genre);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const book = await bookService.getBookById(id);
    if (!book) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req, res) {
  const { title, author, genre, rating } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "title e author são obrigatórios" });
  }
  if (rating !== undefined && (typeof rating !== "number" || rating < 0 || rating > 5)) {
    return res.status(400).json({ error: "rating deve ser um número entre 0 e 5" });
  }

  try {
    const book = await bookService.createBook({ title, author, genre, rating });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    await bookService.deleteBook(id);
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Livro não encontrado" });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { list, getById, create, remove };