import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";
import Home from "./pages/home";
import PageContext, { PAGES } from "./context/page-context";
import { CssFramework, UiFramework } from "./constants";  // Added framework imports

const UI = () => {
    const [currentPage, setCurrentPage] = useState(PAGES.HOME);
    const [previousPage, setPreviousPage] = useState(PAGES.HOME);
    const [isComponentSelected, setIsComponentSelected] = useState(false);
    const [connectedToVSCode, setConnectedToVSCode] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [nodesMetadata, setNodesMetadata] = useState<string | null>(null);

    // Updated framework states with proper typing
    const [selectedUiFramework, setSelectedUiFramework] = useState<UiFramework>(
        UiFramework.react
    );
    const [selectedCssFramework, setSelectedCssFramework] = useState<CssFramework>(
        CssFramework.tailwindcss
    );

    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [totalFrames, setTotalFrames] = useState(0);
    const [exportedFrames, setExportedFrames] = useState(0);

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

    const handleExportError = (msg: any) => {
        setIsExporting(false);
        setExportProgress(0);
        console.error('Export error:', msg.message);
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

                {/* ... other components ... */}
            </div>
        </PageContext.Provider>
    );
};

const root = ReactDOM.createRoot(document.getElementById("react-page")!);
root.render(<UI />);
