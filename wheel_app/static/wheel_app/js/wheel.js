// Select elements
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin-wheel");
const resultDisplay = document.getElementById("selected-name");

let names = []; // List of names
let isSpinning = false; // Prevent multiple spins
let currentAngle = 0; // Current rotation angle
let numberOfSections = 1;

// Add required styles to the document
const style = document.createElement('style');
style.textContent = `
    .winner-modal {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2em;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0,0,0,0.2);
        z-index: 1000;
        text-align: center;
        animation: pop-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .duplicate-alert {
        display: none;
        background: #FFE5E5;
        border: 1px solid #FF6B6B;
        border-radius: 5px;
        padding: 15px;
        margin: 10px 0;
        color: #D63030;
    }

    .duplicate-alert ul {
        list-style: none;
        padding: 0;
        margin: 10px 0 0 0;
    }

    .duplicate-alert li {
        margin: 5px 0;
        padding: 5px;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 3px;
    }

    @keyframes pop-in {
        0% { transform: translate(-50%, -50%) scale(0); }
        80% { transform: translate(-50%, -50%) scale(1.1); }
        100% { transform: translate(-50%, -50%) scale(1); }
    }

    .winner-modal h2 {
        margin: 0;
        color: #333;
        font-size: 24px;
    }

    .winner-modal .winner-name {
        font-size: 32px;
        color: #FF6B6B;
        margin: 20px 0;
        font-weight: bold;
    }

    .modal-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    }

    .close-button {
        background: #FF6B6B;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 15px;
    }

    .close-button:hover {
        background: #ff5252;
    }
`;
document.head.appendChild(style);

// Create duplicate alert element
const duplicateAlert = document.createElement('div');
duplicateAlert.className = 'duplicate-alert';
document.querySelector('#names').parentNode.insertBefore(duplicateAlert, document.querySelector('#names').nextSibling);

// Function to check for duplicate names
function findDuplicates(names) {
    const duplicates = {};
    names.forEach((name, index) => {
        const normalizedName = name.toLowerCase().trim();
        if (names.slice(0, index).concat(names.slice(index + 1))
            .map(n => n.toLowerCase().trim())
            .includes(normalizedName)) {
            duplicates[normalizedName] = true;
        }
    });
    return Object.keys(duplicates);
}

// Function to show duplicate alert
function showDuplicateAlert(duplicates) {
    duplicateAlert.innerHTML = `
        <strong>⚠️ Duplicate names found!</strong>
        <p>Please make these names unique before continuing:</p>
        <ul>
            ${duplicates.map(name => `<li>"${name}"</li>`).join('')}
        </ul>
    `;
    duplicateAlert.style.display = 'block';
}

// Create modal elements
const modalOverlay = document.createElement('div');
modalOverlay.className = 'modal-overlay';

const modalContent = document.createElement('div');
modalContent.className = 'winner-modal';
modalContent.innerHTML = `
    <h2>🎉 We Have a Winner! 🎉</h2>
    <div class="winner-name"></div>
    <button class="close-button">Close</button>
`;

document.body.appendChild(modalOverlay);
document.body.appendChild(modalContent);

// Load confetti library
const confettiScript = document.createElement('script');
confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
document.head.appendChild(confettiScript);

// Function to trigger celebration
function celebrate(winnerName) {
    modalOverlay.style.display = 'block';
    modalContent.style.display = 'block';
    modalContent.querySelector('.winner-name').textContent = winnerName;

    if (window.confetti) {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio)
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    resultDisplay.textContent = winnerName;
}

// Close modal handler
modalContent.querySelector('.close-button').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    modalContent.style.display = 'none';
});

// Extended color palette
const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD",
    "#D4A5A5", "#9B5DE5", "#F15BB5", "#00BBF9", "#00F5D4",
    "#FEE440", "#8338EC", "#FB5607", "#3A86FF", "#FF006E",
    "#38B000", "#7209B7", "#F72585", "#4CC9F0", "#B5E48C"
];

function drawArrow() {
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(190, 10);
    ctx.lineTo(200, 30);
    ctx.lineTo(210, 10);
    ctx.closePath();
    ctx.fill();
}

function drawWheel(names) {
    const numSections = names.length;
    const arcSize = (2 * Math.PI) / numSections;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSections; i++) {
        const angle = i * arcSize + currentAngle;

        ctx.beginPath();
        ctx.moveTo(200, 200);
        ctx.arc(200, 200, 200, angle, angle + arcSize);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.translate(200, 200);
        ctx.rotate(angle + arcSize / 2);
        ctx.textAlign = "center";
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'black';
        ctx.font = "bold 14px Arial";
        ctx.fillText(names[i], 0, -160);
        ctx.restore();
    }

    drawArrow();
}

function spinWheel() {
    // Check if there are any names and no duplicates before spinning
    if (isSpinning || names.length === 0) return;

    const scrollbar = document.getElementById("section-slider");
    const generateButton = document.getElementById("generate-wheel");

    scrollbar.disabled = true;
    scrollbar.classList.add("disabled");

    generateButton.disabled = true;
    generateButton.classList.add("disabled");

    isSpinning = true;
    let spinSpeed = Math.random() * 15 + 20;

    function animate() {
        spinSpeed *= 0.98;
        currentAngle += (spinSpeed * Math.PI) / 180;

        drawWheel(names);

        if (spinSpeed > 0.1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;

            const numSections = names.length;
            const arcSize = (2 * Math.PI) / numSections;

            let finalAngle = (currentAngle + Math.PI/2) % (2 * Math.PI);
            if (finalAngle < 0) finalAngle += 2 * Math.PI;
            finalAngle = 2 * Math.PI - finalAngle;

            const selectedIndex = Math.floor(finalAngle / arcSize) % names.length;

            celebrate(names[selectedIndex]);

            scrollbar.disabled = false;
            scrollbar.classList.remove("disabled");

            generateButton.disabled = false;
            generateButton.classList.remove("disabled");
        }
    }

    requestAnimationFrame(animate);
}

function updateSectionCount(value) {
    numberOfSections = parseInt(value, 10);
    document.getElementById("section-count-display").textContent = value;

    const placeholderNames = Array.from({length: numberOfSections }, (_, i) => `Participant ${i +1}`)
    names = placeholderNames
    if (numberOfSections > 1){
     drawWheel(names);
    } else {
        // Clear the canvas to "remove" the wheel
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    updateSectionCount(numberOfSections);
});

// Modified event listeners
spinButton.addEventListener("click", spinWheel);

document.getElementById("generate-wheel").addEventListener("click", () => {
    const input = document.getElementById("names").value;
    const nameList = input.split(",").map((name) => name.trim()).filter((name) => name);

    // Check for duplicates
    const duplicates = findDuplicates(nameList);

    if (duplicates.length > 0) {
        showDuplicateAlert(duplicates);
        return;
    }

    // Clear any existing duplicate alerts
    duplicateAlert.style.display = 'none';

    // Update names and draw wheel
    names = nameList;
    if (names.length > 0) {
        const scrollbar = document.getElementById("section-count-display");
        scrollbar.disabled = true;
        scrollbar.classList.add("disabled"); // Optional: Add a class for styling
        drawWheel(names);
    }
});