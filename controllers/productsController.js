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
            let sqlProduct = `DELETE from products WHERE produk_id=${req.params.produk_id};`

            let getProductImage = `SELECT produk_id_image from product_image where produk_id=${req.params.produk_id};`

            await dbQuery(sqlProduct)

            getProductImage = await dbQuery(getProductImage);

            console.log(getProductImage)
            if (getProductImage.length > 0) {
                for (let i = 0; i < getProductImage.length; i++) {
                    await dbQuery(`DELETE from product_image WHERE produk_id_image=${getProductImage[i].produk_id_image};`)
                }
            }


            res.status(200).send({ message: "Delete product success ✅" })

        } catch (error) {
            console.log(error);
            res.status(500).send(error)
        }
    },
    updateProduct: async (req, res) => {
        try {
            console.log(req.body)
            let { produk_id, kategori_id, nama_produk, deskripsi_produk, harga_modal, harga_jual, jumlah_stok, gudang_id, images } = req.body
            // 1. memperbarui data table products utama
            let resUpdate = await dbQuery(`UPDATE products set kategori_id=${db.escape(kategori_id)}, nama_produk=${db.escape(nama_produk)},
                deskripsi_produk=${db.escape(deskripsi_produk)},harga_modal=${db.escape(harga_modal)},harga_jual=${db.escape(harga_jual)}, jumlah_stok=${db.escape(jumlah_stok)}, gudang_id=${db.escape(gudang_id)} 
                WHERE produk_id=${db.escape(produk_id)};`);

            // 2. memperbarui data table product_image
            images.forEach(async (value, index) => {
                await dbQuery(`UPDATE product_image set url=${db.escape(value.url)} 
                    WHERE produk_id_image=${value.produk_id_image}`)
            })

            res.status(200).send({ message: "Update product success✅", success: true })

        } catch (error) {
            console.log(error)
        }
    }
}