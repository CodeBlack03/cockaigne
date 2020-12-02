const express = require("express");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const handler = require("./handler");

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: req.user,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  ); //Update allowed or not
  if (!isValidOperation) {
    return res.status(400).send({
      error: "Invalid Updates!",
    });
  }

  const id = req.user._id;
  updates.forEach((update) => {
    req.user[update] = req.body[update];
  });
  if (req.file) req.user.photo = req.file.filename;
  await req.user.save();

  res.status(200).json({
    status: "success",
    data: req.user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await req.user.remove();
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.createUser = handler.createOne(User);
exports.getUser = handler.getOne(User);
exports.getAllUsers = handler.getAll(User);
exports.updateUser = handler.updateOne(User);
exports.deleteUser = handler.deleteOne(User);
