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
        try {
            await exportFramesToJpeg(msg.options?.scale || 2);
        } catch (error) {
            figma.ui.postMessage({
                type: "export-error",
                message: error.message
            });
        }
    }

    // ... [Keep other existing handlers] ...
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

            figma.ui.postMessage({
                type: "frame-exported",
                fileName: `${frame.name}.jpg`,
                data: base64Data,
                frameId: frame.id
            });

        } catch (error) {
            throw new Error(`Failed to export frame ${frame.name}: ${error.message}`);
        }
    }

    figma.ui.postMessage({
        type: "export-complete",
        message: "All frames exported successfully"
    });
}

// ... [Keep existing helper functions] ...