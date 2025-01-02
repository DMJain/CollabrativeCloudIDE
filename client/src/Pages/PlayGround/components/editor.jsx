import { useState, useEffect, useRef } from 'react';
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

    const autosaveTimer = useRef(null);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        };
    }, []);

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

        const handleCursorUpdate = ({userId, position}) => {
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            console.log('Cursor update:', userId, position);
            if(editor){
                const decorations = editor.deltaDecorations(
                    [],
                    [
                        {
                            range: new monaco.Range(
                                position.lineNumber,
                                position.column,
                                position.lineNumber,
                                position.column + 2,
                            ),
                            options: {
                                inlineClassName: 'cursor-marker',
                            }
                        },
                    ]
                )
            }
        };

        socket.on('cursor:update', handleCursorUpdate);

        return () => {
            socket.off('cursor:update', handleCursorUpdate);
        }
        

    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        
        const handleFileUpdate = ({ path, content }) => {
            if (path === selectedFile) {
                setContent(content);
            }
        };
        
        socket.on('file:update', handleFileUpdate);
        
        return () => {
            socket.off('file:update', handleFileUpdate);
        };
    }, [socket, selectedFile]);

    const handleContentChange = (value) => {
        setContent(value);

        // Clear any existing timer to debounce auto-save
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

        const editor = editorRef.current;
        if (editor) {
            const position = editor.getPosition();
            socket.emit('cursor:move', { path: selectedFile, position });
        }

        // Set a new timer for auto-save after 2 seconds
        autosaveTimer.current = setTimeout(() => {
            if (selectedFile && value) {
                // Emit file:change event with updated content
                socket.emit('file:change', { path: selectedFile, content: value });
                console.log(`Auto-saving ${selectedFile}`);
            }
        }, 200); // 2-second delay
    };

    return (
        <Editor
            language={language}
            theme="vs-light"
            value={content}
            onChange={handleContentChange}
            onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
        
                editor.onDidChangeCursorPosition((e) => {
                    const position = e.position;
                    if (socket && selectedFile) {
                        socket.emit('cursor:move', { path: selectedFile, position });
                    }
                });
                
                editor.onDidChangeModelContent(() => {
                    const position = editor.getPosition();
                    if (socket && selectedFile && position) {
                        socket.emit('cursor:move', { path: selectedFile, position });
                    }
                });
                
            }}
        />
    );
};

EditorComponent.propTypes = {
    selectedFile: PropTypes.string,
    socket: PropTypes.object,
};

export default EditorComponent;