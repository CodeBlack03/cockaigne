const express = require("express");
const Review = require("../models/review");
const handler = require("./handler");

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.getAllReviews = handler.getAll(Review);
exports.getReview = handler.getOne(Review, { path: "user" });
exports.createReview = handler.createOne(Review);
exports.updateReview = handler.updateOne(Review);
exports.deleteReview = handler.deleteOne(Review);
