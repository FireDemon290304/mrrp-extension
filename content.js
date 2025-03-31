const audio = new Audio(chrome.runtime.getURL('Mrrp.mp3'));
let isAudioEnabled = false;
const observer = new MutationObserver(checkForSmile);   // Observe DOM changes and apply the function
const hoverCooldown = 10; // Cooldown for hover sound
const processedNodes = new WeakSet(); // Prevent double-wrapping
let audioContext = null;

// Enable audio context later on user interaction
try {
    audioContext = new AudioContext();
} catch (error) {
    console.warn('AudioContext not supported, falling back to webkitAudioContext');
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound() {
    if (!isAudioEnabled) { console.warn("Sound is disabled."); return; }
    audio.play().then(console.log('Mrrp :3')).catch(error => console.error('Error playing sound:', error));
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
                playSound();
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

// Start MutationObserver later to not crash sites on load
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "enableSound") {
        audioContext.resume().then(() => {
            isAudioEnabled = true;
            console.log("Sound enabled for :3");
        });
    }
});

// Initial scan for existing `:3`
checkForSmile();
