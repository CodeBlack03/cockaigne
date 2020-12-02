const express = require("express");
const Tour = require("../models/tour");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const handler = require("../controllers/handler");
const tour = require("../models/tour");

exports.getAllTours = handler.getAll(Tour);
exports.getTour = handler.getOne(Tour, { path: "reviews" });
exports.createTour = handler.createOne(Tour);
exports.updateTour = handler.updateOne(Tour);
exports.deleteTour = handler.deleteOne(Tour);

exports.getTopTour = catchAsync(async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-averageRating,price";
  req.query.select = "name,price,averageRating,description,difficulty";
  next();
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [latitude, longitude] = latlng.split(",");
  if (!latitude || !longitude) {
    return next(
      new AppError("please provide latitude and longitude in format", 400)
    );
  }
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  const multiplier = unit === "mi" ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distances: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    results: tour.length,
    data: {
      data: distances,
    },
  });
});
