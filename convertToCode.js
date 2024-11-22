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
