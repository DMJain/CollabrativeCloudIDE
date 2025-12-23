# Collaborative Cloud IDE

A powerful, real-time collaborative Integrated Development Environment (IDE) that runs in the browser. Built with the MERN stack and Docker, it allows users to write code, manage files, and execute commands in a secure, isolated environment.

## Features

-   **Real-time Collaboration**: Code with others in real-time using operational transformation (via Socket.io).
-   **File System Management**: Create, read, update, and delete files and directories.
-   **Integrated Terminal**: Execute commands directly in the browser (powered by Docker containers).
-   **Syntax Highlighting**: Support for multiple languages using Monaco Editor.
-   **Secure Execution**: User code runs in isolated Docker containers.

## System Architecture

### Docker Orchestration
The core of the isolation mechanism relies on **Docker**.
-   **Controller**: The `server/controllers/playground.controller.js` manages the lifecycle of containers using `dockerode`.
-   **Dynamic Provisioning**: When a user opens a project, a dedicated Docker container is spun up.
-   **Networking**:
    -   Each container exposes port `1000` (for the internal runner agent) and `3000` (for the user's preview server).
    -   The host machine maps these to dynamic available ports (starting from 9000).
-   **Persistence**: The project files are stored on the host machine at `../Project/{userId}/{projectId}` and mounted into the container at `/app`. This ensures that even if the container is destroyed, the user's code is safe.

### Data Flow
1.  **Control Plane (HTTP)**:
    -   The client sends requests (create project, get list) to the Main Server (Express).
    -   The Main Server talks to the Docker Daemon to manage containers.
2.  **Data Plane (Socket.io)**:
    -   Once a container is running, the Client connects **directly** to the container's `runner` agent via Socket.io (on the dynamically mapped port).
    -   **File Operations**: File saves/reads are sent over this socket. The `runner` writes to the mounted volume.
    -   **Terminal**: Keypresses are sent to the `runner`, which pipes them into a `node-pty` process (pseudo-terminal). Output is streamed back to the client.
    -   **Cursors**: Cursor movements are broadcasted to other users in the same room via the `runner`.

### Execution Environment
Inside each container runs a lightweight agent called the **Runner** (`BaseImage/runner/index.js`).
-   It acts as a bridge between the frontend and the container's shell/filesystem.
-   It uses `chokidar` to watch for file changes and syncs them.
-   It uses `node-pty` to spawn a shell (`sh` or `bash`) allowing users to run commands like `npm install` or `node index.js`.

## Tech Stack

### Client
-   **Framework**: React (Vite)
-   **State Management**: Redux Toolkit
-   **Styling**: TailwindCSS, DaisyUI
-   **Editor**: Monaco Editor
-   **Communication**: Socket.io-client

### Server
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Containerization**: Dockerode (Docker API)
-   **Communication**: Socket.io

### Infrastructure
-   **Docker**: For container orchestration and code execution isolation.
-   **Docker Compose**: For managing multi-container applications.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v18+ recommended)
-   [Docker](https://www.docker.com/) (Desktop or Engine)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas connection string)

## Installation & Running

### Using Docker Compose (Recommended)

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd CollaborativeCloudIDE
    ```

2.  Start the application:
    ```bash
    docker-compose up --build
    ```

3.  Access the application:
    -   Frontend: `http://localhost:5173`
    -   Backend: `http://localhost:1001`

### Manual Setup

#### Server

1.  Navigate to the server directory:
    ```bash
    cd server
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env` file in the `server` directory and add your MongoDB URI and other configs.

4.  Start the server:
    ```bash
    npm run dev
    ```

#### Client

1.  Navigate to the client directory:
    ```bash
    cd client
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
