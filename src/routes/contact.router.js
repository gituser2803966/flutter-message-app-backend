const router = require("express").Router();
const contactController = require("../controllers/contact.controller");
const isAuth = require("../middlewares/auth");

router.get("/get-lists", isAuth, contactController.getContactList);

module.exports = router;
