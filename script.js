const rates = {
    "Regular Night": 160,
    "Weekend Nighttime": 200,
    "Weekend Daytime": 250,
    "Holiday": 375,
    "Early Take-over": 40,
    "Civic Day": 187.50
};

const inputIds = {
    "Regular Night": "regularNight",
    "Weekend Nighttime": "weekendNight",
    "Weekend Daytime": "weekendDay",
    "Holiday": "holidayDay",
    "Early Take-over": "earlyTakeover",
    "Civic Day": "civicDay"
};

document.getElementById('overtimeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateAllowance();
});

function formatCurrency(value) {
    // Always round down (floor) to 2 decimals
    const floored = Math.floor(value * 100) / 100;
    return floored.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculateAllowance() {
    let total = 0;
    let breakdown = [];
    let hasInput = false;

    // Calculate for each category
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

    // Display results
    displayResults(total, breakdown);
}

function displayResults(total, breakdown) {
    // Calculate tax deduction and net amount
    const taxRate = 0.05; // 5% tax
    const taxAmount = total * taxRate;
    const netAmount = total - taxAmount;

    // Update total amount (show net amount)
    document.getElementById('totalAmount').textContent = `${formatCurrency(netAmount)} GH₵`;

    // Create breakdown items
    const breakdownContainer = document.getElementById('breakdownItems');
    breakdownContainer.innerHTML = '';

    breakdown.forEach(item => {
        const div = document.createElement('div');
        div.className = 'breakdown-item';

        // Format the display text with inner span
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

    // Add subtotal row
    const subtotalDiv = document.createElement('div');
    subtotalDiv.className = 'breakdown-item';
    subtotalDiv.innerHTML = `
        <span><strong>Gross Total:</strong></span>
        <span><strong>${formatCurrency(total)}</strong></span>
    `;
    breakdownContainer.appendChild(subtotalDiv);

    // Add tax deduction row
    const taxDiv = document.createElement('div');
    taxDiv.className = 'breakdown-item';
    taxDiv.style.color = '#e74c3c';
    taxDiv.innerHTML = `
        <span>Tax Deduction (5%):</span>
        <span>-${formatCurrency(taxAmount)}</span>
    `;
    breakdownContainer.appendChild(taxDiv);

    // Add net total row
    const netTotalDiv = document.createElement('div');
    netTotalDiv.className = 'breakdown-item';
    netTotalDiv.style.backgroundColor = 'rgba(120, 193, 68, 0.1)';
    netTotalDiv.style.borderRadius = '8px';
    netTotalDiv.style.padding = '10px';
    netTotalDiv.innerHTML = `
        <span><strong>Net Amount (After Tax):</strong></span>
        <span><strong>${formatCurrency(netAmount)}</strong></span>
    `;
    breakdownContainer.appendChild(netTotalDiv);

    // Show result section
    document.getElementById('result').style.display = 'block';
}

function resetCalculator() {
    // Clear all inputs
    Object.values(inputIds).forEach(id => {
        document.getElementById(id).value = '';
    });

    // Hide result section
    document.getElementById('result').style.display = 'none';
}

// Add input validation and formatting
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function(e) {
        // Ensure non-negative values
        if (parseInt(this.value) < 0) {
            this.value = 0;
        }
    });

    // Add enter key support
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateAllowance();
        }
    });
});

// Register service worker for PWA
if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("./sw.js")
    .then(reg => console.log("Service Worker registered:", reg))
    .catch(err => console.error("Service Worker registration failed:", err));
}
