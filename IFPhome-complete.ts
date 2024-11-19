const Home = (props: PropsWithChildren<Props>) => {
    // ... other code remains same ...

    // Fix 1: Button enable/disable condition matching the image
    const isGenerateCodeButtonEnabled = isComponentSelected && connectedToVSCode;

    return (
        <div className="h-full w-full flex flex-col items-center p-4">
            {/* Fix 2: getCenterContent with matching className structure */}
            <div className="w-full mb-4">{getCenterContent(connectedToVSCode)}</div>

            <div className="w-full flex flex-col items-center gap-2 mb-4">
                <Button
                    onClick={handleGenerateCodeButtonClick}
                    disabled={!isGenerateCodeButtonEnabled}
                >
                    Generate Code
                </Button>

                {/* ... rest of the buttons ... */}
            </div>
        </div>
    );
};

// Fix 2: getCenterContent implementation matching the image
const getCenterContent = (isConnectedToVSCode: boolean) => {
    if (isConnectedToVSCode) {
        return (
            <div>
                <p className="font-vietnam text-black font-bold text-lg mb-4">
                    Select a frame or component to get started
                </p>
                <p className="font-vietnam italic text-sm text-gray-400">
                    {isComponentSelected ? "Components detected" : "No components selected"}
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="font-vietnam text-black font-bold text-lg mb-4">
                Activate Bricks VSCode extension to get started
            </p>
            <p className="font-vietnam text-black text-sm mb-1">
                Install VSCode extension{" "}
                <a
                    href="https://marketplace.visualstudio.com/items?itemName=Bricks.d2c-vscode"
                    target="_top"
                    className="text-blue-600 dark:text-blue-500 hover:underline"
                >
                    here
                </a>
            </p>
            <p className="font-vietnam text-black text-sm">
                For any issues, check out our{" "}
                <a
                    href="https://github.com/bricks-cloud/bricks/tree/main/docs"
                    target="_top"
                    className="text-blue-600 dark:text-blue-500 hover:underline"
                >
                    FAQs
                </a>
            </p>
        </div>
    );
};
