const express = require('express');

const Controller = require('./../controller/tourController');
const authController = require('./../controller/authController');

const router =express.Router();
// router.param('id', Controller.checkID);
router.route('/top-5-cheap-tours').get(Controller.aliasing , Controller.getAllTours); 
router.route('/tour-stats').get(Controller.getTourStats);
router.route('/monthly_plan/:year').get(Controller.getMonthlyPlan);
router.route('/').get(authController.protect, Controller.getAllTours).post(Controller.createTour);
router.route('/:id').get(Controller.getTour).patch(Controller.updateTour).delete(authController.protect, authController.restrictTo('admin','lead-guide'),Controller.deleteTour);

module.exports = router;
