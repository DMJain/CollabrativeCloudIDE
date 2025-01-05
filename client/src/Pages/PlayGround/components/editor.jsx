import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import { getFileMode } from '../../../utils/getFileMode';
import { useSelector } from 'react-redux';
import './editor.css';

const EditorComponent = ({ selectedFile, socket }) => {
    const plaground = useSelector((state) => state.playground);
    const [content, setContent] = useState('// Select a file to view its content');
    const [language, setLanguage] = useState('');
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [decorations, setDecorations] = useState([]);
  const cursorsRef = useRef(new Map());

    const autosaveTimer = useRef(null);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        };
    }, []);

    useEffect(() => {
        if (!selectedFile) return;
    
        // Clear cursor data and decorations on file change
        // setDecorations([]);
        // cursorsRef.current.clear();
    }, [selectedFile]);
      

    useEffect(() => {
        if (!socket) return;
        if (selectedFile) {
            // Fetch file content when a file is selected
            fetch(`${plaground.playGroundHost}files/content?path=${encodeURIComponent(selectedFile)}`)
                .then(res => res.json())
                .then(data => setContent(data.content))
                .catch(err => console.error('Error fetching file content:', err));

            // Dynamically update language based on file extension
            setLanguage(getFileMode(selectedFile));
        }
    }, [selectedFile]);

    useEffect(() => {
        if (!socket) return;
        
        const handleCursorUpdate = ({ userId, position, path }) => {
          if (path === selectedFile) {
            console.log('Cursor update received:', { userId, position, path });
            updateCursor(userId, position);
          }
        };
    
        socket.on('cursor:update', handleCursorUpdate);
    
        return () => {
          socket.off('cursor:update', handleCursorUpdate);
        };
    }, [socket, selectedFile]);
    

    const updateCursor = useCallback((userId, position) => {
        if (!editorRef.current || !position || !monacoRef.current) return;
    
        cursorsRef.current.set(userId, position);

    
        const newDecorations = Array.from(cursorsRef.current.entries()).map(([id, pos]) =>
          createCursorDecoration(id, pos)
        );
        console.log('new Decorations', newDecorations, ' + decorations', decorations)
        const appliedDecorations = editorRef.current.deltaDecorations(decorations, newDecorations);
        console.log('Applied Decoration', appliedDecorations)
        setDecorations(appliedDecorations);
      }, [decorations]);
    

      const createCursorDecoration = (userId, position) => ({
        range: new monacoRef.current.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        options: {
          className: `cursor-${userId} cursor-decoration`,
          hoverMessage: { value: `Cursor: ${userId}` },
          beforeContentClassName: `cursor-decoration cursor-${userId}`,
        },
      });
    

    useEffect(() => {
        if (!socket) return;
        socket.on('file:update', handleFileUpdate);
        
        return () => {
            socket.off('file:update', handleFileUpdate);
        };
    }, [socket, selectedFile]);

    const handleFileUpdate = useCallback(
        ({ path, content }) => {
            if (path === selectedFile) {
                if (!editorRef.current) return;
    
                const currentPosition = editorRef.current.getPosition();
                setContent(content);
    
                // // Clear outdated decorations
                // setDecorations([]);
                // cursorsRef.current.clear();

                socket.emit('cursor:move', { path: selectedFile, position: currentPosition });
    
                // Restore cursor position after content update
                if (currentPosition) {
                    setTimeout(() => {
                        editorRef.current.setPosition(currentPosition);
                    }, 0);
                }
            }
        },
        [selectedFile]
    );
    
    

    const handleContentChange = (value) => {
        setContent(value);
    
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    
        autosaveTimer.current = setTimeout(() => {
            if (selectedFile && value) {
                socket.emit('file:change', { path: selectedFile, content: value });
    
                const position = editorRef.current?.getPosition();
                if (position) {
                    socket.emit('cursor:move', { path: selectedFile, position });
                    console.log(`Cursor position emitted:`, position);
                }
            }
        }, 200); // Debounce timer
    };
    

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    
        editor.onDidChangeCursorPosition(
            (e) => {
              if (selectedFile && socket) {
                socket.emit('cursor:move', {
                  path: selectedFile,
                  position: {
                    lineNumber: e.position.lineNumber,
                    column: e.position.column,
                  },
                });
              }
            }
        );
      };

      console.log('selected File', selectedFile)

    return (
        <Editor
            language={language}
            theme="vs-light"
            value={content}
            onChange={handleContentChange}
            onMount={handleEditorDidMount}
        />
    );
};

EditorComponent.propTypes = {
    selectedFile: PropTypes.string,
    socket: PropTypes.object,
};

export default EditorComponent;