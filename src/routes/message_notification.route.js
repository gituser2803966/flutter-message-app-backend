const router = require("express").Router();
const messageNotificationController = require("../controllers/message_notification.controller");
const isAuth = require("../middlewares/auth");

router.get(
  "/get-message-notifications",
  isAuth,
  messageNotificationController.getMessageNotification
);
router.get(
  "/update-new-message-count",
  isAuth,
  messageNotificationController.updateNewMessageCount
);

module.exports = router;
