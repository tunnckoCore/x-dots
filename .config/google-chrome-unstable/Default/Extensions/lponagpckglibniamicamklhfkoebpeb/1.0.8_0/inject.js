'use strict';

window.addEventListener('message', msg => {
    if (msg.data && msg.data.installGiphy) {
        injectCSSFile('extension.css');
        injectJSFile('bundle.js');
    };

    if (msg.data && msg.data.giphySearch) {
        chrome.runtime.sendMessage({
            giphySearch: true,
            query: msg.data.query
        }, res => {
            window.postMessage({
                giphyResponse: true,
                res: res
            }, '*');
        });
    }
});

function messageIfFound(window) {
    'use strict';

    try {
        // Determine if the page is truly a GitHub page. Use their
        // feature detection to detect them :)
        const isGitHub = !!require('github/feature-detection');
        if (isGitHub) window.postMessage({ installGiphy: true }, '*');
    } catch(err) {}
}

function runFnInPage(fn) {
    const script = document.createElement('script');
    script.textContent = `;(${fn.toString()}(window))`;
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
}

function injectCSSFile(path) {
    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = chrome.extension.getURL(path);
    document.body.appendChild(link);
}

function injectJSFile(path) {
    const inspectorScript = document.createElement('script');
    inspectorScript.src = chrome.extension.getURL(path);
    document.documentElement.appendChild(inspectorScript);
}

runFnInPage(messageIfFound);
