const result = document.getElementById('result');
let income = 0;
let daysUntilPay = 0;

// Define billIcons at the top of the file
const billIcons = {
    'rent': 'fas fa-house',
    'mortgage': 'fas fa-house',
    'utilities': 'fas fa-water',
    'water': 'fas fa-water',
    'electricity': 'fas fa-bolt',
    'gas': 'fas fa-fire',
    'internet': 'fas fa-wifi',
    'cable': 'fas fa-tv',
    'groceries': 'fas fa-shopping-cart',
    'food': 'fas fa-utensils',
    'transportation': 'fas fa-car',
    'car note': 'fas fa-car',
    'car insurance': 'fas fa-car-crash',
    'car payment': 'fas fa-car',
    'phone': 'fas fa-phone',
    'insurance': 'fas fa-shield-alt',
    'subscriptions': 'fas fa-credit-card',
    'other': 'fas fa-money-bill',
};

document.getElementById('budget-form').addEventListener('submit', function (event) {
    event.preventDefault();
    calculateBudget();
});

// Handle dates in a consistent way to avoid timezone issues
function normalizeDate(dateInput) {
    // If it's already a date string in YYYY-MM-DD format, return it
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
    }
    
    // If it's a Date object or another format, convert to YYYY-MM-DD
    const date = new Date(dateInput);
    return date.toISOString().split('T')[0];
}

// Calculate days between two date strings (YYYY-MM-DD format)
function daysBetween(startDateStr, endDateStr) {
    // Create date objects at noon to avoid any daylight saving issues
    const startDate = new Date(startDateStr + 'T12:00:00');
    const endDate = new Date(endDateStr + 'T12:00:00');
    
    // Calculate the time difference in milliseconds
    const timeDiff = endDate - startDate;
    
    // Convert to days
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

function calculateBudget() {
    result.innerHTML = "";
    
    income = document.getElementById("income").value;
    const payDate = document.getElementById("pay-date").value;

    if (!income || !payDate) {
        showError("Please enter both income and pay date to calculate budget.");
        return false;
    }

    setIncome(income);
    setPayDate(payDate);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate days until pay
    daysUntilPay = daysBetween(today, payDate);

    if (daysUntilPay <= 0) {
        showError("Please select a future date for your next pay date.");
        return false;
    }

    if (income <= 0) {
        showError("Please enter a positive value for income.");
        return false;
    }
    
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    // Get the bills and sort them by due date first
    const bills = getBills();
    
    // Sort bills by due date, the same way as in updateBills
    bills.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return normalizeDate(a.dueDate).localeCompare(normalizeDate(b.dueDate));
    });
    
    // Find upcoming bills within the sorted array
    let upcomingBillsTotal = 0;
    let upcomingBills = [];
    const normalizedPayDate = normalizeDate(payDate);
    const normalizedToday = normalizeDate(today);

    bills.forEach(bill => {
        if (bill.dueDate) {
            const normalizedDueDate = normalizeDate(bill.dueDate);
            
            if (normalizedDueDate <= normalizedPayDate && normalizedDueDate >= normalizedToday) {
                upcomingBillsTotal += parseFloat(bill.amount);
                upcomingBills.push(bill);
            }
        }
    });

    // Subtract upcoming bills from income
    const availableIncome = income - upcomingBillsTotal;
    
    // Check if we'll have enough income for bills
    if (availableIncome < 0) {
        document.getElementById("result").style.borderLeft = 'none';
        showError(`Warning: Your upcoming bills (${formatter.format(upcomingBillsTotal)}) exceed your income (${formatter.format(income)}). Consider adjusting your budget.`);
        return false;
    }
    
    const dailyBudget = availableIncome / daysUntilPay;

    // Create the main result container
    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result-animation");
    
    // Add bills information first if there are any
    if (upcomingBills.length > 0) {
        const billsSummary = document.createElement('div');
        billsSummary.classList.add('bills-summary');
        billsSummary.innerHTML = `
            <p class="bills-header">Upcoming bills before next pay date: ${formatter.format(upcomingBillsTotal)}</p>
            <ul class="bills-list">
                ${upcomingBills.map(bill => `
                    <li>
                        <i class="${getBillIcon(bill.name)}"></i>
                        <span>${bill.name}</span>
                        <span>${formatter.format(bill.amount)}</span>
                        <span class="bill-due-date">Due: ${formatDate(bill.dueDate)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        resultContainer.appendChild(billsSummary);
    } else {
        // No upcoming bills
        const noBillsMessage = document.createElement('p');
        noBillsMessage.classList.add('no-bills-message');
        noBillsMessage.textContent = 'No upcoming bills before your next pay date.';
        resultContainer.appendChild(noBillsMessage);
    }

    // Add the daily budget information
    const resultText = `You can spend ${formatter.format(dailyBudget)} per day`;
    const resultParagraph = document.createElement('p');
    resultParagraph.innerHTML = `${resultText} <span style="display:block; font-size:0.9rem; font-weight:400; opacity:0.8; margin-top:5px;">between now and your next pay date (${daysUntilPay} days)</span>`;
    resultContainer.appendChild(resultParagraph);
    
    // Add the result container to the DOM
    result.appendChild(resultContainer);
    
    // Highlight upcoming bills in the bill list
    updateBills(payDate);
    
    return true;
}

function formatDate(dateString) {
    // Convert YYYY-MM-DD to a readable format
    const dateParts = normalizeDate(dateString).split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // months are 0-indexed in JS
    const day = parseInt(dateParts[2]);
    
    // Create a date object using local time
    const date = new Date(year, month, day);
    
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.classList.add('error-message');

    // Remove any potential success styling
    errorContainer.style.borderLeft = '5px solid #e74c3c';

    const errorParagraph = document.createElement('p');
    errorParagraph.textContent = message;
    // No need to set color here as we've added it to CSS

    errorContainer.appendChild(errorParagraph);
    result.appendChild(errorContainer);
}

function setIncome(income){
    localStorage.setItem('income', income);
}

function getIncome(){
    return localStorage.getItem('income');
}

function setPayDate(payDate){
    localStorage.setItem('payDate', payDate);
}

function getPayDate(){
    return localStorage.getItem('payDate');
}

function addBill(){
    const billName = document.getElementById('bill-name').value;
    const billAmount = document.getElementById('bill-amount').value;
    const billDueDate = document.getElementById('bill-due-date').value;
    
    console.log('Adding bill:', billName, billAmount, billDueDate);
    
    if (!billName || !billAmount) {
        alert('Please enter both a name and amount for the bill.');
        return;
    }
    
    if (billAmount <= 0) {
        alert('Please enter a positive amount for the bill.');
        return;
    }
    
    if (!billDueDate) {
        alert('Please select a due date for the bill.');
        return;
    }
    
    const bills = getBills();
    console.log('Current bills before adding:', bills);
    bills.push({
        name: billName, 
        amount: billAmount,
        dueDate: billDueDate
    });
    setBills(bills);

    document.getElementById('bill-name').value = '';
    document.getElementById('bill-amount').value = '';
    document.getElementById('bill-due-date').value = '';
    
    // Update the bill list with the current pay date
    const payDate = getPayDate();
    updateBills(payDate);
    
    // Only recalculate if we have all necessary inputs
    if (document.getElementById('income').value && document.getElementById('pay-date').value) {
        // Recalculate budget after adding a bill
        calculateBudget();
    }
}

function updateBills(payDate = null){
    const bills = getBills();
    console.log('Updating bills UI with:', bills);
    const billList = document.getElementById('bill-list');
    
    if (!billList) {
        console.error('Bill list element not found');
        return;
    }
    
    billList.innerHTML = '';
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Store original bills array before sorting
    const originalBills = [...bills];
    
    // Sort bills by due date
    bills.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return normalizeDate(a.dueDate).localeCompare(normalizeDate(b.dueDate));
    });
    
    // Find each bill's index in the original array
    bills.forEach((bill) => {
        const originalIndex = originalBills.findIndex(originalBill => 
            originalBill.name === bill.name && 
            originalBill.amount === bill.amount && 
            originalBill.dueDate === bill.dueDate
        );
        bill._originalIndex = originalIndex;
    });
    
    bills.forEach((bill) => {
        console.log('Creating bill item for:', bill);
        const billItem = document.createElement('li');
        billItem.classList.add('bill-item');
        
        // Check if bill is upcoming (due before pay date)
        if (payDate && bill.dueDate) {
            const normalizedDueDate = normalizeDate(bill.dueDate);
            const normalizedPayDate = normalizeDate(payDate);
            const normalizedToday = normalizeDate(today);
            
            if (normalizedDueDate <= normalizedPayDate && normalizedDueDate >= normalizedToday) {
                billItem.classList.add('bill-upcoming');
            }
        }
        
        billItem.innerHTML = getBillHtml(bill);
        billList.appendChild(billItem);
        
        // Add event listener directly to the delete button
        const deleteBtn = billItem.querySelector('.delete-bill');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                deleteBill(bill._originalIndex);
            });
        }
    });
}

function getBillHtml(bill){
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });
    
    return `
        <i class="${getBillIcon(bill.name)}"></i>
        <span class="bill-name">${bill.name}</span>
        <span class="bill-amount">${formatter.format(bill.amount)}</span>
        ${bill.dueDate ? `<span class="bill-due-date">Due: ${formatDate(bill.dueDate)}</span>` : ''}
        <button class="delete-bill" type="button"><i class="fas fa-trash"></i></button>
    `;
}

function deleteBill(index){
    // Get the original bills array (unsorted)
    const bills = getBills();
    
    console.log('Deleting bill at index:', index);
    console.log('Bills before deletion:', bills);
    
    // Make sure the index is valid
    if (index >= 0 && index < bills.length) {
        // Remove the bill at the specified index
        bills.splice(index, 1);
        console.log('Bills after deletion:', bills);
        
        // Save the updated bills array
        setBills(bills);
        
        // Update the bill list
        const payDate = getPayDate();
        updateBills(payDate);
        
        // Recalculate budget after deleting a bill
        calculateBudget();
    } else {
        console.error('Invalid bill index:', index);
    }
}

function setBills(bills){
    localStorage.setItem('bills', JSON.stringify(bills));
}

function getBills(){
    const bills = localStorage.getItem('bills');
    return bills ? JSON.parse(bills) : [];
}

function getBillIcon(billName){
    const lowerCaseName = billName.toLowerCase();
    return billIcons[lowerCaseName] || 'fas fa-money-bill';
}

// Wrap initialization code in DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    // Add event listener for the bill form
    const billForm = document.getElementById('bill-form');
    if (billForm) {
        console.log('Bill form found');
        billForm.addEventListener('submit', function(event) {
            event.preventDefault();
            addBill();
        });
    } else {
        console.error('Bill form not found');
    }
    
    // Set today as the minimum date for bill due date
    const billDueDateInput = document.getElementById('bill-due-date');
    if (billDueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        billDueDateInput.min = today;
    }
    
    // Initialize income and pay date from localStorage if available
    const savedIncome = getIncome();
    const savedPayDate = getPayDate();
    
    if (savedIncome) {
        document.getElementById('income').value = savedIncome;
    }
    
    if (savedPayDate) {
        document.getElementById('pay-date').value = savedPayDate;
        
        // If we have pay date and income, calculate the budget on initial load
        if (savedIncome) {
            calculateBudget();
        }
    }
    
    // Initialize bills
    updateBills(savedPayDate);
});



