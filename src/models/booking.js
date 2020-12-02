const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Export the model
module.exports = mongoose.model("Booking", bookingSchema);
