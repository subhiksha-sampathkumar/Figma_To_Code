import { convertToCode } from "bricks-core/src";

figma.showUI(__html__, { height: 600, width: 350 });

figma.ui.onmessage = async (msg) => {
    // Handle JPEG export
    if (msg.type === "export-frames-to-jpeg") {
        try {
            const frames = figma.currentPage.children.filter(
                node => node.type === "FRAME"
            ) as FrameNode[];

            if (frames.length === 0) {
                throw new Error("No frames found in the current page");
            }

            // Notify UI that export is starting
            figma.ui.postMessage({
                type: "export-start",
                frameCount: frames.length
            });

            // Export each frame
            for (const frame of frames) {
                try {
                    const settings: ExportSettings = {
                        format: "JPG",
                        constraint: {
                            type: "SCALE",
                            value: msg.options?.scale || 2
                        }
                    };

                    const bytes = await frame.exportAsync(settings);
                    
                    // Convert bytes to base64
                    let binary = '';
                    const uint8Array = new Uint8Array(bytes);
                    for (let i = 0; i < uint8Array.byteLength; i++) {
                        binary += String.fromCharCode(uint8Array[i]);
                    }
                    const base64Data = btoa(binary);

                    // Send exported frame to UI
                    figma.ui.postMessage({
                        type: "frame-exported",
                        fileName: `${frame.name}.jpg`,
                        data: base64Data,
                        frameId: frame.id
                    });

                } catch (error) {
                    figma.ui.postMessage({
                        type: "export-error",
                        message: `Failed to export frame ${frame.name}: ${error.message}`
                    });
                }
            }

            // Notify UI that export is complete
            figma.ui.postMessage({
                type: "export-complete",
                message: "All frames exported successfully"
            });

        } catch (error) {
            figma.ui.postMessage({
                type: "export-error",
                message: error.message
            });
        }
    }

    // Handle other message types...
    if (msg.type === "styled-bricks-nodes") {
        // ... existing code conversion logic ...
    }
};
