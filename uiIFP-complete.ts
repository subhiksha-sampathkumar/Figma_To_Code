import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import Home from "./pages/home";
import PageContext, { PAGES } from "./context/page-context";
// ... other imports

const UI = () => {
    // 1. Fix: Add missing PAGES import and definition
    const [currentPage, setCurrentPage] = useState(PAGES.HOME);
    const [previousPage, setPreviousPage] = useState(PAGES.HOME);
    const [isComponentSelected, setIsComponentSelected] = useState(false);
    const [connectedToVSCode, setConnectedToVSCode] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [nodesMetadata, setNodesMetadata] = useState<string | null>(null);

    // 2. Fix: Add state for UI framework and CSS framework
    const [selectedUiFramework, setSelectedUiFramework] = useState(
        UiFramework.react
    );
    const [selectedCssFramework, setSelectedCssFramework] = useState(
        CssFramework.tailwindcss
    );

    // 3. Fix: Add export states
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);
    const [exportedFrames, setExportedFrames] = useState(0);

    // 4. Fix: Correct message handler typing
    onmessage = async (event: MessageEvent) => {
        const pluginMessage = event.data.pluginMessage;

        switch (pluginMessage.type) {
            case "settings":
                const { settings } = pluginMessage;
                setSelectedUiFramework(settings.uiFramework);
                setSelectedCssFramework(settings.cssFramework);
                break;

            case "selection-change":
                setIsComponentSelected(pluginMessage.isComponentSelected);
                setPreviousPage(currentPage);
                break;

            case "export-start":
                setIsExporting(true);
                setExportProgress(0);
                setTotalFrames(pluginMessage.frameCount);
                setExportedFrames(0);
                break;

            case "frame-exported":
                await handleFrameExported(pluginMessage);
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
        }
    };

    // 5. Fix: Add error handler
    const handleExportError = (msg: any) => {
        setIsExporting(false);
        setExportProgress(0);
        console.error('Export error:', msg.message);
    };

    // 6. Fix: Correct frame export handler
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

    return (
        <PageContext.Provider value={{
            currentPage,
            previousPage,
            setCurrentPage: (page: string) => {
                setPreviousPage(currentPage);
                setCurrentPage(page);
            }
        }}>
            <div className="h-full">
                {/* 7. Fix: Add proper condition for Home component */}
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

                {/* 8. Fix: Add export progress indicator */}
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

                {/* 9. Fix: Keep existing components */}
                {/* ... other components ... */}
            </div>
        </PageContext.Provider>
    );
};

// Fix: Correct root creation and render
const root = ReactDOM.createRoot(document.getElementById("react-page")!);
root.render(<UI />);
