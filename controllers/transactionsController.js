const { db, dbQuery } = require("../config/database")

module.exports = {
    getCart: async (req, res) => {
        try {
            let selectCart = `SELECT cart.*, products.nama_produk, products.harga_jual, product_image.url as url_image from cart
            JOIN products on cart.produk_id = products.produk_id
            JOIN product_image on cart.produk_id = product_image.produk_id
            GROUP BY cart.produk_id;`

            selectCart = await dbQuery(selectCart)

            res.status(200).send(selectCart)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addCart: async (req, res) => {
        try {
            let addCart = `INSERT INTO cart values (null, ${db.escape(req.body.user_id)}, 
            ${db.escape(req.body.produk_id)}, ${db.escape(req.body.qty)});`

            addCart = await dbQuery(addCart)

            if (addCart.insertId) {
                res.status(200).send({ message: "Add to cart success ✅", success: true })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    removeCart: async (req, res) => {
        try {
            let removeCart = `DELETE FROM cart WHERE cart_id=${db.escape(req.params.cart_id)}`
            await dbQuery(removeCart)

            res.status(200).send(removeCart)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    getTransaction: async (req, res) => {
        try {
            let sqlHistory = `SELECT cart.cart_id, cart.user_id,  cart_produk.produk_id, cart.address_id, cart_produk.qty, cart.ongkos_kirim, cart_produk.harga_jual,produk.nama_produk,produk.galeri_produk, status_history.nama_status, DATE_FORMAT(timestamp,"%e %M %Y") as date, bukti_pembayaran.galeri_pembayaran  from cart
            JOIN cart_produk on cart.cart_id = cart_produk.cart_id
            JOIN produk on cart_produk.produk_id = produk.produk_id
            JOIN status_history on cart.cart_id = status_history.cart_id
            JOIN bukti_pembayaran on cart.user_id = bukti_pembayaran.user_id;`

            sqlHistory = await dbQuery(sqlHistory)

            res.status(200).send(sqlHistory)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    konfirmasiPesanan: async (req, res) => {
        try {
            let sqlStatusPembayaran = `UPDATE status_history set nama_status="Transaksi Berhasil" WHERE cart_id = ${db.escape(req.body.cart_id)}`
            await dbQuery(sqlStatusPembayaran)

            res.status(200).send({ message: "Update Success ✅", sqlStatusPembayaran })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    batalkanPesanan: async (req, res) => {
        try {
            let sqlStatusPembayaran = `UPDATE status_history set nama_status="Transaksi Dibatalkan" WHERE cart_id = ${db.escape(req.body.cart_id)}`
            await dbQuery(sqlStatusPembayaran)

            res.status(200).send({ message: "Update Success ✅", sqlStatusPembayaran })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}