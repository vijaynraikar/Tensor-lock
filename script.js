document.body.style.userSelect = "none";

function showPopup(message) {
    let popup = document.createElement("div");
    popup.innerText = message;
    popup.style.position = "fixed";
    popup.style.top = "20px";
    popup.style.right = "20px";
    popup.style.background = "rgba(0, 0, 0, 0.8)";
    popup.style.color = "white";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "5px";
    popup.style.fontSize = "16px";
    popup.style.zIndex = "9999";
    popup.style.transition = "opacity 0.5s ease-in-out";

    document.body.appendChild(popup);

    // Remove the popup after 2 seconds
    setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => popup.remove(), 500);
    }, 2000);
}

// Function to detect keyboard shortcuts (only for actual shortcuts)
function detectShortcut(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) {
        event.preventDefault(); // Prevent default behavior only for shortcuts

        let shortcut = [];
        if (event.ctrlKey) shortcut.push("Ctrl");
        if (event.altKey) shortcut.push("Alt");
        if (event.metaKey) shortcut.push("Meta");

        let keyName = getKeyName(event);
        shortcut.push(keyName);
        let shortcutKey = shortcut.join(" + ");

        // Show popup notification
        showPopup(`Shortcut used: ${shortcutKey}`);

        // Send shortcut key data to the backend
        sendShortcutData(shortcutKey);
    }
}

// Function to handle special keys (Tab, Print Screen, etc.)
function getKeyName(event) {
    if (event.key === "Tab") return "Tab";
    if (event.key === "PrintScreen") return "Print Screen";
    return event.key.toUpperCase();
}

// Function to send shortcut data to the backend
function sendShortcutData(shortcutKey) {
    fetch("http://localhost:3000/shortcut-detected", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ shortcut: shortcutKey }),
    })
    .then(response => response.json())
    .then(data => console.log("Server Response:", data))
    .catch(error => console.error("Error sending shortcut key:", error));
}

// Attach event listener for keydown events (only if Ctrl, Alt, or Meta is pressed)
document.addEventListener("keydown", detectShortcut);

// Function to inject CSS for blur effect
function injectCSS() {
    const style = document.createElement("style");
    style.innerHTML = `
      .blur {
        filter: blur(20px) !important;
      }
    `;
    document.head.appendChild(style);
}

// Call function to add CSS
injectCSS();

// Function to apply blur effect
function applyBlur() {
    document.body.classList.add("blur");
    setTimeout(() => document.body.classList.remove("blur"), 2000);
}

// Alternative: Detect when user switches window (possible screenshot attempt)
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        applyBlur();
    }
});

// Attempt to detect Print Screen (limited browser support)
document.addEventListener("keyup", function (event) {
    if (event.key === "PrintScreen") {
        event.preventDefault();
        applyBlur();
    }
});

// Function to hide the page before printing
function hidePageBeforePrint() {
    document.body.style.display = "none";
}

// Function to restore the page after printing
function restorePageAfterPrint() {
    document.body.style.display = "block";
}

// Listen for the print event
window.addEventListener("beforeprint", hidePageBeforePrint);
window.addEventListener("afterprint", restorePageAfterPrint);

// Function to check for abnormal screen resizing (cheating detection)
function checkWidthDifference() {
    let diffInnerOuter = window.outerWidth - window.innerWidth;
    let diffHeight = window.screen.height - window.outerHeight;
    let diffWidth = window.screen.width - window.outerWidth;

    if (Math.abs(diffInnerOuter) > 100 ||
        Math.abs(diffHeight) > 50 ||
        Math.abs(diffWidth) > 100) {
    document.body.classList.add("blur");
        
        sendCheatingData(); // Send cheating alert to backend
        showPopup(`Cheating detected. Please close it.`);
        console.clear();
        location.reload();
    }
}

// Function to send cheating detection to the backend
function sendCheatingData() {
    fetch("http://localhost:3000/cheating", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(response => response.json())
    .then(data => console.log("Server Response:", data))
    .catch(error => console.error("Error sending cheating data:", error));
}

// Function to force fullscreen
function forceFullScreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}

// Run cheating detection every 3 seconds
setInterval(() => {
    checkWidthDifference();
}, 3000);



function handleTabSwitch(timeHidden) {
    fetch("http://localhost:3000/cheat-tabSwitch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ timeHidden: timeHidden }) // Send the duration of inactivity
    })
    .then(response => response.json())
    .then(data => console.log("Server Response:", data))
    .catch(error => console.error("Error sending cheating data:", error));
}

const visibilityTimeout = 30 * 1000; // 40 seconds (Updated comment)
let hiddenTime = null;
let visible;
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        visible++;
        hiddenTime = Date.now(); // Start the timer
        document.body.classList.add("blur");
    } else {
        setTimeout(() => document.body.classList.remove("blur"), 2000);

        if (hiddenTime) {
            let timeHidden = Date.now() - hiddenTime;
            
            if (timeHidden > visibilityTimeout) {
                handleTabSwitch(timeHidden); // Send duration to the server
                showPopup(`You were inactive for too long! +20 risk points.`);
            }

            hiddenTime = null; // Reset timer after checking inactivity
        }
    }
});


window.addEventListener("blur", function () {
    document.body.classList.add("blur");
});

window.addEventListener("focus", function () {
    setTimeout(() => {
        document.body.classList.remove("blur");
    }, 2000);
});


document.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("keydown", function (event) {
    if (event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && event.key === "I") ||
        (event.ctrlKey && event.key === "U")) {
        event.preventDefault();
        showPopup("Developer tools are disabled!");
    }
});


document.querySelectorAll('form').forEach(function (form) {
    form.setAttribute('autocomplete', 'off');
});

document.querySelectorAll('input').forEach(function (input) {
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('name', 'randomname_' + Math.random().toString(36).substring(2));
});

document.querySelectorAll('textarea').forEach(function (textarea) {
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');
    textarea.setAttribute('spellcheck', 'false');
});

document.querySelectorAll('input[type="password"]').forEach(function (input) {
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('name', 'randomname_' + Math.random().toString(36).substring(2));
});



document.addEventListener("mouseleave", function () {
    document.body.classList.add("blur");
});
document.addEventListener("mouseenter", function () {
    setTimeout(() => document.body.classList.remove("blur"), 2000);
});

let currentScore = 0; 


function getRemoteAccess() {
    fetch("http://localhost:3000/remote-access-flag")
        .then(response => response.json())
        .then(data => {
            if (data.remoteAccessDetected) {
                blockUser("Remote Desktop Detected. Access Blocked!");
            }
        })
        .catch(error => console.error("Error fetching remote access flag:", error));
}

function blockUser(message) {
    localStorage.setItem("accessBlocked", "true");

    let blocker = document.createElement("div");
    blocker.id = "blocker";
    blocker.style.position = "fixed";
    blocker.style.top = "0";
    blocker.style.left = "0";
    blocker.style.width = "100vw";
    blocker.style.height = "100vh";
    blocker.style.background = "black";
    blocker.style.color = "white";
    blocker.style.fontSize = "24px";
    blocker.style.display = "flex";
    blocker.style.justifyContent = "center";
    blocker.style.alignItems = "center";
    blocker.style.zIndex = "9999";
    blocker.innerText = message;

    if (!document.getElementById("blocker")) {
        document.body.appendChild(blocker);
    }

    document.onkeydown = (e) => e.preventDefault();
    document.onmousedown = (e) => e.preventDefault();
    document.onmousemove = (e) => e.preventDefault();

    setTimeout(() => {
        window.location.href = "about:blank"; // Redirect to blank page to prevent navigation
        window.close(); // Try to close the tab (may not work in some browsers)
    }, 2000);
}

// Check if user is already blocked on page load
if (localStorage.getItem("accessBlocked") === "true") {
    blockUser("You have been blocked due to Remote Desktop detection!");
} else {
    setInterval(getRemoteAccess, 2000);
}


setInterval(() => {
    if ((currentScore > 50 ) || (visible>=3)) {
        enterFullscreen();
    }
    if (currentScore > 100) {
        blockUser("Remote Desktop Detected. Access Blocked!");
    }}
,500);


// Fetch score from the backend
function getScore() {
    fetch("http://localhost:3000/get-score") 
        .then(response => response.json())
        .then(data => {
            currentScore = data.score; 
            console.log("Current Score:", currentScore);  // Corrected the logging
            showPopup(`Current Score: ${currentScore}`);
        })
        .catch(error => console.error("Error fetching score:", error));
}

// Function to enter fullscreen
const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
};
setInterval(() => {
    console.clear();
    getScore();
}, 200);

// Trigger fullscreen when conditions met
setInterval(() => {
    // Check if score > 50 or visible >= 3 to enter fullscreen
    if ((currentScore > 50) || (visible >= 3)) {
        enterFullscreen();
    }

    // Check if score > 100 to block user
    if (currentScore > 100) {
        blockUser("Remote Desktop Detected. Access Blocked!");
    }
}, 500);

// Optional: Listen to user interaction to trigger fullscreen manually
document.addEventListener("click", () => {
    if ((currentScore > 50) || (visible >= 3)) {
        enterFullscreen();
    }
});


let previousScore = currentScore;

setInterval(() => {
    console.clear();
    getScore();
    
    // Check if the score has decreased
    if (currentScore < previousScore) {
        showPopup(`Congratulations! Your score has decreased.`);
    }

    // Update previousScore to current score
    previousScore = currentScore;
}, 200);
