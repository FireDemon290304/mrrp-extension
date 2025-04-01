const hoverCooldown = 200; // Cooldown per instance of `:3 in ms`. There to stop constant replays of the sound
const observer = new MutationObserver(checkForSmile);   // Observe DOM changes and apply function
const processedNodes = new WeakSet(); // Prevent double-wrapping

let isAudioEnabled = false;
let audioContext = null;
let cashedAudioBuffer = null; // Cache audio buffer to prevent multiple loads

const mrrpBase64URI = "data:audio/mpeg;base64,SUQzAwAAAAABRVRQRTEAAAAFAAAATWltaVRJVDIAAAAFAAAAbXJycFRBTEIAAAAKAAAAbXJycCBtZW93VFlFUgAAAAUAAAAyMDI1VERSQwAAAAUAAAAyMDI1VFJDSwAAAAIAAAAxVFhYWAAAAA4AAABUWFhYAGlzb21tcDQyVENPTgAAAAQAAABjYXRUWFhYAAAAOQAAAFlvdXR1YmUgbGluawBodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PUJlVXpRNFVIX280//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAOAAAgNgAiIiIiIiIiNjY2NjY2NkdHR0dHR0dYWFhYWFhYaWlpaWlpaXp6enp6enqLi4uLi4uLnZ2dnZ2dnZ2urq6urq6uv7+/v7+/v9DQ0NDQ0NDh4eHh4eHh8vLy8vLy8v////////8AAABQTEFNRTMuMTAwBLkAAAAAAAAAADUgJAPATQAB4AAAIDbORB68AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//vgZAAAAfUAUe0AAAhRQAnNoAABYzoLNbmtAEMGs2c/MTIAjRACAamv1u4IAgCCwcBAEHKPqBAMYPh/UCBzlwfBAEAQOZcHw+CDsE8uD4IAgCAIfdKAhrB8///1g///xACBQBJgBdAVtqEdDz8w8PX/44/834AH7/Az///D3////yD//8AAAABAeHj+hgAAAAAHh4eHhgAAAAAHh4eHpAAAABAeHh4ekAP///////x//+ABMWSWEA8K5KvZKpDIGwYYiY0YIbp4w68jcrQkymmCm8NGrjKBDhFrghYK5ET86QQQMgcHJCz3AXocFCgBFRKtghCviLDkAZjBTqJZILQMpxATmx16gggFwpVCAUKyx9XUkjX3QUpZ488tfAaRJgtOxL8SOF1oRUX99JBsmla92uZPurS/Oo9Bss3TSGkeuKSqPvFi3WH893Yex3le26EzTQDEvylUokUzaltPYkN+Yh2s/78xK72l7Zl0Ut17EzFO/M34hJbWNNS5vtcv3NxXsvtV6abn707XypLteNSnvM5uxL7le/bvTFnK5nctyh4o3YzwgSNTGUYb6xG6b//////////////////+//////////////////0gQ4lIOIEAQ4K42n83ApacbCUSTNUqkBoTihL593NrkCwstfDrJYKbRiLAAnBugF0xyxTyaJMLnicADAFwpBAKqAzJBsOaGZkRpNihxJS4G3h9R3BgU3Hsc4YyXxeDTHAREYgggPseSqH3JoT0VBXByBynJQvG4+hoksMyUiTLKNLRZU4g+bmhYKx/////00/v7P1P1Jv79SCCCJkXiaJcdBBRglM1J8ZplMzuYJpmrFtAmC61FBkEi4YIHzjF9jL/+hWWeGlDIQqUsaUEIC2L5jQAKQuCOBQbZakG3BLhnS22DCFLmblAlhlhexxH2d0C4cCdjlJQpEoHLKaqlKWtI+ePGKKCTMzObufQTrUlWhZBedSpMip2XXM2R0UGr6lI0FmKJxTu6KdJVSFS6qkGVoOi28wbQp60aKBui71MtbJo2ZCcSom3fosVAyCMWNH31Utc6oGhS6yCGFvxQqHBM2Q4pdKA0reysujas26n+qnNEKCXuuGVrCmSQetpmN7i2dE1KKY+3WIRkqBFPpnMoj//8TC35f+naup4qTJhgAMDBUQnQWCZggNicmoFiAnptZHH5bGMilQNCMaIFiDyUIAmZFwGB3KVDkikl278mh94FWC52mORBoA1abFU5OCANBWOGl5iZCK28zEjHEjnhw02reOWic4xRaw0zSuN27JZuwjhZ2QFdSAGgUM6owyQgM+Ux0GFDn4/K55PQJCqYRM4QonDk6CGtT8MTxHIFsQYlWk0RmW2h+RjEQ3QaCg+NkQxLTxU//uwZMIABHVaUf9hoApYo4pP7CQBE22JR+ywcamFMyh9hgl8xFkBoYddiwYo8soZshwAVZDBG8iG3VK8te+T9Bzdzifc5Nw9yFatssOvyZ2s35Diym/MzKSKEzNqsn/xBpm1Uez/7f///0b/ylL//X//z/+dzvI7HVHBMGduRpHgm3HK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5dQWOTRKIAYckpqMGcPwh+B3oToD3lZpXUDSJ1ogILHtFNphIxx1onIeGBM9WGppGnInawxoUCwazQUWI7iOgqKOeq2oeDLvi2TP7IeHm8UBwbOTCKaUzk6E6E3/f/9f6t/////q3+rvb/90ZX/UR4HB8hjAXlCFVAgMUo5GQzE0NshBkDRJECE0oFh9BpUygaObSF2qEP8rY/5WNwfBedIQfTInkwezVeh+LjQbCIdUNHHDhqQpRR46kikfNjkrLGlEx6zTnNnZe5BA8lseSmH3Hl5bKjDLd8UpbF/+HnlZhK2MmWrbal99MfDa2VUTFvpv+507XMvju5jOX/8MOnT2saNPG71X7naFO4pG4ezzsLn6VGVwIDWOWvGQOHAaDsp6SBnCrovDcKiMH1q9fe/LjpyMaYRh0kD/+6Bk24AEkmVPewkc6mCLif9lAn0TuZs39ZWAAbiyp76yoAFvYF4jFaTjEnFcmITiikZM05Dyhg9REHxhbIVM3nZ5ipoun7////z//p//z7dXo6s6H59+WmqiHs+UTuZ5kxjzj0qcSEA+LT1Xe6K0iYCCcKgwCAEAA0OUASijAQdMNA3XTHBbN4yMwMD1TbxOCwEmAaIJgQE/sDeh5A5KTw2YPWwHmEDCpsAxcJABQAFrouTh+oGDACBUFg2kOIP2E5GPgIDwAILAaDoDgWEIHKRXFmjlEl8iwpgyQ6B7EJlImJdmX4N5RSQrIZYEJRmT5NGJdLpkRYi38iw3BuCsjnjJkiKgI6JkgpAS8bIqLxe/4/DfNRySIDPD+RITIlktS0UVJa//i5BTSDkyOgMQkXHGTIhGLeMiPgni9rZSS6zH///Ly2kKYJUJMJIDcNh8IQQEQQDM2MwA6BguCjX/M9NTMJ4GhFF/nALBgboXmMHDP8ACwAegLpSwNuiA0LoDBgDZFHitg/5BRviOSiK1DEPhc8AaAFyCpjrMTxAiGi5fhAAAUDBaYJGblEXKXSwOcYkz+YkvJxPR//+ttf//5W1kRLiy6fJ01+rWpL/5cNSbNDqZu6zdE6o3NUqKOvXrWj//zypMQU1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr/+5BkzwAG0GdK7nKkAJ8s2V/N0AAAAAGkHAAAIAAANIOAAASqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqo=";

async function loadAudio() {
    if (cashedAudioBuffer) return; // Stop new loads if already loaded
    
    // Enable audio context later on user interaction
    try {
        audioContext = new AudioContext();
    } catch (error) {
        console.warn('AudioContext not supported, falling back to webkitAudioContext');
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    audioContext.suspend(); // Suspend audio context until user interaction. Done as default, but here for redundancy

    cashedAudioBuffer = await fetch(mrrpBase64URI)
        .then(response => { return response.arrayBuffer(); })
        .then(arrayBuffer => { return audioContext.decodeAudioData(arrayBuffer); })
        .catch(error => { console.error('Error decoding audio:', error); });
}

async function playSound() {
    if (!isAudioEnabled) { console.warn("Sound is disabled."); return; }
    
    /*const audioInstance = new Audio(chrome.runtime.getURL('Mrrp.mp3'));
    await audioInstance.play();   // xx*/

    if (!cashedAudioBuffer) await loadAudio(); // Load audio if not already loaded

    const source = audioContext.createBufferSource();
    source.buffer = cashedAudioBuffer;
    source.connect(audioContext.destination);
    source.start(0); // Start playback immediately*/
}

// Function to wrap `:3` in a <span>
function wrapSmileys(node) {
    const regex = /:3/g;
    let match;
    let parent = node.parentNode;

    if (!parent || processedNodes.has(node)) return;
    processedNodes.add(node); // Mark node to avoid reprocessing

    let newContent = document.createDocumentFragment();
    let lastIndex = 0;

    while ((match = regex.exec(node.nodeValue)) !== null) {
        let beforeText = document.createTextNode(node.nodeValue.substring(lastIndex, match.index));
        let smileySpan = document.createElement('span');
        smileySpan.textContent = ':3';
        smileySpan.className = 'mrrp';
        smileySpan.dataset.played = "false"; // Prevent repeat plays on hover

        // Hover trigger for sound with cooldown
        smileySpan.addEventListener('mouseover', () => {
            if (smileySpan.dataset.played === "false") {
                playSound().then(console.log('Mrrp :3'))
                    .catch(error => console.error('Error playing sound:', error));
                smileySpan.dataset.played = "true";
                setTimeout(() => {
                    smileySpan.dataset.played = "false"; // Reset after cooldown
                }, hoverCooldown);
            }
        });

        newContent.appendChild(beforeText);
        newContent.appendChild(smileySpan);
        lastIndex = match.index + 2;
    }

    let remainingText = document.createTextNode(node.nodeValue.substring(lastIndex));
    newContent.appendChild(remainingText);

    // Pause observer before modifying the DOM to prevent recursion
    observer.disconnect();
    parent.replaceChild(newContent, node);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

// Detect and highlight `:3`
function checkForSmile() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let nodesToWrap = [];

    while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.includes(':3')) {
            nodesToWrap.push(walker.currentNode);
        }
    }

    nodesToWrap.forEach(wrapSmileys);
}

// -------------------------------- Actions to do at load --------------------------------
// Start MutationObserver later to not crash sites on load
observer.observe(document.body, { childList: true, subtree: true, characterData: true });
loadAudio().then(() => { console.log("Loaded audio and created context"); });

// -------------------------------- Listeners --------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggle") {
        !isAudioEnabled ? audioContext.resume().then(() => {
            checkForSmile();
            isAudioEnabled = true;
            console.log("Sound enabled for :3");
        }) : audioContext.suspend().then(() => {    // disable sound

            document.querySelectorAll('.mrrp').forEach(span => {   // remove span wrappers
                const textNode = document.createTextNode(span.textContent);
                span.replaceWith(textNode);     // Replace with raw text
            });

            observer.disconnect();          // prevent recursion
        }).then(() => {                     // rem reset flag and log
            isAudioEnabled = false;
            console.log("Sound disabled for :3");
        });
    }
}
);

// Initial scan for existing `:3`
//checkForSmile();
