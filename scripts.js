const result = document.getElementById('result');
let income = 0;
let daysUntilPay = 0;

document.getElementById('budget-form').addEventListener('submit', function (event) {
    event.preventDefault();

    result.innerHTML = "";

    income = document.getElementById("income").value;
    const payDate = document.getElementById("pay-date").value;

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

