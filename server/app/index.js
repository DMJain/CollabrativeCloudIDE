const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');

const app = express();

app.use(express.json());

app.use(cors());

app.get("/", (req, res) =>
  res.json({ status: "success", message: "Server is up and running" })
);

const docker = new Docker();
let availablePorts = 9000;
app.post("/playground/create", async (req, res) => {
  const {image} = req.body;
  try{
    // await docker.pull(image);
    await new Promise(resolve => setTimeout(resolve, 500));
    const container = await docker.createContainer({
      Image: image,
      AttachStdin: true,
      // Cmd: ['/bin/bash'],
      HostConfig: {
        PortBindings: {
          '1000/tcp': [{
              HostPort: availablePorts.toString()
            }]
        }
      }
    });
    availablePorts++;
    await container.start();
    res.status(201).json({success : true, data : {port: availablePorts-1, message : 'Container created successfully', containerId: container.id}});
  } catch (error) {
    console.error('Error creating container:', error);
    res.status(500).send('Internal Server Error');
 }
})

module.exports = app;
