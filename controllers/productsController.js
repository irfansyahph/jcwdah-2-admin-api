const { db, dbQuery } = require("../config/database")
const { uploader } = require("../config/multer");
const fs = require('fs');

module.exports = {
    getProducts: async (req, res) => {
        try {
            console.log(req.query.produk_id)
            let sqlGetProducts = `Select * from produk ${req.query.produk_id ? `WHERE produk_id=${req.query.produk_id}` : ""};`;
            let sqlGetStok = `SELECT stok.produk_id, SUM(jumlah_stok) as total_stok from stok GROUP BY produk_id;`;

            let getProducts = await dbQuery(sqlGetProducts);
            let getStok = await dbQuery(sqlGetStok);
            console.log(getProducts)

            let newData = getProducts.map((value, index) => {
                value.stok = [];
                getStok.forEach((val, idx) => {
                    if (value.produk_id == val.produk_id) {
                        value.stok.push(val)
                    }
                });

                return value;
            })

            res.status(200).send(newData)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addProduct: async (req, res) => {
        const upload = uploader('/images', 'IMG').fields([{ name: 'images' }]);
        upload(req, res, async (error) => {
            try {
                // console.log(req.body.data)
                // console.log(req.file.stok)
                let { nama_produk, kategori, deskripsi_produk, harga_modal, harga_jual, jumlah_terjual, jumlah_stok, gudang_id } = JSON.parse(req.body.data)
                const filePath = req.files.images ? `/images/${req.files.images[0].filename}` : null;

                let sqlProduct = `INSERT INTO produk values (null, '${nama_produk}','${kategori}','${deskripsi_produk}',${harga_modal},${harga_jual},'http://localhost:2025${filePath}',null);`
                // sqlProduct = await dbQuery(sqlProduct)
                // console.log(sqlProduct)
                let insertProduct = await dbQuery(sqlProduct)
                console.log(insertProduct)
                // console.log(req.body)
                if (insertProduct.insertId) {
                    let sqlStok = `INSERT INTO stok values (null,${insertProduct.insertId}, ${gudang_id}, ${jumlah_stok});`
                    await dbQuery(sqlStok)
                }
                res.status(200).send({ message: "Add Product Success ✅" })
            } catch (error) {
                fs.unlinkSync(`./public/images/${req.files.images[0].filename}`)
                console.log(error);
                res.status(500).send(error);
            }
        })
    },
    deleteProduct: async (req, res) => {
        try {
            // console.log(req.params)
            let sqlProduct = `DELETE from produk WHERE produk_id=${req.params.produk_id};`
            let deleteProduct = await dbQuery(sqlProduct)

            if (deleteProduct.affectedRows) {
                let deleteStok = `DELETE from stok WHERE produk_id=${req.params.produk_id}`
                await dbQuery(deleteStok)
            }

            res.status(200).send({ message: "Delete product success ✅" })

        } catch (error) {
            console.log(error);
            res.status(500).send(error)
        }
    },
    editProduct: async (req, res) => {
        try {
            let sqlEdit = `UPDATE produk set nama_produk=${db.escape(req.body.nama_produk)}, kategori=${db.escape(req.body.kategori)}, deskripsi_produk=${db.escape(req.body.deskripsi_produk)}, 
            harga_modal=${db.escape(req.body.harga_modal)}, harga_jual=${db.escape(req.body.harga_jual)}
            WHERE produk_id=${db.escape(req.body.produk_id)};`
            await dbQuery(sqlEdit)

            res.status(200).send({ message: "Update product success✅", success: true })
        } catch (error) {
            console.log(error)
        }
    }
}