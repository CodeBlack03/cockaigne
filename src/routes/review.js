const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const advancedResults = require("../middlewares/advancedResults");
const Review = require("../models/review");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Review, [
      {
        path: "User",
      },
      {
        path: "Tour",
      },
    ]),
    reviewController.getAllReviews
  )
  .post(
    authController.protect,
    // authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(authController.protect, reviewController.getReview)
  .delete(
    authController.protect,
    // authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );
module.exports = router;
