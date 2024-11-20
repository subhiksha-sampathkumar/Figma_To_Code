const UI = () => {
    // ... existing state ...

    useEffect(() => {
        // Add message listener
        const messageHandler = async (event: MessageEvent) => {
            const msg = event.data.pluginMessage;
            if (!msg) return;

            switch (msg.type) {
                case "export-start":
                    setIsExporting(true);
                    setExportProgress(0);
                    setTotalFrames(msg.frameCount);
                    setExportedFrames(0);
                    console.log("Export started", msg.frameCount, "frames"); // Debug log
                    break;

                case "frame-exported":
                    try {
                        const { data, fileName } = msg;
                        await downloadFile(data, fileName);
                        setExportedFrames(prev => {
                            const newCount = prev + 1;
                            setExportProgress((newCount / totalFrames) * 100);
                            return newCount;
                        });
                        console.log("Frame exported:", fileName); // Debug log
                    } catch (error) {
                        console.error("Error downloading frame:", error);
                    }
                    break;

                case "export-complete":
                    setIsExporting(false);
                    setExportProgress(100);
                    console.log("Export complete"); // Debug log
                    // Maybe show a success message
                    break;

                case "export-error":
                    console.error("Export error:", msg.message);
                    setIsExporting(false);
                    // Show error message to user
                    break;
            }
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, [totalFrames]);

    // Separate function for file downloading
    const downloadFile = async (base64Data: string, fileName: string) => {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <PageContext.Provider value={{...}}>
            <div className="h-full">
                {currentPage === PAGES.HOME && (
                    <Home
                        {...props}
                        isExporting={isExporting}
                        onExportStart={() => {
                            setIsExporting(true);
                            setExportProgress(0);
                            setExportedFrames(0);
                        }}
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
            </div>
        </PageContext.Provider>
    );
};
