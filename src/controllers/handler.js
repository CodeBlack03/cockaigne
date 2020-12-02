const express = require("express");
const advancedResults = require("../middlewares/advancedResults");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    res.status(200).json({
      status: "success",
      data: res.advancedResults,
    });
  });
};

exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    const object = Model.findById(req.params.id).populate(popOptions);
    const doc = await object;
    if (!doc) {
      return next(new AppError("No document found!", 404));
    }
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    let doc = await Model.findOne({ name: req.body.name });

    if (doc) {
      return next(
        new AppError(`Document is already present in the database`, 400)
      );
    }

    const object = new Model(req.body);
    console.log(object);
    await object.save();
    res.status(201).json({
      status: "success",
      data: object,
    });
  });
};

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const object = await Model.findById(req.params.id);
    if (!object) {
      return next(new AppError("No document found!", 404));
    }
    await object.remove();
    res.status(200).json({
      status: "success",
      data: object,
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const object = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (req.file) {
      req.object.photo = req.file.filename;
    }
    res.status(200).json({
      status: "success",
      data: object,
    });
  });
};
