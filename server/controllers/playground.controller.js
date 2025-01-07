const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const PlaygroundService = require("../services/playground.services");
const { generateInviteToken } = require('../lib/utils/encrypt');

const docker = new Docker();
let availablePorts = 9000;

const projectStorageDir = path.resolve('../Project'); // Replace with your actual path
const initialSetupDir = path.resolve('../BaseImage/ReactApp');

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

async function createDockerContainer(image, projectDir){
    try {
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
          return container;
    } catch(err) {
        throw new Error(`NOT ABLE TO CREATE CONTAINER ${err}`)
    }
}

async function createNewPlayground(req, res) {
    const { image, name} = req.body; // Get userId and projectId from request
    try {
        if(!req.user) {return res.status(401).json({success: false, message: "Unauthorized"})}
        const userId = req.user._id;
        const project = await PlaygroundService.create({user: userId, name: name, image: image, hostPort: availablePorts, envPort: 3000});
      const projectDir = `${projectStorageDir}/${userId}/${project._id}`;
      // fs.mkdirSync(projectDir, { recursive: true });
  
      // Copy initial setup files to the project directory
      copyDir(initialSetupDir, projectDir);
  
      const container = await createDockerContainer(image, projectDir);
      const inviteCode = generateInviteToken(project._id.toString());

      await PlaygroundService.updateInviteCode({id:project._id, code: inviteCode});

  
      availablePorts++;
      await container.start();
      const containerInfo = await container.inspect();
      const containerIp = containerInfo.NetworkSettings.Networks.bridge.IPAddress;
      console.log("Container Info:", containerIp);
      if (!containerIp) {
        throw new Error('Container IP not found');
      }

      await PlaygroundService.updateContainerIP({id: project._id, containerIP: containerIp});
      await PlaygroundService.changeRunningStatus({_id: project._id, runningStatus: 'OPEN'});
      return res.status(201).json({
        success: true,
        data: {
          port: availablePorts - 1,
          message: 'Container created successfully',
          containerId: container.id,
          containerIp: containerIp,
        }
      });
    } catch (error) {
      console.error('Error creating container:', error);
      return res.status(500).send('Internal Server Error');
    }
}

async function getUserProjectList(req, res) {
  if(!req.user) {return res.status(401).json({success: false, message: "Unauthorized"})}
  const userId = req.user._id;
    try {
      const projects = await PlaygroundService.getAll({ user: userId });
        if(!projects){
            return res.status(404).json({status : 'error', error: 'No Projects'})
        }
        return res.status(200).json({ status: 'success', data: projects });
    } catch (error) {
      console.error('Error listing containers:', error);
      return res.status(500).send('Internal Server Error');
    }
}

async function createExistingPlayground(req, res) {
    const projectId = req.params.id;
    try {
      let project = await PlaygroundService.getOne({ id: projectId });
      if (!project) {
        return res.status(404).json({ status: 'error', error: 'Project not found' });
      }
      const projectDir = `${projectStorageDir}/${project.user}/${project._id}`;
  
      const container = await createDockerContainer(project.image, projectDir);

     

      project = await PlaygroundService.updateHostPort({ id: projectId, hostPort: availablePorts });
      
      availablePorts++;
      await container.start();

      const containerInfo = await container.inspect();
      const containerIp = containerInfo.NetworkSettings.Networks.bridge.IPAddress;
      console.log("Container Info:", containerIp);
      if (!containerIp) {
        throw new Error('Container IP not found');
      }

      await PlaygroundService.updateContainerIP({id: project._id, containerIP: containerIp});

      await PlaygroundService.changeRunningStatus({_id: project._id, runningStatus: 'OPEN'});
      return res.status(201).json({
        success: true,
        data: {
          port: availablePorts - 1,
          message: 'Container created successfully',
          containerId: container.id,
          containerIp: containerIp,
        }
      });
    } catch (error) {
      console.error('Error getting project:', error);
      return res.status(500).send('Internal Server Error');
    }
}

async function deleteRunningPlayGround(req, res) {
    const { containerId, projectId} = req.body;
    console.log("Container ID:", containerId);
    try {
      if (containerId === 'INVITED') {
        return;
      }
      const container = docker.getContainer(containerId);
      await container.stop();
      await container.remove();
      await PlaygroundService.changeRunningStatus({id: projectId, runningStatus: 'CLOSED'});
      console.log("Container deleted:", containerId);
  
      return res.status(203).json({
          success: true,
          data: { message: "Container deleted" },
      });
  } catch (error) {
      console.error(`Error not deleted deleted:`, error);
      return res.status(500).send("Internal Server Error");
  }
}

async function joinPlaygroundInvite(req, res) {
  const {inviteCode} = req.body;
  try{
    let project = await PlaygroundService.getOneByInviteCode({ inviteCode: inviteCode });
    if (!project) {
      return res.status(404).json({ status: 'error', error: 'Project not found' });
    }
    if (!project.runningStatus === 'CLOSED') {
      return res.status(404).json({ status: 'error', error: 'Project not running' });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        port: project.hostPort,
        projectId: project._id,
        message: 'Container Invite confirm',
        containerId: 'INVITED'
       }
    });

  }catch{
    console.log("Error in INVITE", err);
    return res.status(500).send("Internal Server Error");
  }
}

async function getInviteCode(req, res) {
  const {projectId} = req.body;
  try {
    let project = await PlaygroundService.getOne({ id: projectId });
    if (!project) {
      return res.status(404).json({ status: 'error', error: 'Project not found' });
    }
    const inviteCode = project.inviteCode;
    return res.status(200).json({
      success: true,
      data: {
        inviteCode: inviteCode,
        message: 'Invite code generated'
      }
    });
  } catch (error) {
    console.error('Error generating Invite Code', error);
    return res.status(500).send('Internal Server Error');
  }
}



module.exports = {
  createNewPlayground, 
  getUserProjectList, 
  createExistingPlayground, 
  deleteRunningPlayGround,
  joinPlaygroundInvite,
  getInviteCode
}