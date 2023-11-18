const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');

router
    .route('/top-5-cheap')
    .get(tourController.createAlias, tourController.getTours);

router
    .route('/tour-stats')
    .get(tourController.tourStats)

router
    .route('/monthly-plan/:year')
    .get(tourController.monthlyPlan)

router
    .route('/')
    .get(tourController.getTours)
    .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;