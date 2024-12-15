// import { useEffect, useState, useRef } from "react";
// import "./styles.css";
// import Terminal from "./components/terminal";
// import FileTree from "./components/tree";
// import EditorComponent from "./components/editor";
// import Header from "./components/header";
// import { useSelector } from "react-redux";
// import { io } from "socket.io-client";
// import { useDeletePlayGround } from "../../hooks/playGround.hooks";
// import { useNavigate, useLocation } from "react-router-dom";

// const Playground = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [treeData, setTreeData] = useState({});
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [error, setError] = useState(null);
//   const [isBackendReady, setIsBackendReady] = useState(false);
//   const [socket, setSocket] = useState(null);
//   const {mutateAsync : deletePlayGround} = useDeletePlayGround();
//   const beforeUnloadHandled = useRef(false);
//   const navigate = useNavigate();
//   const location = useLocation();

//   const playGroundIdRef = useRef(null);
//   const playground = useSelector((state) => state.playground);

//   useEffect(() => {
//     playGroundIdRef.current = playground.playGroundID; // Update the ref value
//   }, []);

//   const fetchTreeData = async () => {
//     try {
//       const res = await fetch(`${playground.playGroundHost}files`);
//       if (!res.ok) throw new Error("Server not responding");
//       const data = await res.json();
//       setTreeData(data.tree);
//       setIsLoading(false);
//       return true; // Indicate success
//     } catch (err) {
//       console.error("Error fetching tree data:", err);
//       return false; // Indicate failure
//     }
//   };

//   const pollServer = () => {
//     let retryCount = 0;

//     const interval = setInterval(async () => {
//       const isAvailable = await fetchTreeData();
//       if (isAvailable) {
//         setIsBackendReady(true);
//         clearInterval(interval); // Stop polling once the server is ready
//       } else {
//         retryCount++;
//         if (retryCount >= 20) { // Retry limit
//           clearInterval(interval);
//           setError("Unable to connect to the server. Please try again later.");
//         }
//       }
//     }, 500);
//   };

//   useEffect(() => {
//     pollServer();
//   }, []);

//   useEffect(() => {
//     if (isBackendReady) {
//       // Initialize Socket.IO only when the backend is ready
//       const socketInstance = io(playground.playGroundHost);

//       // Listen for socket events
//       socketInstance.on("file:refresh", (path) => {
//         console.log(`File changed: ${path}`);
//         fetchTreeData(); // Refresh tree data when a file changes
//       });

//       setSocket(socketInstance);

//       return () => {
//         socketInstance.off("file:refresh");
//         socketInstance.disconnect();
//       };
//     }
//   }, [isBackendReady]);

//   const handleCleanup = async () => {
//     if (beforeUnloadHandled.current) return;

//     beforeUnloadHandled.current = true;
//     console.log("Cleanup triggered");

//     if (playGroundIdRef.current) {
//       try {
//         console.log("Deleting playground:", playGroundIdRef.current);
//         await deletePlayGround({ containerId: playGroundIdRef.current });
//       } catch (error) {
//         console.error("Error deleting playground:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       handleCleanup();
//       event.preventDefault();
//       event.returnValue = ""; // Compatibility for older browsers
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       console.log("Cleanup triggered");
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);

//   useEffect(() => {
//     // Detect route changes
//     return () => {
//       // Cleanup when the component unmounts
//       handleCleanup();
//     };
//   }, [location]);

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
//     <div className="flex flex-col h-screen">
//       <div className="header h-14">
//         <Header />
//       </div>
//       <div className="editor-container flex-1 flex overflow-hidden border-t-2 border-primary">
//         <div className="files w-1/6 border-r-2 overflow-y-auto p-3">
//           <FileTree tree={treeData} onFileSelect={handleFileSelect} />
//         </div>
//         <div className="editor flex-grow overflow-y-auto">
//           <EditorComponent selectedFile={selectedFile} socket={socket} />
//         </div>
//       </div>
//       <div className="terminal-container h-1/4 border-t-2 border-primary">
//         {socket ? <Terminal socket={socket} /> : <div>Initializing terminal...</div>}
//       </div>
//     </div>
//   );
// };

// export default Playground;

import { useEffect, useState, useRef } from "react";
import "./styles.css";
import Terminal from "./components/terminal";
import FileTree from "./components/tree";
import EditorComponent from "./components/editor";
import Header from "./components/header";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useDeletePlayGround } from "../../hooks/playGround.hooks";
import { useNavigate, useLocation } from "react-router-dom";

const Playground = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [treeData, setTreeData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [socket, setSocket] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false); // New state
  const { mutateAsync: deletePlayGround } = useDeletePlayGround();
  const beforeUnloadHandled = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const playGroundIdRef = useRef(null);
  const playground = useSelector((state) => state.playground);

  useEffect(() => {
    playGroundIdRef.current = playground.playGroundID; // Update the ref value
  }, [playground.playGroundID]);

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
        if (retryCount >= 20) {
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

      setHasInitialized(true); // Mark as initialized

      return () => {
        socketInstance.off("file:refresh");
        socketInstance.disconnect();
      };
    }
  }, [isBackendReady]);

  const handleCleanup = async () => {
    if (beforeUnloadHandled.current || !hasInitialized) return; // Skip if not initialized

    beforeUnloadHandled.current = true;
    console.log("Cleanup triggered");

    if (playGroundIdRef.current) {
      try {
        console.log("Deleting playground:", playGroundIdRef.current);
        await deletePlayGround({ containerId: playGroundIdRef.current });
      } catch (error) {
        console.error("Error deleting playground:", error);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      handleCleanup();
      event.preventDefault();
      event.returnValue = ""; // Compatibility for older browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      console.log("Cleanup triggered");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasInitialized]);

  useEffect(() => {
    // Detect route changes
    return () => {
      // Cleanup when the component unmounts
      handleCleanup();
    };
  }, [location, hasInitialized]);

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
    <div className="flex flex-col h-screen">
      <div className="header h-14">
        <Header />
      </div>
      <div className="editor-container flex-1 flex overflow-hidden border-t-2 border-primary">
        <div className="files w-1/6 border-r-2 overflow-y-auto p-3">
          <FileTree tree={treeData} onFileSelect={handleFileSelect} />
        </div>
        <div className="editor flex-grow overflow-y-auto">
          <EditorComponent selectedFile={selectedFile} socket={socket} />
        </div>
      </div>
      <div className="terminal-container h-1/4 border-t-2 border-primary">
        {socket ? <Terminal socket={socket} /> : <div>Initializing terminal...</div>}
      </div>
    </div>
  );
};

export default Playground;