let autoscrollInterval = null;
let isPaused = false;
let currentSpeed = 5;
let currentDirection = 'down';

// Handle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.action) {
        case "toggle":
            if (autoscrollInterval) {
                // Stop existing autoscroll
                clearInterval(autoscrollInterval);
                autoscrollInterval = null;
                isPaused = false;
                sendResponse({active: false});
            } else {
                // Start new autoscroll
                startAutoScroll(request.speed, request.direction);
                sendResponse({active: true, speed: request.speed, direction: request.direction});
            }
            break;

        case "pause":
            if (autoscrollInterval) {
                if (isPaused) {
                    // Resume
                    startAutoScroll(currentSpeed, currentDirection);
                    isPaused = false;
                    sendResponse({active: true});
                } else {
                    // Pause
                    clearInterval(autoscrollInterval);
                    autoscrollInterval = null;
                    isPaused = true;
                    sendResponse({active: false});
                }
            } else {
                sendResponse({active: false});
            }
            break;

        case "getStatus":
            sendResponse({
                active: autoscrollInterval !== null && !isPaused,
                speed: currentSpeed,
                direction: currentDirection
            });
            break;

        default:
            sendResponse({});
    }

    return true; // Required for async response
});

// Start autoscroll with specified speed and direction
function startAutoScroll(speed, direction) {
    currentSpeed = speed;
    currentDirection = direction;

    clearInterval(autoscrollInterval);

    autoscrollInterval = setInterval(function() {
        let scrollX = 0;
        let scrollY = 0;

        switch(direction) {
            case 'down':
                scrollY = speed;
                break;
            case 'up':
                scrollY = -speed;
                break;
            case 'left':
                scrollX = -speed;
                break;
            case 'right':
                scrollX = speed;
                break;
        }

        window.scrollBy(scrollX, scrollY);

        // Stop if we've reached the end (for down/right) or beginning (for up/left)
        if (direction === 'down' && window.innerHeight + window.scrollY >= document.body.scrollHeight) {
            stopAutoScroll();
        } else if (direction === 'up' && window.scrollY <= 0) {
            stopAutoScroll();
        } else if (direction === 'right' && window.innerWidth + window.scrollX >= document.body.scrollWidth) {
            stopAutoScroll();
        } else if (direction === 'left' && window.scrollX <= 0) {
            stopAutoScroll();
        }
    }, 16); // ~60fps
}

// Stop autoscroll
function stopAutoScroll() {
    clearInterval(autoscrollInterval);
    autoscrollInterval = null;
    isPaused = false;
}