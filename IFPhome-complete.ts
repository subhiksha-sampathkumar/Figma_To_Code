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

    // ... [Keep existing handlers for other functionalities] ...

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