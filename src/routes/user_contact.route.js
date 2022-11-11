const router = require("express").Router();
const userContactController = require("../controllers/user_contact.controller");
const isAuth = require("../middlewares/auth");

router.get("/get-lists", isAuth, userContactController.getUserContactList);

module.exports = router;
