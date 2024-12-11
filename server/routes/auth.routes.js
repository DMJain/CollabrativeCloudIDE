const express = require("express");

const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/sign-up", authController.signUp); // Post Route for signing UP to application
router.post("/sign-in", authController.signIn); //Post Route for siging In to application

router.get("/current-user", authController.CurrentUser);

module.exports = router;
