// import { useEffect, useState, useMemo } from "react";
// import "./styles.css";
// import Terminal from "./components/terminal";
// import FileTree from "./components/tree";
// import EditorComponent from "./components/editor";
// import Header from "./components/header";
// import { useSelector } from "react-redux";
// import {io} from 'socket.io-client';

// const Playground = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [treeData, setTreeData] = useState({});
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [error, setError] = useState(null);
//   const playground = useSelector((state) => state.playground);
//   const socket = useMemo(() => {
//     try {
//       return io(playground.playGroundHost);
//     } catch (error) {
//       console.error("Socket.IO connection error:", error);
//       return null;
//     }
//   }, [playground.playGroundHost]);

//   const fetchTreeData = async () => {
//     try {
//       const res = await fetch(`${playground.playGroundHost}files`);
//       if (!res.ok) throw new Error("Server not responding");
//       const data = await res.json();
//       setTreeData(data.tree);
//       setIsLoading(false);
//       // Stop loading once data is fetched
//     } catch (err) {
//       console.error("Error fetching tree data:", err);
//       throw err; // Rethrow for polling function to handle
//     }
//   };

//   const pollServer = () => {
//     let retryCount = 0; // Optional: Add a retry counter to limit retries

//     const interval = setInterval(async () => {
//       try {
//         await fetchTreeData();
//         socket.emit('oneTime','data');
//         clearInterval(interval); // Stop polling once the server responds
//       } catch (err) {
//         retryCount++;
//         if (retryCount >= 20) { // Optional: Max retries (e.g., 20 retries = 10 seconds)
//           clearInterval(interval);
//           setError("Unable to connect to the server. Please try again later.");
//         }
//       }
//     }, 500);
//   };

//   useEffect(() => {
//     pollServer();

//     socket.on("file:refresh", (path) => {
//       console.log(`File changed: ${path}`);
//       fetchTreeData();
//     });

//     return () => {
//       socket.off("file:refresh");
//       socket.disconnect();
//     };
//   }, []);

//   const handleFileSelect = (filePath) => {
//     setSelectedFile(filePath);
//   };

//   if (isLoading) {
//     return <div>Loading Playground...</div>;
//   }

//   if (error) {
//     return <div className="error-screen">{error}</div>;
//   }

//   return (
//     <div className="ide-container">
//       <div className="header">
//         <Header />
//       </div>
//       <div className="editor-container">
//         <div className="files">
//           <FileTree tree={treeData} onFileSelect={handleFileSelect} />
//         </div>
//         <div className="editor">
//           <EditorComponent selectedFile={selectedFile} socket={socket} />
//         </div>
//       </div>
//       <div className="terminal-container">
//         <Terminal socket={socket} />
//       </div>
//     </div>
//   );
// };

// export default Playground;

import { useEffect, useState } from "react";
import "./styles.css";
import Terminal from "./components/terminal";
import FileTree from "./components/tree";
import EditorComponent from "./components/editor";
import Header from "./components/header";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const Playground = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [treeData, setTreeData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [socket, setSocket] = useState(null);

  const playground = useSelector((state) => state.playground);

  const fetchTreeData = async () => {
    try {
      const res = await fetch(`${playground.playGroundHost}files`);
      if (!res.ok) throw new Error("Server not responding");
      const data = await res.json();
      setTreeData(data.tree);
      setIsLoading(false);
      return true; // Indicate success
    } catch (err) {
      console.error("Error fetching tree data:", err);
      return false; // Indicate failure
    }
  };

  const pollServer = () => {
    let retryCount = 0;

    const interval = setInterval(async () => {
      const isAvailable = await fetchTreeData();
      if (isAvailable) {
        setIsBackendReady(true);
        clearInterval(interval); // Stop polling once the server is ready
      } else {
        retryCount++;
        if (retryCount >= 20) { // Retry limit
          clearInterval(interval);
          setError("Unable to connect to the server. Please try again later.");
        }
      }
    }, 500);
  };

  useEffect(() => {
    pollServer();
  }, []);

  useEffect(() => {
    if (isBackendReady) {
      // Initialize Socket.IO only when the backend is ready
      const socketInstance = io(playground.playGroundHost);

      // Listen for socket events
      socketInstance.on("file:refresh", (path) => {
        console.log(`File changed: ${path}`);
        fetchTreeData(); // Refresh tree data when a file changes
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.off("file:refresh");
        socketInstance.disconnect();
      };
    }
  }, [isBackendReady]);

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
  };

  if (isLoading) {
    return <div>Loading Playground...</div>;
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  return (
    <div className="ide-container">
      <div className="header">
        <Header />
      </div>
      <div className="editor-container">
        <div className="files">
          <FileTree tree={treeData} onFileSelect={handleFileSelect} />
        </div>
        <div className="editor">
          <EditorComponent selectedFile={selectedFile} socket={socket} />
        </div>
      </div>
      <div className="terminal-container">
        {socket ? <Terminal socket={socket} /> : <div>Initializing terminal...</div>}
      </div>
    </div>
  );
};

export default Playground;