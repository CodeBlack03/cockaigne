const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    tour: {
      type: mongoose.Types.ObjectId,
      ref: "Tour",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  populate({
    path: "user",
    select: "name photo",
  });
});

reviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
  // console.log(Math.round(obj[0].averageRating * 10) / 10);
  try {
    const bootcamp = await this.model("Tour").findByIdAndUpdate(bootcampId, {
      averageRating: Math.round(obj[0].averageRating * 10) / 10,
    });
  } catch (error) {
    console.log(error);
  }
};

//Call get AverageRating after save
reviewSchema.post("save", function () {
  Reviews.getAverageRating(this.tour);
});

// Call get AverageRating before remove
reviewSchema.pre("delete", function () {
  Reviews.getAverageRating(this.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Export the model
module.exports = mongoose.model("Review", reviewSchema);
