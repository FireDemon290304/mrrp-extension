const audio = new Audio(chrome.runtime.getURL('Mrrp.mp3'));
let isAudioEnabled = false;
const observer = new MutationObserver(checkForSmile);
const hoverCooldown = 1000; // 1-second cooldown for hover sound
const processedNodes = new WeakSet(); // Prevent double-wrapping

// Enable audio context on user interaction
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound() {
    if (!isAudioEnabled) return;
    audio.play().catch(error => console.error('Error playing sound:', error));
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

// Start MutationObserver safely
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// Enable sound button (optional)
const enableSoundButton = document.createElement('button');
enableSoundButton.textContent = 'Enable Sound';
enableSoundButton.style.position = 'fixed';
enableSoundButton.style.bottom = '10px';
enableSoundButton.style.right = '10px';
enableSoundButton.style.zIndex = '1000';
document.body.appendChild(enableSoundButton);

enableSoundButton.addEventListener('click', () => {
    audioContext.resume().then(() => {
        isAudioEnabled = true;
        enableSoundButton.remove();
    });
});

// Initial scan for existing `:3`
checkForSmile();
