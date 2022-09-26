const router = require("express").Router();
const useController = require("../controllers/userController");
const isAuth = require("../middlewares/auth");

router.post("/create", useController.createUser);
router.post("/sign-in", useController.userSignIn);
router.post("/sign-out", isAuth, useController.signOut);

router.post("/refresh-token", useController.refreshToken);

//get all user ====>>>>> need accessToken valid.
router.get("/get-lists", isAuth, useController.getAllUser);

//get user profile ====>>>>> need accessToken valid.
router.get("/profile", isAuth, useController.getUserProfile);

module.exports = router;
