import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';
import { getFileMode } from '../../../utils/getFileMode';
import socket from '../../../utils/socket';

const EditorComponent = ({ selectedFile }) => {
    const [content, setContent] = useState('// Select a file to view its content');
    const [language, setLanguage] = useState('');

    const autosaveTimer = useRef(null);

    useEffect(() => {
        if (selectedFile) {
            // Fetch file content when a file is selected
            fetch(`http://localhost:1000/files/content?path=${encodeURIComponent(selectedFile)}`)
                .then(res => res.json())
                .then(data => setContent(data.content))
                .catch(err => console.error('Error fetching file content:', err));

            // Dynamically update language based on file extension
            setLanguage(getFileMode(selectedFile));
        }
    }, [selectedFile]);

    const handleContentChange = (value) => {
        setContent(value);

        // Clear any existing timer to debounce auto-save
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

        // Set a new timer for auto-save after 2 seconds
        autosaveTimer.current = setTimeout(() => {
            if (selectedFile && value) {
                // Emit file:change event with updated content
                socket.emit('file:change', { path: selectedFile, content: value });
                console.log(`Auto-saving ${selectedFile}`);
            }
        }, 200); // 2-second delay
    };

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        };
    }, []);

    return (
        <Editor
            language={language}
            theme="vs-dark"
            value={content}
            onChange={handleContentChange}
        />
    );
};

EditorComponent.propTypes = {
    selectedFile: PropTypes.string
};

export default EditorComponent;