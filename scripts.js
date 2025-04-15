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

    result.innerHTML = "";

    income = document.getElementById("income").value;
    const payDate = document.getElementById("pay-date").value;

    setIncome(income);
    setPayDate(payDate);

    daysUntilPay = Math.ceil((new Date(payDate) - new Date()) / (1000 * 60 * 60 * 24));

    if (daysUntilPay <= 0) {
        showError("Please select a future date for your next pay date.");
        return;
    }

    if (income <= 0) {
        showError("Please enter a positive value for income.");
        return;
    }

    const dailyBudget = income / daysUntilPay;

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    const resultText = `You can spend ${formatter.format(dailyBudget)} per day`;

    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result-animation");

    const resultParagraph = document.createElement('p');
    resultParagraph.innerHTML = `${resultText} <span style="display:block; font-size:0.9rem; font-weight:400; opacity:0.8; margin-top:5px;">between now and your next pay date (${daysUntilPay} days)</span>`;

    resultContainer.appendChild(resultParagraph);
    result.appendChild(resultContainer);
});

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
    console.log('Adding bill:', billName, billAmount);
    
    if (!billName || !billAmount) {
        console.error('Bill name or amount is empty');
        return;
    }
    
    const bills = getBills();
    console.log('Current bills before adding:', bills);
    bills.push({name: billName, amount: billAmount});
    setBills(bills);

    document.getElementById('bill-name').value = '';
    document.getElementById('bill-amount').value = '';
    updateBills();
}

function updateBills(){
    const bills = getBills();
    console.log('Updating bills UI with:', bills);
    const billList = document.getElementById('bill-list');
    
    if (!billList) {
        console.error('Bill list element not found');
        return;
    }
    
    billList.innerHTML = '';
    bills.forEach(bill => {
        console.log('Creating bill item for:', bill);
        const billItem = document.createElement('li');
        billItem.classList.add('bill-item');
        billItem.innerHTML = getBillHtml(bill);
        billList.appendChild(billItem);
    });
}

function getBillHtml(bill){
    return `
        <i class="${getBillIcon(bill.name)}"></i>
        <span>${bill.name}</span>
        <span>${bill.amount}</span>
    `;
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
    
    // Initialize bills
    updateBills();
});



