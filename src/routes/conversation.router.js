const router = require("express").Router();
const conversationController = require("../controllers/conversation.controller");
const isAuth = require("../middlewares/auth");

router.get("/get-lists", isAuth, conversationController.getConversationList);
router.get(
  "/addNewMessageCountField",
  isAuth,
  conversationController.addNewMessageCountField
);

module.exports = router;
