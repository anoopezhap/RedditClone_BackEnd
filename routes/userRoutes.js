const express = require("express");
const authController = require("./../controllers/authcontroller");
const userController = require("./../controllers/userController");

const router = express.Router();

//part of authentication
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/protect", authController.protect);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);
router.post(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

//part of individual user

router.post(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.updateMe
);
router.get(
  "/getAllMyThreads",
  authController.protect,
  userController.getAllMyThreads
);
module.exports = router;
