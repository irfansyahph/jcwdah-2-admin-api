const express = require("express");
const { readToken } = require("../config/token");
const { transactionsController } = require("../controllers")
const router = express.Router();

router.get("/get-cart", readToken, transactionsController.getCart);
router.post("/add-cart", transactionsController.addCart);
router.delete('/delete/:cart_id', transactionsController.removeCart);
router.get("/get-transactions", transactionsController.getTransaction);
router.patch("/konfirmasi-pesanan", transactionsController.konfirmasiPesanan);
router.patch("/batalkan-pesanan", transactionsController.batalkanPesanan);

module.exports = router;