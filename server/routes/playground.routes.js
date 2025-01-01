const express = require("express");

const router = express.Router();

const {createNewPlayground, getUserProjectList, createExistingPlayground, deleteRunningPlayGround, joinPlaygroundInvite, getInviteCode} = require('../controllers/playground.controller')

router.post("/create", createNewPlayground);

  router.get("/list", getUserProjectList)

  router.post("/project/:id", createExistingPlayground);
  
  router.post("/delete", deleteRunningPlayGround);

  router.post("/invite/create", getInviteCode);
  router.post("/invite/join", joinPlaygroundInvite);

  

module.exports = router;
