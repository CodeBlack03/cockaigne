const express = require("express");
const Booking = require("../models/booking");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const handler = require("./handler");

exports.createBooking = handler.createOne(Booking);
exports.getBooking = handler.getOne(Booking);
exports.getAllBookings = handler.getAll(Booking);
exports.updateBooking = handler.updateOne(Booking);
exports.deleteBooking = handler.deleteOne(Booking);
