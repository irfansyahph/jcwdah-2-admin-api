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
    }
}