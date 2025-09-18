// Update speed value display
document.getElementById('speed').addEventListener('input', function() {
    document.getElementById('speedValue').textContent = this.value;
});

// Get current tab and update UI
function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs && tabs.length > 0) {
                resolve(tabs[0]);
            } else {
                reject(new Error('No active tab found'));
            }
        });
    });
}

// Initialize popup
async function initializePopup() {
    const tab = await getCurrentTab();

    // Check if autoscroll is currently active
    chrome.tabs.sendMessage(tab.id, {action: "getStatus"}, function(response) {
        if (chrome.runtime.lastError) {
            // No response means autoscroll is not active
            updateStatus(false);
        } else if (response && response.active) {
            updateStatus(true, response.speed, response.direction);
            document.getElementById('speed').value = response.speed;
            document.getElementById('speedValue').textContent = response.speed;
            document.getElementById('direction').value = response.direction;
        }
    });
}

// Update status display
function updateStatus(active, speed = 5, direction = 'down') {
    const statusEl = document.getElementById('status');
    const toggleBtn = document.getElementById('toggleButton');
    const pauseBtn = document.getElementById('pauseButton');

    if (active) {
        statusEl.textContent = `AutoScroll: ON (${direction})`;
        statusEl.className = 'status active';
        toggleBtn.textContent = 'Stop AutoScroll';
        pauseBtn.disabled = false;
    } else {
        statusEl.textContent = 'AutoScroll: OFF';
        statusEl.className = 'status inactive';
        toggleBtn.textContent = 'Start AutoScroll';
        pauseBtn.disabled = true;
    }
}

// Toggle autoscroll
document.getElementById('toggleButton').addEventListener('click', async function() {
    const tab = await getCurrentTab();
    const speed = parseInt(document.getElementById('speed').value);
    const direction = document.getElementById('direction').value;

    chrome.tabs.sendMessage(tab.id, {
        action: "toggle",
        speed: speed,
        direction: direction
    }, function(response) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        updateStatus(response.active, speed, direction);
    });
});

// Pause/resume autoscroll
document.getElementById('pauseButton').addEventListener('click', async function() {
    const tab = await getCurrentTab();

    chrome.tabs.sendMessage(tab.id, {
        action: "pause"
    }, function(response) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }
        updateStatus(response.active);

        const pauseBtn = document.getElementById('pauseButton');
        if (response.active) {
            pauseBtn.textContent = 'Pause';
        } else {
            pauseBtn.textContent = 'Resume';
        }
    });
});

// Initialize when popup loads
document.addEventListener('DOMContentLoaded', initializePopup);