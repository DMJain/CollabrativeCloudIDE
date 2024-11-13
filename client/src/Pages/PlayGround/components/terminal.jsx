import { Terminal as XTerminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import socket from "../../../utils/socket";

import "@xterm/xterm/css/xterm.css";

const Terminal = () => {
  const terminalRef = useRef();
  const isRendered = useRef(false);

  useEffect(() => {
    if (isRendered.current) return;
    isRendered.current = true;

    const term = new XTerminal({
      rows: 16,
      fontSize: 14, // Adjust font size as needed
      fontFamily: 'Courier New, monospace', // Set font family
      theme: {
        background: '#1e1e1e', // Dark background color
        foreground: '#d4d4d4', // Light gray font color
        cursor: '#d4d4d4', // Cursor color
        selection: '#264f78', // Selection background color
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#e5e5e5',
      }
    });

    term.open(terminalRef.current);

    term.onData((data) => {
      if (data.trim() === "clear") {
        term.clear(); // Clear the terminal content
        term.write("\r"); // Reset cursor position to beginning of current line
      } else {
        socket.emit("terminal:write", data); // Send other data to socket
      }
    });

    socket.on("terminal:data", (data) =>{
      term.write(data);
      term.scrollToBottom();
    });

    socket.emit('oneTime','data');
  }, []);

  return <div ref={terminalRef} id="terminal"/>;
};

export default Terminal;