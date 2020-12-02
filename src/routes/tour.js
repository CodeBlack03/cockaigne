const express = require("express");
const Tour = require("../models/tour");
const authController = require("../controllers/authController");
const tourController = require("../controllers/tourController");
const router = express.Router();
const advancedResults = require("../middlewares/advancedResults");
const reviewRouter = require("./review");

router.use("/:tourId/reviews", reviewRouter);

router.route("/tours-within/:distance/center/:latlng/unit/:unit").get(
  advancedResults(Tour, [
    {
      path: "reviews",
    },
    {
      path: "user",
    },
  ]),
  tourController.getToursWithin
);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router
  .route("/")
  .get(
    advancedResults(Tour, {
      path: "user",

      select: "name",
    }),
    tourController.getAllTours
  )
  .post(
    authController.protect,
    // authController.restrictTo("admin", "lead-guide", "guide"),
    tourController.createTour
  );

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    // authController.restrictTo("admin", "lead-guide"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    // authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = router;
