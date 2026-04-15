(function() {
    // 1. Inject the external CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/gh/genizy/web-port@de75523557e46f375fc9173a9a0c0d34d8ed34f9/thats-not-my-neighbor/style.css';
    document.head.appendChild(link);

    // 2. Create the HTML Structure
    const gameUI = `
        <div id="loading-text" style="color: white; font-family: cursive; font-size: 48px; text-align: center; margin-top: 20px;">LOADING...</div>
        <canvas id="canvas"> Your browser does not support the canvas tag. </canvas>
        <div id="status">
            <img id="status-splash" class="show-image--true fullsize--false use-filter--true" 
                 src="https://cdn.jsdelivr.net/gh/genizy/web-port@de75523557e46f375fc9173a9a0c0d34d8ed34f9/thats-not-my-neighbor/thats-not-my-neighbor.png" alt="">
            <progress id="status-progress"></progress>
            <div id="status-notice"></div>
        </div>
    `;
    
    const container = document.createElement('div');
    container.innerHTML = gameUI;
    document.body.appendChild(container);

    // 3. Load the Engine Scripts
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    // Sequence loading the main engine files
    const baseUrl = "https://cdn.jsdelivr.net/gh/genizy/web-port@de75523557e46f375fc9173a9a0c0d34d8ed34f9/thats-not-my-neighbor/";
    
    Promise.all([
        loadScript(baseUrl + "main.js"),
        loadScript(baseUrl + "thats-not-my-neighbor.js")
    ]).then(() => {
        initializeGodot();
    });

    // 4. Godot Logic and Configuration
    function initializeGodot() {
        const GODOT_CONFIG = {
            "args": [],
            "canvasResizePolicy": 2,
            "ensureCrossOriginIsolationHeaders": false,
            "executable": "thats-not-my-neighbor",
            "experimentalVK": false,
            "fileSizes": {
                "thats-not-my-neighbor.pck": 410934256,
                "thats-not-my-neighbor.wasm": 43444261
            },
            "focusCanvas": true,
            "gdextensionLibs": []
        };
        const GODOT_THREADS_ENABLED = false;
        const engine = new Engine(GODOT_CONFIG);

        // UI References
        const statusOverlay = document.getElementById('status');
        const statusProgress = document.getElementById('status-progress');
        const statusNotice = document.getElementById('status-notice');
        let initializing = true;
        let statusMode = '';

        function setStatusMode(mode) {
            if (statusMode === mode || !initializing) return;
            if (mode === 'hidden') {
                statusOverlay.remove();
                initializing = false;
                return;
            }
            statusOverlay.style.visibility = 'visible';
            statusProgress.style.display = mode === 'progress' ? 'block' : 'none';
            statusNotice.style.display = mode === 'notice' ? 'block' : 'none';
            statusMode = mode;
        }

        function displayFailureNotice(err) {
            console.error(err);
            setStatusMode('notice');
            initializing = false;
        }

        const missing = Engine.getMissingFeatures({ threads: GODOT_THREADS_ENABLED });
        if (missing.length !== 0) {
            alert('Missing features: ' + missing.join(', '));
        } else {
            setStatusMode('progress');
            engine.startGame({
                'onProgress': function (current, total) {
                    if (current > 0 && total > 0) {
                        statusProgress.value = current;
                        statusProgress.max = total;
                    }
                },
            }).then(() => {
                setStatusMode('hidden');
            }, displayFailureNotice);
        }
    }
})();
