const router = require("express").Router();
const useController = require("../controllers/user.controller");
const isAuth = require("../middlewares/auth");

router.post("/create", useController.createUser);
router.post("/sign-in", useController.userSignIn);
router.post("/sign-out", isAuth, useController.signOut);

router.post("/refresh-token", useController.refreshToken);

///get all user
router.get("/get-lists", isAuth, useController.getAllUser);

///search all user
router.get("/search", isAuth, useController.search);

///get user profile
router.get("/profile", isAuth, useController.getUserProfile);

router.get("/:id", isAuth, useController.getUserById);

module.exports = router;
