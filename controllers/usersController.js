const { db, dbQuery } = require('../config/database')
const Crypto = require('crypto')
const { createToken } = require("../config/token");
const { transporter } = require("../config/nodemailer");
const jwt = require("jsonwebtoken")

module.exports = {
    getData: (req, res) => {
        db.query(`Select * from users;`, (err, results) => {
            if (err) {
                res.status(500).send(err)
            }

            res.status(200).send(results)
        })

    },
    register: async (req, res) => {
        try {
            let hashPassword = Crypto.createHmac("sha256", "key_password").update(req.body.password).digest("hex")
            let insertScript = `INSERT INTO users value (null, '${req.body.username}','${req.body.email}','${hashPassword}','${req.body.no_telepon}','${req.body.user_status}','${req.body.user_role}');`

            let insertSQL = await dbQuery(insertScript);

            let results = await dbQuery(`Select * from users where user_id = ${insertSQL.insertId};`);

            if (results.length > 0) {
                let { user_id, username, email, no_telepon, user_role, user_status } = results[0];
                let token = createToken({ user_id, username, email, no_telepon, user_role, user_status });

                // konfigurasi email
                await transporter.sendMail({
                    from: `Admin Wcommerce API`,
                    to: "lumbantoruan0705@gmail.com",
                    subject: "Konfirmasi Register",
                    html: `<div>
                    <h4>Berikut link verifikasi email anda</h4>
                    <a href='http://localhost:3000/verification/${token}'>Klik, Verifikasi Email</a>
                    </div>`
                })
                res.status(200).send({ message: "Register success ✅\nPeriksa Email Anda", success: true })
            } else {
                res.status(500).send({ message: "Register failed ❌" })
            }
        } catch (err) {
            console.log(err)
            res.status(500).send(err)

        }
    },
    login: (req, res) => {
        let hashPassword = Crypto.createHmac("sha256", "key_password").update(req.body.password).digest("hex")
        let loginScript = `Select * from users WHERE email='${req.body.email}' AND password ='${hashPassword}';`

        db.query(loginScript, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            if (results.length > 0) {
                let { user_id, username, email, no_telepon, user_role, user_status } = results[0]
                let token = createToken({ user_id, username, email, no_telepon, user_role, user_status })
                console.log(token)

                res.status(200).send({
                    messages: "Login Success ✅", loginData: {
                        user_id,
                        username,
                        email,
                        no_telepon,
                        user_role,
                        user_status,
                        token
                    }
                })
            } else {
                res.status(401).send({ messages: "User not found ❌" })
            }
        })
    },
    keepLogin: (req, res) => {
        console.log(req.dataUser)
        let loginScript = `Select * from users WHERE user_id=${req.dataUser.user_id} ;`

        db.query(loginScript, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }

            if (results.length > 0) {
                let { user_id, username, email, no_telepon, user_role, user_status } = results[0];
                let token = createToken({ user_id, username, email, no_telepon, user_role, user_status });
                res.status(200).send({
                    messages: "Login Success ✅", loginData: {
                        user_id,
                        username,
                        email,
                        no_telepon,
                        user_role,
                        user_status,
                        token
                    }
                });
            } else {
                res.status(401).send({ messages: "User not found ❌" });
            }

        })
    },
    accountVerification: async (req, res) => {
        try {
            console.log("Output Token", req.dataUser)
            let updateScript = `UPDATE users set user_status='Verified' WHERE user_id=${req.dataUser.user_id};`

            let updateSQL = await dbQuery(updateScript);

            res.status(200).send({ message: "Account Verified ✅", success: true })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },

    forgotPassword: (req, res) => {
        let { email } = req.body;
        const checkUser = `select * FROM users WHERE email='${email}'`;

        db.query(checkUser, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }

            let { user_id, email } = results[0];

            let token = createToken({ user_id, email });
            console.log(token)

            let mail = {
                from: `Admin <Lumbantoruan0705@gmail.com>`,
                to: `${email}`,
                subject: "Reset Password W-Commerce User Account",
                html: `
                <h3>Hello, W-Commerce User</h3>
                <h3>Seems like you forgot your own account password 😅</h3>
                <sp>
                  To reset your password, please click the link below.
                </sp>
                <h5>
                  <a href="http://localhost:3000/reset-password/${token}"
                    >Reset Your Password Here</a
                  >
                </h5>
                <br>
                <br>
                <p>Regards, Admin W-Commerce</p>`,
            };
            transporter.sendMail(mail, (errMail, resMail) => {
                if (errMail) {
                    console.log(errMail);
                    res.status(500).send({
                        message: "Reset Password Failed",
                        success: false,
                        err: errMail,
                    });
                }
                res.status(200).send({
                    message: "To Reset Your Password, Check Your Email!",
                    success: true,
                });
            });
        });
    },

    resetPassword: (req, res) => {
        const { token, password } = req.body;
        let verify = jwt.verify(token, "tokenKu");
        console.log(verify)
        let hashPassword = Crypto.createHmac("sha256", "key_password").update(req.body.password).digest("hex")
        const verifyAccount = `update users set password = '${hashPassword}' where email ='${verify.email}'`;
        db.query(verifyAccount, (err, results) => {
            if (err) {
                console.log(err);
            }
            res.status(200).send({ message: "Password Has Change" });
        });
    },

    changePassword: (req, res) => {
        const { user_id, confirmPassword, newPassword, oldPassword } = req.body;
        if (!(confirmPassword === newPassword)) {
            return res.status(400).send({ message: "Password does not match" });
        }
        const checkUser = `Select password from users where user_id ='${user_id}'`;
        db.query(checkUser, (err, results) => {
            if (!results) {
                return res.send({ message: "User not found" });
            }
            const hashOldPass = Crypto.createHmac("sha256", "key_password").update(req.body.oldPassword).digest("hex")

            if (results[0].password !== hashOldPass) {
                return res.status(400).send({ message: "wrong old password" });
            }
            const hashpass = Crypto.createHmac("sha256", "key_password").update(req.body.newPassword).digest("hex")
            const updatePassword = `update users set password = '${hashpass}' where user_id = '${user_id}'`;

            db.query(updatePassword, (err, results) => {
                if (err) {
                    console.log(err)
                }
                res.status(200).send({ message: "Password Has Change" });
            });
        });
    },
    getAddress: async (req, res) => {
        try {
            let getAddress = `SELECT * FROM warehouse.address
        WHERE user_id = ${db.escape(req.dataUser.user_id)};`

            getAddress = await dbQuery(getAddress)

            res.status(200).send(getAddress)
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    addAddress: async (req, res) => {
        try {
            let addAddress = `INSERT INTO address values (null, ${db.escape(req.body.user_id)}, 
        '${db.escape(req.body.alamat)}', '${db.escape(req.body.kota)}', ${db.escape(req.body.kode_pos)});`

            addAddress = await dbQuery(addAddress)

            if (addAddress.insertId) {
                res.status(200).send({ message: "Add address success ✅", success: true })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    activingUser: async (req, res) => {
        try {
            let sqlActive = `UPDATE users set user_status="Verified" WHERE user_id=${db.escape(req.body.user_id)};`
            await dbQuery(sqlActive)

            res.status(200).send({ message: "Update Success ✅", sqlActive })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },
    nonActivingUser: async (req, res) => {
        try {
            let sqlUnactive = `UPDATE users set user_status="Unverified" WHERE user_id=${db.escape(req.body.user_id)};`
            await dbQuery(sqlUnactive)

            res.status(200).send({ message: "Update Success ✅", sqlUnactive })
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    }
}