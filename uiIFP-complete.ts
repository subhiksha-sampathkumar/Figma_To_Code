// UI.tsx updated code

import { useEffect, useState } from "react";
import ReactDOM from "react-dom/root";
import "./style.css";
import Home from "./pages/home";
import PostCodeGeneration from "./pages/post-code-generation";
import CodeGenerationStatus from "./pages/code-generation-status";
import CodeOutputSetting from "./pages/code-output-setting";
import Error from "./pages/error";
import PageContext, { PAGES } from "./context/page-context";
import { io } from "socket.io-client";
import {
    CssFramework,
    UiFramework,
} from "./constants";
import { withTimeout } from "./utils";

const socket = io("ws://localhost:32044");

const UI = () => {
    const [isComponentSelected, setIsComponentSelected] = useState(false);
    const [currentPage, setCurrentPage] = useState(PAGES.HOME);
    const [previousPage, setPreviousPage] = useState(PAGES.HOME);
    const [connectedToVSCode, setConnectedToVSCode] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [nodesMetadata, setNodesMetadata] = useState<string | null>(null);
    const [exportProgress, setExportProgress] = useState(0);
    const [isExporting, setIsExporting] = useState(false);

    // User settings
    const [selectedUiFramework, setSelectedUiFramework] = useState(
        UiFramework.react
    );
    const [selectedCssFramework, setSelectedCssFramework] = useState(
        CssFramework.tailwindcss
    );

    const setCurrentPageWithAdjustedScreenSize = (page: string) => {
        if (page === PAGES.POST_CODE_GENERATION) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: "adjust-plugin-screen-size",
                        height: 350,
                        width: 350,
                    },
                },
                "*"
            );
        } else if (page === PAGES.SETTING) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: "adjust-plugin-screen-size",
                        height: 420,
                        width: 350,
                    },
                },
                "*"
            );
        } else if (page === PAGES.HOME) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: "adjust-plugin-screen-size",
                        height: 300,
                        width: 350,
                    },
                },
                "*"
            );
        } else {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: "adjust-plugin-screen-size",
                        height: 300,
                        width: 350,
                    },
                },
                "*"
            );
        }
        setCurrentPage(page);
    };

    useEffect(() => {
        parent.postMessage({ pluginMessage: { type: "get-settings" } }, "*");

        socket.on("connect", () => {
            setConnectedToVSCode(true);
            parent.postMessage(
                {
                    pluginMessage: {
                        type: "update-connection-status",
                        connected: true,
                    },
                },
                "*"
            );
            console.log("connected!");
        });

        socket.on("disconnect", () => {
            setConnectedToVSCode(false);
            parent.postMessage(
                {
                    pluginMessage: {
                        type: "update-connection-status",
                        connected: false,
                    },
                },
                "*"
            );
        });

        socket.on("pong", () => {
            console.log("last pong:", new Date().toISOString());
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("pong");
        };
    }, []);

    onmessage = async (event: MessageEvent) => {
        const pluginMessage = event.data.pluginMessage;

        if (pluginMessage.type === "settings") {
            const { settings } = pluginMessage;
            setSelectedUiFramework(settings.uiFramework);
            setSelectedCssFramework(settings.cssFramework);
        }

        if (pluginMessage.type === "selection-change") {
            setIsComponentSelected(pluginMessage.isComponentSelected);
            setPreviousPage(currentPage);
        }

        if (pluginMessage.type === "generated-files") {
            setIsGeneratingCode(false);

            if (pluginMessage.error) {
                setCurrentPageWithAdjustedScreenSize(PAGES.ERROR);
                return;
            }

            const TIMEOUT_SECONDS = 10;

            socket.emit(
                "code-generation",
                { files: pluginMessage.files },
                withTimeout(
                    (response) => {
                        if (response.error) {
                            console.error("Error from VS Code. See more in VS code console.");
                            setCurrentPageWithAdjustedScreenSize(PAGES.ERROR);
                        }
                    },
                    () => {
                        const error = `VS Code timeout after ${TIMEOUT_SECONDS} seconds.`;
                        console.error(error);
                        setCurrentPageWithAdjustedScreenSize(PAGES.ERROR);
                    },
                    TIMEOUT_SECONDS * 1000
                )
            );
        }

        // Handle JPEG export progress
        if (pluginMessage.type === "export-start") {
            setIsExporting(true);
            setExportProgress(0);
        }

        if (pluginMessage.type === "frame-exported") {
            const { data, fileName } = pluginMessage;
            // Convert base64 to blob and trigger download
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "image/jpeg" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        if (pluginMessage.type === "export-complete") {
            setIsExporting(false);
            setExportProgress(100);
            setTimeout(() => setExportProgress(0), 1000);
        }

        if (pluginMessage.type === "display-nodes-metadata") {
            setNodesMetadata(pluginMessage.data);
        }
    };

    const handleExportClick = () => {
        parent.postMessage(
            {
                pluginMessage: {
                    type: "export-frames-to-jpeg",
                    options: { scale: 2 }
                }
            },
            "*"
        );
    };

    return (
        <PageContext.Provider
            value={{
                currentPage: currentPage,
                previousPage: previousPage,
                setCurrentPage: (page: string) => {
                    setPreviousPage(currentPage);
                    setCurrentPageWithAdjustedScreenSize(page);
                },
            }}
        >
            <div className="h-full">
                {currentPage === PAGES.HOME && (
                    <Home
                        connectedToVSCode={connectedToVSCode}
                        isComponentSelected={isComponentSelected}
                        selectedUiFramework={selectedUiFramework}
                        selectedCssFramework={selectedCssFramework}
                        setIsGeneratingCode={setIsGeneratingCode}
                    />
                )}
                {currentPage === PAGES.SETTING && (
                    <CodeOutputSetting
                        selectedUiFramework={selectedUiFramework}
                        selectedCssFramework={selectedCssFramework}
                    />
                )}
                {currentPage === PAGES.CODE_GENERATION && (
                    <CodeGenerationStatus
                        selectedUiFramework={selectedUiFramework}
                        isGeneratingCode={isGeneratingCode}
                    />
                )}
                {currentPage === PAGES.POST_CODE_GENERATION && <PostCodeGeneration />}
                {currentPage === PAGES.ERROR && <Error />}

                {/* JPEG Export UI */}
                <div className="px-4 py-2 border-t">
                    <button
                        onClick={handleExportClick}
                        disabled={isExporting}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {isExporting ? "Exporting..." : "Export Frames as JPEG"}
                    </button>
                    
                    {isExporting && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded">
                                <div
                                    className="bg-blue-500 h-2 rounded transition-all duration-300"
                                    style={{ width: `${exportProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Display Nodes Metadata */}
                {nodesMetadata && (
                    <div className="metadata-display" style={{ maxHeight: "300px", overflow: "auto", backgroundColor: "#f0f0f0", padding: "10px" }}>
                        <h4>Nodes Metadata</h4>
                        <pre>{nodesMetadata}</pre>
                    </div>
                )}
            </div>
        </PageContext.Provider>
    );
};

const root = ReactDOM.createRoot(document.getElementById("react-page"));
root.render(<UI />);