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