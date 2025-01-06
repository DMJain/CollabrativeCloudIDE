import { useEffect, useState, useRef } from 'react';
import './styles.css';
import Terminal from './components/terminal';
import FileTree from './components/tree';
import EditorComponent from './components/editor';
import Invite from './components/invite';
import MessageApp from './components/message';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { useDeletePlayGround } from '../../hooks/playGround.hooks';
import { useLocation } from 'react-router-dom';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

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
    const location = useLocation();
    const [showSidePanel, setShowSidePanel] = useState(true);
    const [showPreview, setShowPreview] = useState(true);
    const [showTerminal, setShowTerminal] = useState(true);
    const [showChatPanel, setShowChatPanel] = useState(true);
    const [previewurl, setPreviewurl] = useState();

    const playGroundContainerIdRef = useRef(null);
    const playground = useSelector((state) => state.playground);

    useEffect(() => {
        playGroundContainerIdRef.current = playground.playGroundContainerId; // Update the ref value
    }, [playground.playGroundContainerId]);

    const fetchTreeData = async () => {
        try {
            const res = await fetch(`${playground.playGroundHost}files`);
            if (!res.ok) throw new Error('Server not responding');
            const data = await res.json();
            setTreeData(data.tree);
            setIsLoading(false);
            return true; // Indicate success
        } catch (err) {
            console.error('Error fetching tree data:', err);
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
                    setError(
                        'Unable to connect to the server. Please try again later.'
                    );
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
            socketInstance.on('file:refresh', (path) => {
                console.log(`File changed: ${path}`);
                fetchTreeData(); // Refresh tree data when a file changes
            });

            setSocket(socketInstance);

            setHasInitialized(true); // Mark as initialized

            return () => {
                socketInstance.off('file:refresh');
                socketInstance.disconnect();
            };
        }
    }, [isBackendReady]);

    const handleCleanup = async () => {
        if (beforeUnloadHandled.current || !hasInitialized) return; // Skip if not initialized

        beforeUnloadHandled.current = true;
        console.log('Cleanup triggered');

        if (playGroundContainerIdRef.current) {
            try {
                console.log(
                    'Deleting playground:',
                    playGroundContainerIdRef.current
                );
                await deletePlayGround({
                    containerId: playGroundContainerIdRef.current,
                    projectId: playground.playGroundId,
                });
            } catch (error) {
                console.error('Error deleting playground:', error);
            }
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            handleCleanup();
            event.preventDefault();
            event.returnValue = ''; // Compatibility for older browsers
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            console.log('Cleanup triggered');
            window.removeEventListener('beforeunload', handleBeforeUnload);
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
        if (socket) {
            socket.emit('file:select', filePath);
        }
    };

    const handlePreviewRun = () => {
        if (socket) {
            console.log('Running preview...', playground.playGroundContainerIp);
            socket.emit('preview:run');
            setTimeout(() => {
                window.open('http://localhost:3000', '_blank');
            }, 1000);
        }
    }

    if (isLoading) {
        return <div>Loading Playground...</div>;
    }

    if (error) {
        return <div className="error-screen">{error}</div>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="flex justify-between p-1 m-2">
                <p>IDE</p>
                <div className="flex gap-2">
                    <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => setShowSidePanel(!showSidePanel)}
                    >
                        {showSidePanel ? 'Hide SideBar' : 'Show SideBar'}
                    </button>
                    <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => setShowTerminal(!showTerminal)}
                    >
                        {showTerminal ? 'Hide Terminal' : 'Show Terminal'}
                    </button>
                    <button
                        className="btn btn-xs btn-secondary"
                        onClick={() =>
                            document.getElementById('inviteModal').showModal()
                        }
                    >
                        Invite
                    </button>
                    <button
                        className="btn btn-xs btn-secondary"
                        onClick={handlePreviewRun}
                    >
                        RUN
                    </button>
                    <dialog id="inviteModal" className="modal">
                        <div className="modal-box">
                            <form method="dialog">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                    ✕
                                </button>
                            </form>
                            <Invite />
                            <p className="text-xs px-4">
                                Press ESC key or click on ✕ button to close
                            </p>
                        </div>
                    </dialog>
                </div>
            </div>
            <PanelGroup direction="horizontal" className="flex h-full">
                {/* Left Panel (FileTree and Messaging) */}
                {showSidePanel && (
                    <Panel defaultSize={15} maxSize={20} minSize={10}>
                        <PanelGroup direction="vertical">
                            <Panel defaultSize={50}>
                                <div className="flex  h-full rounded-lg border border-base-300">
                                    <FileTree
                                        tree={treeData}
                                        onFileSelect={handleFileSelect}
                                    />
                                </div>
                            </Panel>
                            <PanelResizeHandle className="h-[5px] cursor-row-resize" />
                            <div className="flex justify-between p-1 rounded-lg border border-base-300">
                                <p>Messages</p>
                                <button
                                    className="btn btn-xs btn-primary"
                                    onClick={() =>
                                        setShowChatPanel(!showChatPanel)
                                    }
                                >
                                    {showChatPanel ? 'Minimize' : 'Expand'}
                                </button>
                            </div>
                            {showChatPanel && (
                                <Panel
                                    defaultSize={20}
                                    maxSize={40}
                                    minSize={10}
                                >
                                    <div className="bg-red-100 flex items-center justify-center h-full rounded-lg border border-base-300">
                                        Messaging Container
                                        {socket ? (
                                            <MessageApp socket={socket}/>
                                        ) : <p>Initiating Messages</p>}
                                    </div>
                                </Panel>
                            )}
                        </PanelGroup>
                    </Panel>
                )}

                {/* Divider */}
                <PanelResizeHandle className="w-[5px] cursor-col-resize" />

                {/* Middle Panel (Code) */}
                <Panel defaultSize={60}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={40}>
                            <PanelGroup direction="horizontal">
                                <Panel defaultSize={60}>
                                    <div
                                        className={`bg-white flex flex-col h-full rounded-lg border border-base-300`}
                                    >
                                        <EditorComponent
                                            selectedFile={selectedFile}
                                            socket={socket}
                                        />
                                    </div>
                                </Panel>

                                {/* Divider */}
                                <PanelResizeHandle className="w-[5px] cursor-col-resize" />

                                {/* Right Panel (Preview) */}
                                {showPreview && previewurl && (
                                    <Panel
                                        defaultSize={20}
                                        maxSize={40}
                                        minSize={10}
                                    >
                                        <div className="bg-blue-200 flex flex-col h-full rounded-lg border border-base-300">
                                            
                                                <iframe
                                                    id="preview-frame"
                                                    className="w-full h-full"
                                                    src={`${playground.playGroundContainerIp}:3000`}
                                                    title="React App Preview"
                                                ></iframe>
                                        </div>
                                    </Panel>
                                )}
                            </PanelGroup>
                        </Panel>
                        <PanelResizeHandle className="h-[5px] cursor-row-resize" />
                        {showTerminal && (
                            <Panel defaultSize={25} maxSize={25} minSize={10}>
                                <div className="h-full rounded-lg border border-base-300 bg-black overflow-auto">
                                    {socket ? (
                                        <Terminal socket={socket} />
                                    ) : (
                                        <div>Initializing terminal...</div>
                                    )}
                                </div>
                            </Panel>
                        )}
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
};
export default Playground;
