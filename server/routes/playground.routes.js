const express = require("express");

const router = express.Router();

const {createNewPlayground, getUserProjectList, createExistingPlayground, deleteRunningPlayGround} = require('../controllers/playground.controller')

router.post("/create", createNewPlayground);

  router.get("/list", getUserProjectList)

  router.post("/project/:id", createExistingPlayground);
  
  router.post("/delete", deleteRunningPlayGround);

  router.post("/invite/accept/:playgroundid", async (req, res) => {
    
  })

  

module.exports = router;
