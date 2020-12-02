const express = require("express");
const User = require("../models/user");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const advancedResults = require("../middlewares/advancedResults");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.get("/logout", authController.logout);
router.patch("/updateMyPassword", authController.updatePassword);
router.delete("/deleteMe", userController.deleteMe);
router.get("/me", userController.getMe);
router.patch("/me", userController.updateMe);

router
  .route("/")
  .get(advancedResults(User), userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
