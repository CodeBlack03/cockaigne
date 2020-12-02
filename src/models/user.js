const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  mobile: {
    type: String,

    unique: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
    required: [true, "Please provide your role!"],
  },
  password: {
    type: String,
    required: true,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (element) {
        return element === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await Users.findOne({ email: email });

  if (!user) {
    throw new Error("No user found");
  }
  console.log(email, password);
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login, Incorrect password");
  }
  return user;
};

userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hash Token
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  user.passwordConfirm = undefined;

  next();
});
userSchema.pre("remove", async function () {
  const user = this;
  const tour = await Tour.find({ user: user._id });
  await tour.remove();
});
//Export the model
const Users = mongoose.model("User", userSchema);
module.exports = mongoose.model("User", userSchema);
