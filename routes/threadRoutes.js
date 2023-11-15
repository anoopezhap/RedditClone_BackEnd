const express = require("express");
const authController = require("./../controllers/authcontroller");
const threadController = require("./../controllers/threadController");

router = express.Router();

router.post(
  "/createThread",
  authController.protect,
  threadController.uplaodThreadPhoto,
  threadController.createThread
);
router.get("/getAllThreads", threadController.getAllThreads);
router.get("/:threadId", threadController.getThreadWithId);

router.patch(
  "/:threadId",
  authController.protect,
  authController.restrictTo("admin"),
  threadController.deleteThread
);

router.patch(
  "/:threadId/updateThread",
  authController.protect,
  threadController.editThread
);

module.exports = router;
