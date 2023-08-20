const express = require('express');

const Controller = require('./../controller/userController');
const authController = require('./../controller/authController.js');

const router =express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.patch('/updateMe', authController.protect, Controller.updateMe);
router.delete('/deleteMe', authController.protect, Controller.deleteMe);

router.route('/').get(Controller.getAllUser).post(Controller.createUser);

router.route('/:id').get(Controller.getUser).patch(Controller.updateUser).delete(Controller.deleteUser);

module.exports = router;