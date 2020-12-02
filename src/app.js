const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const xss = require("xss");
const globalErrorHandler = require("./controllers/errorController");
const userRoute = require("./routes/user");
const tourRoute = require("./routes/tour");
const bookingRoute = require("./routes/booking");
const reviewRoute = require("./routes/review");
const app = express();

//GLOBAL MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again after some time",
});
app.use("/api", limiter);
app.use(helmet());
app.use(express.json());

//Data sanitization against XSS
// app.use(xss());

app.use(express.static(__dirname + "public"));
app.use(globalErrorHandler);

//ROUTES
app.use("/api/users", userRoute);
app.use("/api/tours", tourRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;
