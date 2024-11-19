import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import Home from "./pages/home";
// ... [Keep existing imports] ...

const UI = () => {
    // Existing state
    const [isComponentSelected, setIsComponentSelected] = useState(false);
    const [currentPage, setCurrentPage] = useState(PAGES.HOME);
    const [previousPage, setPreviousPage] = useState(PAGES.HOME);
    const [connectedToVSCode, setConnectedToVSCode] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [nodesMetadata, setNodesMetadata] = useState<string | null>(null);

    // New JPEG export state
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);
    const [exportedFrames, setExportedFrames] = useState(0);

    // ... [Keep existing useEffect for socket connection] ...

    // Enhanced message handler
    onmessage = async (event: MessageEvent) => {
        const pluginMessage = event.data.pluginMessage;

        switch (pluginMessage.type) {
            // Existing handlers
            case "settings":
                const { settings } = pluginMessage;
                setSelectedUiFramework(settings.uiFramework);
                setSelectedCssFramework(settings.cssFramework);
                break;

            case "selection-change":
                setIsComponentSelected(pluginMessage.isComponentSelected);
                setPreviousPage(currentPage);
                break;

            // New JPEG export handlers
            case "export-start":
                setIsExporting(true);
                setExportProgress(0);
                setTotalFrames(pluginMessage.frameCount);
                setExportedFrames(0);
                break;

            case "frame-exported":
                handleFrameExported(pluginMessage);
                break;

            case "export-complete":
                setIsExporting(false);
                setExportProgress(100);
                setTimeout(() => {
                    setExportProgress(0);
                    setExportedFrames(0);
                }, 1000);
                break;

            case "export-error":
                handleExportError(pluginMessage);
                break;

            // ... [Keep other existing handlers] ...
        }
    };

    const handleFrameExported = async (msg: any) => {
        try {
            const { data, fileName } = msg;
            const byteCharacters = atob(data);
            const byteArray = new Uint8Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }
            
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportedFrames(prev => {
                const newCount = prev + 1;
                setExportProgress((newCount / totalFrames) * 100);
                return newCount;
            });
        } catch (error) {
            console.error('Error saving file:', error);
        }
    };

    const handleExportError = (msg: any) => {
        setIsExporting(false);
        setExportProgress(0);
        // You could add a toast notification here
        console.error('Export error:', msg.message);
    };

    return (
        <PageContext.Provider value={{...}}>
            <div className="h-full">
                {currentPage === PAGES.HOME && (
                    <Home
                        connectedToVSCode={connectedToVSCode}
                        isComponentSelected={isComponentSelected}
                        selectedUiFramework={selectedUiFramework}
                        selectedCssFramework={selectedCssFramework}
                        setIsGeneratingCode={setIsGeneratingCode}
                        isExporting={isExporting}
                        onExportStart={() => setIsExporting(true)}
                    />
                )}

                {/* Export Progress Indicator */}
                {isExporting && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${exportProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-center mt-2">
                            Exporting frames: {exportedFrames}/{totalFrames}
                        </p>
                    </div>
                )}

                {/* ... [Keep existing components] ... */}
            </div>
        </PageContext.Provider>
    );
};

const root = ReactDOM.createRoot(document.getElementById("react-page"));
root.render(<UI />);