import { convertToCode } from "bricks-core/src";

figma.showUI(__html__, { height: 600, width: 350 });

figma.ui.onmessage = async (msg) => {
    // Existing handlers
    if (msg.type === "styled-bricks-nodes") {
        const promise = convertToCode(figma.currentPage.selection, {
            language: msg.options.language,
            cssFramework: msg.options.cssFramework,
            uiFramework: msg.options.uiFramework,   
        });

        await handleConversionPromise(promise);
    }

    // New JPEG export handler
    if (msg.type === "export-frames-to-jpeg") {
        const exportPromise = new Promise(async (resolve, reject) => {
            try {
                await exportFramesToJpeg(msg.options?.scale || 2);
                resolve({ success: true });
            } catch (error) {
                reject(error);
            }
        });

        await handleConversionPromise(exportPromise, 'JPEG Export');
    }

    // ... [Keep other existing handlers] ...
};

// Helper function to handle conversion promise and send messages to UI
const handleConversionPromise = async (promise: Promise<any>, operationType: string = 'Conversion') => {
    try {
        const result = await promise;
        figma.ui.postMessage({
            type: "generated-files",
            files: result,
            operationType: operationType,
        });
    } catch (e) {
        const errorDetails = {
            error: e.name,
            message: e.message,
            stack: e.stack,
        };
        console.error(`Error from ${operationType} on current page:`, errorDetails);
        
        figma.ui.postMessage({
            type: "generated-files",
            files: [],
            error: true,
            operationType: operationType,
            message: `Error on ${operationType}: ${e.message}`
        });
        
        throw e;
    }
};

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

    const exportedFrames = [];

    for (const frame of frames) {
        try {
            const settings: ExportSettings = {
                format: "JPG",
                constraint: {
                    type: "SCALE",
                    value: scale
                }
            };

            const bytes = await frame.exportAsync(settings);
            let binary = '';
            const uint8Array = new Uint8Array(bytes);
            for (let i = 0; i < uint8Array.byteLength; i++) {
                binary += String.fromCharCode(uint8Array[i]);
            }
            const base64Data = btoa(binary);

            const exportedFrame = {
                fileName: `${frame.name}.jpg`,
                data: base64Data,
                frameId: frame.id
            };

            exportedFrames.push(exportedFrame);

            figma.ui.postMessage({
                type: "frame-exported",
                ...exportedFrame
            });

        } catch (error) {
            throw new Error(`Failed to export frame ${frame.name}: ${error.message}`);
        }
    }

    figma.ui.postMessage({
        type: "export-complete",
        message: "All frames exported successfully"
    });

    return exportedFrames; // Return the exported frames for handleConversionPromise
}

// ... [Keep other existing helper functions] ...
