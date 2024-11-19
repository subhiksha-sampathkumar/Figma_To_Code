import { useContext, useState, PropsWithChildren } from "react";
import * as settingsLogo from "../assets/setting-logo.png";
import PageContext, { PAGES } from "../context/page-context";
import { CssFramework, UiFramework } from "../constants";
import Button from "../components/Button";

export interface Props {
    connectedToVSCode: boolean;
    selectedUiFramework: UiFramework;
    selectedCssFramework: CssFramework;
    isComponentSelected: boolean;
    setIsGeneratingCode: (value: boolean) => void;
    isExporting?: boolean;
    onExportStart?: () => void;
}

const Home = (props: PropsWithChildren<Props>) => {
    const {
        connectedToVSCode,
        isComponentSelected,
        selectedUiFramework,
        setIsGeneratingCode,
        selectedCssFramework,
        isExporting,
        onExportStart
    } = props;

    const { setCurrentPage } = useContext(PageContext);
    const [nodesMetadata, setNodesMetadata] = useState<string | null>(null);

    // Fix 1: Add missing isGenerateCodeButtonEnabled
    const isGenerateCodeButtonEnabled = isComponentSelected && connectedToVSCode;

    // Fix 2: Add missing getCenterContent function
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

    const handleGenerateCodeButtonClick = async () => {
        await setIsGeneratingCode(true);
        await setCurrentPage(PAGES.CODE_GENERATION);
        parent.postMessage(
            {
                pluginMessage: {
                    type: "styled-bricks-nodes",
                    options: {
                        uiFramework: selectedUiFramework,
                        cssFramework: selectedCssFramework,
                    },
                },
            },
            "*"
        );
    };

    const handleExportToJpeg = () => {
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
                <Button
                    onClick={handleExportToJpeg}
                    disabled={!isComponentSelected || isExporting}
                >
                    {isExporting ? "Exporting..." : "Export Frame to JPEG"}
                </Button>
                {/* ... [Keep existing buttons] ... */}
            </div>
            {/* ... [Keep existing metadata display] ... */}
        </div>
    );
};

export default Home;
