const express = require('express')
const { readToken } = require('../config/token');
const { usersController } = require('../controllers')
const router = express.Router()

router.get('/get', usersController.getData);
router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.get('/keep-login', readToken, usersController.keepLogin);
router.patch('/verified', readToken, usersController.accountVerification);
router.post('/forgotPassword', usersController.forgotPassword);
router.post("/resetPassword", usersController.resetPassword);
router.post("/changePassword", usersController.changePassword);
router.get('/get-address', readToken, usersController.getAddress);
router.post('/add-address', usersController.addAddress);
router.patch('/activing-user', usersController.activingUser);
router.patch('/non-activing-user', usersController.nonActivingUser);

module.exports = router