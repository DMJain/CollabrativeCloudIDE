import { useEffect, useState } from "react";
import "./styles.css";
import Terminal from "./components/terminal";
import FileTree from "./components/tree";
import EditorComponent from "./components/editor";
import Header from "./components/header";
import socket from "../../utils/socket";

const Playground = () => {
  const [treeData, setTreeData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchTreeData = () => {
    fetch("http://localhost:1000/files")
      .then((res) => res.json())
      .then((data) => {
        setTreeData(data.tree);
      })
      .catch((err) => console.error("Error fetching tree data:", err));
  };

  useEffect(() =>{
    fetchTreeData();

    socket.on("file:refresh", (path) => {
      console.log(`File changed: ${path}`);
      fetchTreeData();
    });

    // Cleanup: Remove the listener when the component unmounts
    return () => {
      socket.off("file:refresh");
    };
  }, [])

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
  };

  return (
    <div className="ide-container">
      <div className="header">
        <Header />
      </div>
      <div className="editor-container">
        <div className="files">
          <FileTree tree={treeData} onFileSelect={handleFileSelect}/>
        </div>
        <div className="editor">
          <EditorComponent selectedFile={selectedFile} />
        </div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>
  );
}

export default Playground;