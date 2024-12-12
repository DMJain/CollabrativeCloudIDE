const express = require("express");
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const { Console } = require("console");
const PlaygroundService = require("../services/playground.services");

const router = express.Router();

const docker = new Docker();
let availablePorts = 9000;

const projectStorageDir = path.resolve('../Project'); // Replace with your actual path
const initialSetupDir = path.resolve('../BaseImage/ReactApp');

router.post("/create", async (req, res) => {
    const { image, projectId} = req.body; // Get userId and projectId from request
    try {
        if(!req.user) {return res.status(401).json({success: false, message: "Unauthorized"})}
        const userId = req.user._id;
        const project = await PlaygroundService.create({user: userId, name: "New Project"});
      const projectDir = `${projectStorageDir}/${userId}/${project._id}`;
      fs.mkdirSync(projectDir, { recursive: true });
  
      // Copy initial setup files to the project directory
      copyDir(initialSetupDir, projectDir);
  
      const container = await docker.createContainer({
        Image: image,
        AttachStdin: true,
        HostConfig: {
          PortBindings: {
            '1000/tcp': [{
              HostPort: availablePorts.toString()
            }],
            '3000/tcp': [{
              HostPort: '3000'
            }]
          },
          ExposedPorts: {
            '1000/tcp': {},
            '3000/tcp': {},
          },
          Binds: [ // Mount the project directory as a volume
            `${projectDir}:/app` 
          ]
        }
      });
  
      availablePorts++;
      await container.start();
      res.status(201).json({
        success: true,
        data: {
          port: availablePorts - 1,
          message: 'Container created successfully',
          containerId: container.id
        }
      });
    } catch (error) {
      console.error('Error creating container:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
  
    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
  
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath); // Recursive call for subdirectories
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  router.get("/list", async (req, res) => {
    const userId = req.user._id;
    try {
      const projects = await PlaygroundService.getAll({ user: userId });
        if(!projects){
            return res.status(404).json({status : 'error', error: 'No Projects'})
        }
        console.log('projects', projects)
        return res.status(200).json({ status: 'success', data: projects });
    } catch (error) {
      console.error('Error listing containers:', error);
      res.status(500).send('Internal Server Error');
    }
  })

  router.get("/playground/:id", async (req, res) => {
    const userId = req.user._id;
    const projectId = req.body.projectId;
    try {
      const project = await PlaygroundService.getOne({ id: projectId });
      if (!project) {
        return res.status(404).json({ status: 'error', error: 'Project not found' });
      }
      return res.status(200).json({ status: 'success', data: project });
    } catch (error) {
      console.error('Error getting project:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  router.post("/delete", async (req, res) => {
    const { containerId} = req.body;
    console.log("Container ID:", containerId);
    try {
      const container = docker.getContainer(containerId);
      await container.stop();
      await container.remove();
      console.log("Container deleted:", containerId);
  
      res.status(203).json({
          success: true,
          data: { message: "Container deleted" },
      });
  } catch (error) {
      console.error(`Error not deleted deleted:`, error);
      res.status(500).send("Internal Server Error");
  }
  });

module.exports = router;
