const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());

app.use(cors());

app.get("/", (req, res) =>
  res.json({ status: "success", message: "Server is up and running" })
);

const docker = new Docker();
let availablePorts = 9000;
// app.post("/playground/create", async (req, res) => {
//   const {image} = req.body;
//   try{
//     // await docker.pull(image);
//     await new Promise(resolve => setTimeout(resolve, 500));
//     const container = await docker.createContainer({
//       Image: image,
//       AttachStdin: true,
//       // Cmd: ['/bin/bash'],
//       HostConfig: {
//         PortBindings: {
//           '1000/tcp': [{
//               HostPort: availablePorts.toString()
//             }],
//           '3000/tcp': [{
//               HostPort: '3000'
//           }]
//         },
//         ExposedPorts: {
//           '1000/tcp': {}, // Declare the port exposed for the container
//           '3000/tcp': {}, // Prepare the container to expose this port in the future
//         },
//       }
//     });
//     availablePorts++;
//     await container.start();
//     res.status(201).json({success : true, data : {port: availablePorts-1, message : 'Container created successfully', containerId: container.id}});
//   } catch (error) {
//     console.error('Error creating container:', error);
//     res.status(500).send('Internal Server Error');
//  }
// })

const projectStorageDir = path.resolve('../Project'); // Replace with your actual path
const initialSetupDir = path.resolve('../BaseImage/ReactApp');

app.post("/playground/create", async (req, res) => {
  const { image, userId, projectId } = req.body; // Get userId and projectId from request
  try {
    const projectDir = `${projectStorageDir}/${userId}/${projectId}`;
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

app.post("/playground/delete", async (req, res) => {
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

module.exports = app;
