const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');

router
    .route('/api/v1/tour')
    .get(tourController.getTours)
    .post(tourController.createTour)

router
    .route('/api/v1/tour/:id')
    .get(tourController.getTourById)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router;