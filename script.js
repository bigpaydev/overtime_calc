const ratesFixed = {
    "Regular Night": 160,
    "Weekend Nighttime": 200,
    // "Weekend Daytime": 250,
    // "Holiday": 375,
    "Early Take-over": 40,
    // "Civic Day": 187.50
};

const rankRates = {
    "Trainee": { weekend: 250, holiday: 375 },
    "Level 2": { weekend: 350, holiday: 525 },
    "Level 3": { weekend: 400, holiday: 600 },
    "Supervisor": { weekend: 450, holiday: 675 }
};

const inputIds = {
    "Regular Night": "regularNight",
    "Weekend Nighttime": "weekendNight",
    "Weekend Daytime": "weekendDay",
    "Holiday": "holidayDay",
    "Early Take-over": "earlyTakeover",
    // "Civic Day": "civicDay"
};

function getSelectedRank() {
    const rankSelect = document.getElementById('rankSelect');
    return rankSelect ? rankSelect.value : null;
}

function updateDynamicRateLabels() {
    const rank = getSelectedRank();
    if (rank && rankRates[rank]) {
        const weekendRate = rankRates[rank].weekend;
        const holidayRate = rankRates[rank].holiday;
        const weekendInfo = document.getElementById('weekendDayRateInfo');
        const holidayInfo = document.getElementById('holidayDayRateInfo');
        if (weekendInfo) weekendInfo.textContent = `(${weekendRate} GH₵ per day for ${rank})`;
        if (holidayInfo) holidayInfo.textContent = `(${holidayRate} GH₵ per day for ${rank})`;
    }
}

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
    const floored = Math.floor(value * 100) / 100;
    return floored.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateAllowance() {
    let total = 0;
    let breakdown = [];
    let hasInput = false;
    const rank = getSelectedRank();

    // Calculate for each category
    for (const [description, rate] of Object.entries(ratesFixed)) {
        const inputId = inputIds[description];
        const days = parseInt(document.getElementById(inputId).value, 10) || 0;
        
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

    {
        const inputId = inputIds["Weekend Daytime"];
        const days = parseInt(document.getElementById(inputId).value, 10) || 0;
        if (days > 0) {
            hasInput = true;
            const rate = rankRates[rank].weekend;
            const subtotal = days * rate;
            total += subtotal;
            breakdown.push({ description: "Weekend Daytime", days, rate, subtotal });
        }
    }

    {
        const inputId = inputIds["Holiday"];
        const days = parseInt(document.getElementById(inputId).value, 10) || 0;
        if (days > 0) {
            hasInput = true;
            const rate = rankRates[rank].holiday;
            const subtotal = days * rate;
            total += subtotal;
            breakdown.push({ description: "Holiday", days, rate, subtotal });
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

function initializeRankAndThemeStorage() {
    const darkToggle = document.getElementById('darkModeToggle');
    const lightIcon = document.getElementById('lightIcon');
    const darkIcon = document.getElementById('darkIcon');
    const rankSelect = document.getElementById('rankSelect');

    // Load saved preferences
    const savedTheme = localStorage.getItem('overtime-calculator-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        lightIcon.style.display = 'none';
        darkIcon.style.display = 'block';
    }
    const savedRank = localStorage.getItem('overtime-calculator-rank');
    if (savedRank && rankRates[savedRank]) {
        rankSelect.value = savedRank;
    }    

    // Theme toggle with storage
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
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

    // Save rank selection when changed
    rankSelect.addEventListener('change', () => {
        localStorage.setItem('overtime-calculator-rank', rankSelect.value);
        updateDynamicRateLabels();
    });    
}

// initialize dynamic labels and listen for rank changes
const rankSelectEl = document.getElementById('rankSelect');
if (rankSelectEl) {
    rankSelectEl.addEventListener('change', updateDynamicRateLabels);
    updateDynamicRateLabels();
}

const btn = document.querySelector('.info-btn');
const tooltip = document.getElementById('overtimeTooltip');

if (btn && tooltip) {
    // Toggle on click (use aria-expanded + css rule to show)
    btn.addEventListener('click', function (e) {
        const expanded = this.getAttribute('aria-expanded') === 'true';
        const newState = String(!expanded);
        this.setAttribute('aria-expanded', newState);
        tooltip.setAttribute('aria-hidden', String(expanded)); // inverse of expanded
    });

    // Keyboard accessibility: show on focus, hide on blur
    btn.addEventListener('focus', () => {
        btn.setAttribute('aria-expanded', 'true');
        tooltip.setAttribute('aria-hidden', 'false');
    });
    btn.addEventListener('blur', () => {
        btn.setAttribute('aria-expanded', 'false');
        tooltip.setAttribute('aria-hidden', 'true');
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!btn.contains(e.target) && !tooltip.contains(e.target)) {
            btn.setAttribute('aria-expanded', 'false');
            tooltip.setAttribute('aria-hidden', 'true');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            btn.setAttribute('aria-expanded', 'false');
            tooltip.setAttribute('aria-hidden', 'true');
            btn.blur();
        }
    });
}

// Register service worker for PWA
if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("./sw.js")
    .then(reg => console.log("Service Worker registered:", reg))
    .catch(err => console.error("Service Worker registration failed:", err));
}

initializeRankAndThemeStorage();
updateDynamicRateLabels();
restrictInputToNumbers();
setupRegularNightMirroring();