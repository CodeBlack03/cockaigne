const express = require("express");
const bookingController = require("../controllers/bookingController");
const advancedResults = require("../middlewares/advancedResults");
const Booking = require("../models/booking");
const authController = require("../controllers/authController");
const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(
    advancedResults(Booking, { path: "user" }),
    bookingController.getAllBookings
  )
  .post(bookingController.createBooking);

router
  .route("/:id")
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
