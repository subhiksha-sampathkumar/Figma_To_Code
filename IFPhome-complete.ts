// home.tsx - update

import { useContext, useState, PropsWithchildren } 
from "react"; 
import * as settingsLogo 
from "../assets/setting-logo.png"; 
import PageContext, { PAGES } from "../context/page-context";

import {
    CssFramework,
    UiFramework,
} from "../constants";
import Button from "../components/Button";

export interface Props {
connectedToVSCode: boolean;
selectedUiFramework: UiFramework;
selectedCssFramework: CssFramework;
isComponentSelected: boolean;
setIsGeneratingCode: (value: boolean) => void;

const Home = (props: PropsWithchildren<Props>) => {
connectedToVSCode,
isComponentSelected,
selectedUiFramework,
setIsGeneratingCode, 
selectedCssFramework 
} = props;
const { setcurrentPage } = useContext(PageContext);

// State for displaying metadata
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

const handleOutputSettingButtonclick = () =>
setCurrentPage (PAGES.SETTING);
};

// Function to handle converting the entire wireframe
const handleConvertEntireWireframeClick = async () => {
await setIsGeneratingCode(true);
parent. postMessage (
    {
    pluginMessage: {
    type: "convert-entire-wireframe",
    options: {
    uiFramework: selectedUiFramework, 
    cssFramework: selectedCssFramework,
},
},
},
"*"
);
};
    // Function to request metadata for selected nodes
    const handleShowSelectedNodesMetadata = () => {
    parent.postMessage({ pluginMessage: { type: "display-selected-metadata" } }, "*");
};

// Function to request metadata for the entire page
const handleShowEntirePageMetadata = () => {
    parent.postMessage({ pluginMessage: { type: "display-entire-page-metadata" } }, "*");
    };

    const isGenerateCodeButtonEnabled = isComponentSelected && connectedToVSCode;

    const getCenterContent = (isConnectedTovSCode: boolean) => { 
    if (isConnectedToVSCode) {        
    return (
    <div>
    <p className="font-vietnam text-black font-bold text-lg mb-4">
    Select a frame or component to get started
    </p>
    <p className="font-vietnam italic text-sm text-gray-400">
    {isComponentSelected
    ? "Components detected"
    : "No components selected"}
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
    href="htts://github.com/bricks-cloud/bricks/tree/main/docs"
    target="_top"
    className="text-blue-600 dark:text-blue-500 hover: underline"
    >

    FAQS
    </a>
    </p>
    </div>
);
    };

    return (
    <div className="h-full w-full flex flex-col items-center p-4">
    {/* Center Content */}
    <div className="w-full mb-4">{getCenterContent(connectedToVSCode)}</div>

    {/* Button Section */}
    <div className="w-full flex flex-col items-center gap-2 mb-4">
    <Button
        onClick={handleGenerateCodeButtonClick}
        disabled={!isGenerateCodeButtonEnabled}
        >
        Generate Code
    </Button>
    
    <Button
        onClick={handleGenerateCodeButtonclick}
        disabled={lisGenerateCodeButtonEnabled}
        >
        Export selected frame to Jpeg 
        </Button>

        <Button
        onclick={handleConvertEntireWireframeClick}
        disabled={!connectedTovSCode}
        >
        Convert Entire Wireframe
        </Button>
        <Button onClick={handleShowSelectedNodesMetadata}>

        Show Selected Nodes Metadata
        </Button>

        <Button onClick={handleShowEntirePageMetadata}>
        Show Entire Page Metadata
        </Button>
        </div>

        {/* Metadata Display */} 
        {nodesMetadata 8& (
        <div
        className="metadata-display w-full flex flex-col items-start p-4"
        style={{
        maxHeight: "200px", 
        overflow: "auto",
        backgroundcolor: "#f7f7f7",
        borderRadius : "8px",
        boxshadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
>
        <h4 className="font-bold text-sm mb-2">Nodes Metadata</h4>
        <pre className="text-xs leading-relaxed">{nodesMetadata)</pre>
        </div>
        )}

        {/* Settings Button */}       
        {connectedToVSCode && (
        <Button onClick={handleOutputSettingButtonClick} secondary> 
        <img className="h-4 mr-2" src={settingsLogo.default) alt="Settings" />
        Setting
        </Button>
        )}
        </div>
        );