import { convertToCode } from "bricks-core/src";

figma.showUI(__html__, { height: 600, width: 350 });

figma.ui.onmessage = async (msg) => {
    if (msg.type === "styled-bricks-nodes") {
        const promise = convertToCode(figma.currentPage.selection, {
            language: msg.options.language,
            cssFramework: msg.options.cssFramework,
            uiFramework: msg.options.uiFramework,   
        });

        await handleConversionPromise(promise);
    }

    if (msg.type === "convert-entire-wireframe") {
        const pages = figma.root.children.filter(node => node.type === "PAGE");

        for (const page of pages) {
            figma.currentPage = page;

            const promise = convertToCode(page.children, {
                language: msg.options.language,
                cssFramework: msg.options.cssFramework,
                uiFramework: msg.options.uiFramework,   
            });

            try {
                await handleConversionPromise(promise, page.name);
            } catch (error) {
                console.error(`Error converting page ${page.name}:`, error);
                figma.ui.postMessage({
                    type: "conversion-error",
                    pageName: page.name,
                    error: true,
                    message: `Error converting page ${page.name}: ${error.message}`,
                });
            }
        }

        figma.ui.postMessage({ type: "conversion-complete" });
    }

    if (msg.type === "display-selected-metadata") {
        displayNodesMetadata(figma.currentPage.selection);
    }

    if (msg.type === "display-entire-page-metadata") {
        displayNodesMetadata(figma.currentPage.children);
    }

    if (msg.type === "update-settings") {
        await figma.clientStorage.setAsync("settings", msg.settings);
    }

    if (msg.type === "update-connection-status") {
        figma.clientStorage.setAsync("connection-status", msg.connected);
    }

    if (msg.type === "adjust-plugin-screen-size") {
        figma.ui.resize(msg.width, msg.height);
    }

    if (msg.type === "get-settings") {
        let settings = await figma.clientStorage.getAsync("settings");
        figma.ui.postMessage({
            type: "settings",
            settings,
        });
    }

    // New JPEG export handler
    if (msg.type === "export-frames-to-jpeg") {
        try {
            await exportFramesToJpeg(msg.options?.scale || 2);
            figma.ui.postMessage({ 
                type: "export-complete",
                message: "Frames exported successfully"
            });
        } catch (error) {
            figma.ui.postMessage({
                type: "export-error",
                error: true,
                message: `Error exporting frames: ${error.message}`
            });
        }
    }
}

figma.on("selectionchange", async () => {
    figma.ui.postMessage({
        type: "selection-change",
        isComponentSelected: figma.currentPage.selection.length > 0,
        selectedComponents: figma.currentPage.selection.map((x) => x.name),
    });
});

const handleConversionPromise = async (promise: Promise<any>, pageName?: string) => {
    try {
        const files = await promise;
        figma.ui.postMessage({
            type: "generated-files",
            files,
            pageName: pageName || "Current Page",
        });
    } catch (e) {
        const errorDetails = {
            error: e.name,
            message: e.message,
            stack: e.stack,
        };
        console.error(`Error from Figma core on ${pageName || "current page"}:`, errorDetails);
        
        figma.ui.postMessage({
            type: "generated-files",
            files: [],
            error: true,
            pageName: pageName || "Current Page",
            message: `Error on ${pageName || "current page"}: ${e.message}`
        });
        
        throw e;
    }
};

const getNodeMetadata = (node: SceneNode): any => {
    const nodeData = {
        id: node.id,
        name: node.name,
        type: node.type,
        width: node.width,
        height: node.height,
        x: node.x,
        y: node.y,
        children: [],
    };

    if ("children" in node && node.children.length > 0) {
        nodeData.children = node.children.map(child => getNodeMetadata(child));
    }

    return nodeData;
};

const displayNodesMetadata = (nodes: readonly SceneNode[]) => {
    const nodesData = nodes.map(node => getNodeMetadata(node));
    figma.ui.postMessage({
        type: "display-nodes-metadata",
        data: JSON.stringify(nodesData, null, 2)
    });
};

// New JPEG export functions
async function exportFramesToJpeg(scale: number = 2) {
    const frames = figma.currentPage.children.filter(
        node => node.type === "FRAME"
    ) as FrameNode[];

    if (frames.length === 0) {
        throw new Error("No frames found in the current page");
    }

    figma.ui.postMessage({
        type: "export-start",
        frameCount: frames.length
    });

    for (const frame of frames) {
        try {
            const settings: ExportSettings = {
                format: "JPG",
                constraint: {
                    type: "SCALE",
                    value: scale
                }
            };

            if (!frame.exportSettings.length) {
                frame.exportSettings = [settings];
            }

            const bytes = await frame.exportAsync(settings);
            const base64Data = arrayBufferToBase64(bytes);
            
            figma.ui.postMessage({
                type: "frame-exported",
                fileName: `${frame.name}.jpg`,
                data: base64Data,
                frameId: frame.id
            });

        } catch (error) {
            console.error(`Error exporting frame ${frame.name}:`, error);
            throw new Error(`Failed to export frame ${frame.name}: ${error.message}`);
        }
    }
}

function arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.length; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
}

// HTML UI Template
const __html__ = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 20px;
        }
        .progress {
            width: 100%;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 4px;
            margin: 10px 0;
        }
        .progress-bar {
            height: 100%;
            background-color: #18a0fb;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        button {
            background-color: #18a0fb;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin: 4px 0;
        }
        button:hover {
            background-color: #0d8de3;
        }
    </style>
</head>
<body>
    <div id="app">
        <button id="exportButton">Export Frames as JPEG</button>
        <div id="progressContainer" style="display: none;">
            <div class="progress">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            <div id="progressText">Exporting frames...</div>
        </div>
    </div>

    <script>
        let totalFrames = 0;
        let exportedFrames = 0;
        const downloadQueue = [];
        
        document.getElementById('exportButton').onclick = () => {
            parent.postMessage({ 
                pluginMessage: { 
                    type: 'export-frames-to-jpeg',
                    options: { scale: 2 }
                } 
            }, '*');
        };

        window.onmessage = async (event) => {
            const msg = event.data.pluginMessage;

            switch (msg.type) {
                case 'export-start':
                    totalFrames = msg.frameCount;
                    exportedFrames = 0;
                    downloadQueue.length = 0;
                    showProgress();
                    break;

                case 'frame-exported':
                    exportedFrames++;
                    updateProgress();
                    
                    downloadQueue.push({
                        fileName: msg.fileName,
                        data: msg.data
                    });

                    if (exportedFrames === totalFrames) {
                        await processDownloadQueue();
                        hideProgress();
                    }
                    break;

                case 'export-complete':
                    console.log('Export completed successfully');
                    break;

                case 'export-error':
                    console.error('Export error:', msg.message);
                    hideProgress();
                    alert('Export error: ' + msg.message);
                    break;
            }
        };

        function showProgress() {
            document.getElementById('progressContainer').style.display = 'block';
            updateProgress();
        }

        function hideProgress() {
            document.getElementById('progressContainer').style.display = 'none';
        }

        function updateProgress() {
            const progress = (exportedFrames / totalFrames) * 100;
            document.getElementById('progressBar').style.width = \`\${progress}%\`;
            document.getElementById('progressText').textContent = 
                \`Exporting frames... \${exportedFrames}/\${totalFrames}\`;
        }

        async function processDownloadQueue() {
            for (const item of downloadQueue) {
                const byteCharacters = atob(item.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = item.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    </script>
</body>
</html>
`;