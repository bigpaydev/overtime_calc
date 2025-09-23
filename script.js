const rates = {
    "Regular Night": 160,
    "Weekend Nighttime": 200,
    "Weekend Daytime": 250,
    "Holiday": 375,
    "Early Take-over": 40,
    // "Civic Day": 187.50
};

const inputIds = {
    "Regular Night": "regularNight",
    "Weekend Nighttime": "weekendNight",
    "Weekend Daytime": "weekendDay",
    "Holiday": "holidayDay",
    "Early Take-over": "earlyTakeover",
    // "Civic Day": "civicDay"
};

const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
    @keyframes highlightResults {
        0% { 
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(120, 193, 68, 0.08);
        }
        50% { 
            transform: scale(1.02);
            box-shadow: 0 8px 30px rgba(120, 193, 68, 0.2);
        }
        100% { 
            transform: scale(1);
            box-shadow: 0 4px 20px rgba(120, 193, 68, 0.08);
        }
    }
`;
document.head.appendChild(highlightStyle);
document.getElementById('overtimeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAllowance();
});

function setupRegularNightMirroring() {
    const regularNightInput = document.getElementById(inputIds["Regular Night"]);
    const earlyTakeoverInput = document.getElementById(inputIds["Early Take-over"]);
    let userHasEditedEarlyTakeover = false;

    earlyTakeoverInput.addEventListener('input', function() {
        userHasEditedEarlyTakeover = true;
    });

    regularNightInput.addEventListener('input', function() {
        if (!userHasEditedEarlyTakeover) {
            earlyTakeoverInput.value = this.value;
        }
    });

    window.addEventListener('formReset', function() {
        userHasEditedEarlyTakeover = false;
    });
}

function formatCurrency(value) {
    // Always floor to 2 decimals
    const floored = Math.floor(value * 100) / 100;
    return floored.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateAllowance() {
    let total = 0;
    let breakdown = [];
    let hasInput = false;

    for (const [description, rate] of Object.entries(rates)) {
        const inputId = inputIds[description];
        const days = parseInt(document.getElementById(inputId).value) || 0;
        
        if (days > 0) {
            hasInput = true;
            const subtotal = days * rate;
            total += subtotal;
            breakdown.push({
                description: description,
                days: days,
                rate: rate,
                subtotal: subtotal
            });
        }
    }

    if (!hasInput) {
        alert('Please enter at least one day count.');
        return;
    }

    displayResults(total, breakdown);
}

function scrollToResults() {
    const resultSection = document.getElementById('result');
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
        // On mobile, smooth scroll to results
        resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
        });
    } else {
        // On desktop, just ensure results are visible, with a small highlight animation
        resultSection.style.animation = 'none';
        resultSection.offsetHeight; // Trigger reflow
        resultSection.style.animation = 'highlightResults 0.6s ease-out';
    }
}

function displayResults(total, breakdown) {
    const taxRate = 0.05; // 5% tax
    const taxAmount = total * taxRate;
    const netAmount = total - taxAmount;
    document.getElementById('totalAmount').textContent = `${formatCurrency(netAmount)} GH₵`;

    // Create breakdown items
    const breakdownContainer = document.getElementById('breakdownItems');
    breakdownContainer.innerHTML = '';

    breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';
        let displayText = '';
        if (item.description === 'Early Take-over') {
            displayText = `
                <span class="desc-text">${item.description}:</span> 
                <span class="desc-detail">${item.days} occurrences × ${item.rate}</span>
            `;
        } else {
            displayText = `
                <span class="desc-text">${item.description}:</span> 
                <span class="desc-detail">${item.days} days × ${item.rate}</span>
            `;
        }

        div.innerHTML = `
            <span class="breakdown-left">${displayText}</span>
            <span class="breakdown-right">${formatCurrency(item.subtotal)}</span>
        `;
        breakdownContainer.appendChild(div);
    });

    // subtotal
    const subtotalDiv = document.createElement('div');
    subtotalDiv.className = 'breakdown-item';
    subtotalDiv.innerHTML = `
        <span><strong>Gross Total:</strong></span>
        <span><strong>${formatCurrency(total)}</strong></span>
    `;
    breakdownContainer.appendChild(subtotalDiv);

    // tax deduction
    const taxDiv = document.createElement('div');
    taxDiv.className = 'breakdown-item';
    taxDiv.style.color = '#e74c3c';
    taxDiv.innerHTML = `
        <span>Tax Deduction (5%):</span>
        <span>-${formatCurrency(taxAmount)}</span>
    `;
    breakdownContainer.appendChild(taxDiv);

    // net total
    const netTotalDiv = document.createElement('div');
    netTotalDiv.className = 'breakdown-item';
    netTotalDiv.style.backgroundColor = 'rgba(120, 193, 68, 0.1)';
    netTotalDiv.style.borderRadius = '8px';
    netTotalDiv.style.padding = '10px';
    netTotalDiv.innerHTML = `
        <span><strong>Net Amount:</strong></span>
        <span><strong>${formatCurrency(netAmount)}</strong></span>
    `;
    breakdownContainer.appendChild(netTotalDiv);

    // results
    document.getElementById('result').style.display = 'block';
    setTimeout(scrollToResults, 100);
}

function resetCalculator() {
    Object.values(inputIds).forEach(id => {
        document.getElementById(id).value = '';
    });

    window.dispatchEvent(new Event('formReset'));
    document.getElementById('result').style.display = 'none';
}

function restrictInputToNumbers() {
    const numberInputs = Object.values(inputIds).map(id => document.getElementById(id));
    numberInputs.forEach(input => {
        // Prevent non-numeric characters on keypress
        input.addEventListener('keypress', function(e) {
            // Allow: backspace, delete, tab, escape, enter
            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });

        // Remove any non-numeric characters on paste or input
        input.addEventListener('input', function(e) {
            // Remove any non-numeric characters
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // Ensure non-negative values
            if (parseInt(this.value) < 0) {
                this.value = '';
            }
        });

        // Prevent right-click context menu to avoid paste of non-numeric content
        input.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
}

function initializeThemeStorage() {
    const darkToggle = document.getElementById('darkModeToggle');
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');

    // Load saved theme preference
    const savedTheme = localStorage.getItem('overtime-calculator-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
    }

    // Theme toggle with storage
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Save theme preference
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('overtime-calculator-theme', 'dark');
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            localStorage.setItem('overtime-calculator-theme', 'light');
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    });
}

// Register service worker for PWA
if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("./sw.js")
    .then(reg => console.log("Service Worker registered:", reg))
    .catch(err => console.error("Service Worker registration failed:", err));
}

initializeThemeStorage();
restrictInputToNumbers();
setupRegularNightMirroring();