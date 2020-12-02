const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const AppError = require("../utils/AppError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30days",
  });
};

const createSignToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  console.log(req.body);
  user = new User(req.body);
  await user.save();
  createSignToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return next(new AppError("Please provide required credentials", 400));
  }
  const user = await User.findByCredentials(req.body.email, req.body.password);
  if (!user) {
    return next(new AppError("Invalid email or password!", 401));
  }
  console.log(user);
  createSignToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now() + 10 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("token", "loggedOut", options);
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError("User belonging to this token no longer exists", 400)
    );
  }
  if (!User.findOne({ email: user.email, password: user.password })) {
    return next(
      new AppError("Password recently changed, please login again", 401)
    );
  }
  req.user = user;
  req.token = token;
  next();
});

exports.restrictTo = (...roles) => {};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  //Get reset token
  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/auth/user/resetpassword/${resetToken}`;
  const message = `You are receiving this email because you have requested the reset of a password.
   Please make a PUT request to: \n\n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });
    res.status(200).json({ status: "success", message: "email Sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await Users.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw next(new AppError("Token is invalid or expired", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  res.status(204).json({
    status: "success",
    message: "Password updated Successfully",
  });
  createSignToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await Users.findByCredentials(
    req.user.email,
    req.body.currentPassword
  );

  //Check current password
  if (!user) {
    return next(new AppError("Password Incorrect", 401));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSignToken(user, 200, req, res);
});
