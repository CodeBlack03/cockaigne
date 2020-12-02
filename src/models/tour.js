const mongoose = require("mongoose"); // Erase if already required
const Review = require("./review");
const Booking = require("./booking");

// Declare the Schema of the Mongo model
var tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
    },
    stops: {
      type: Number,
      // required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
    },
    nextDate: {
      type: Date,
      // required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    averageRating: {
      type: Number,
      min: 1.0,
      max: 5.0,
      set: (val) => Math.round(val * 10) / 10,
    },
    price: {
      type: Number,
      required: true,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        //GeoJSON
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.pre("remove", async function () {
  const tour = this;
  const bookings = Booking.find({ tour: tour._id });
  const reviews = Review.find({ tour: tour._id });
  await bookings.remove();
  await reviews.remove();
});

// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });
//Export the model
module.exports = mongoose.model("Tour", tourSchema);
