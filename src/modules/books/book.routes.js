const express = require("express");
const controller = require("./book.controller");
const authenticate = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", authenticate, controller.create);
router.delete("/:id", authenticate, controller.remove);

module.exports = router;