const Home = (props: PropsWithChildren<Props>) => {
    // ... existing state and props ...

    const handleExportToJpeg = () => {
        console.log("Export to JPEG clicked"); // Add for debugging
        if (onExportStart) onExportStart();
        parent.postMessage(
            {
                pluginMessage: {
                    type: "export-frames-to-jpeg",
                    options: {
                        scale: 2
                    }
                }
            },
            "*"
        );
    };

    return (
        <div className="h-full w-full flex flex-col items-center p-4">
            <div className="w-full mb-4">{getCenterContent(connectedToVSCode)}</div>

            <div className="w-full flex flex-col items-center gap-2 mb-4">
                <Button
                    onClick={handleGenerateCodeButtonClick}
                    disabled={!isGenerateCodeButtonEnabled}
                >
                    Generate Code
                </Button>

                {/* Make export button more prominent */}
                <Button
                    onClick={handleExportToJpeg}
                    disabled={!isComponentSelected}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                    {isExporting ? "Exporting..." : "Export Frames to JPEG"}
                </Button>
            </div>
        </div>
    );
};
