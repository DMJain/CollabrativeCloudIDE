import { Terminal as XTerminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import PropTypes from 'prop-types';


import "@xterm/xterm/css/xterm.css";
import { BsBluetooth } from "react-icons/bs";

const Terminal = ({socket}) => {

  const terminalRef = useRef();
  const isRendered = useRef(false);

  useEffect(() => {
    if (!socket) return;
    if (isRendered.current) return;
    isRendered.current = true;

    const term = new XTerminal({
      rows: 14,
      fontSize: 14, // Adjust font size as needed
      fontFamily: 'Courier New, monospace',
       // Set font family
      theme: {
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
    //comment
    socket.emit('oneTime','data');
  }, []);

  return <div ref={terminalRef} id="terminal" className="xterm "/>;
};
Terminal.propTypes = {
  socket: PropTypes.object,
};

export default Terminal;