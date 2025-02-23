// Array to store all budget entries (loaded from Local Storage if available)
let entries = JSON.parse(localStorage.getItem("budgetEntries")) || [];

// DOM elements for interaction
const form = document.getElementById("budget-form"); // Form for adding entries
const entryList = document.getElementById("entry-list"); // List to display entries
const totalIncomeDisplay = document.getElementById("total-income"); // Income total display
const totalExpensesDisplay = document.getElementById("total-expenses"); // Expenses total display
const balanceDisplay = document.getElementById("balance"); // Balance display
const incomeBar = document.querySelector(".income-bar"); // Income bar in chart
const expenseBar = document.querySelector(".expense-bar"); // Expense bar in chart
const incomeLabel = document.querySelector(".income-label"); // Income chart label
const expenseLabel = document.querySelector(".expense-label"); // Expense chart label
const clearButton = document.querySelector(".clear-all"); // Clear All button

// Load saved entries into the UI on page load
entries.forEach((entry) => {
  const listItem = document.createElement("li");
  listItem.classList.add(entry.type); // Add income/expense class for styling
  const textSpan = document.createElement("span");
  textSpan.textContent = `${entry.description}: $${entry.amount.toFixed(2)}`; // Display text
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete"; // Delete button text
  listItem.appendChild(textSpan); // Add text to list item
  listItem.appendChild(deleteButton); // Add delete button to list item
  entryList.appendChild(listItem); // Add list item to the list

  // Add delete functionality
  deleteButton.addEventListener("click", function () {
    const index = entries.indexOf(entry); // Find entry in array
    entries.splice(index, 1); // Remove from array
    listItem.remove(); // Remove from DOM
    localStorage.setItem("budgetEntries", JSON.stringify(entries)); // Save updated entries
    updateSummary(); // Update totals and chart
    toggleClearButton(); // Check if button should hide
  });
});
updateSummary(); // Update totals and chart with loaded entries
toggleClearButton(); // Ensure button visibility matches loaded entries

// Handle form submission to add new entries
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent page refresh

  // Get input values
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  // Validate inputs
  if (description === "" || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid description and amount!");
    return;
  }

  // Create entry object
  const entry = { description, amount, type };
  entries.push(entry); // Add to entries array

  // Create list item for display
  const listItem = document.createElement("li");
  listItem.classList.add(type); // Add income/expense class for styling
  const textSpan = document.createElement("span");
  textSpan.textContent = `${description}: $${amount.toFixed(2)}`; // Display text
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete"; // Delete button text
  listItem.appendChild(textSpan); // Add text to list item
  listItem.appendChild(deleteButton); // Add delete button to list item
  entryList.appendChild(listItem); // Add list item to the list

  // Add delete functionality
  deleteButton.addEventListener("click", function () {
    const index = entries.indexOf(entry); // Find entry in array
    entries.splice(index, 1); // Remove from array
    listItem.remove(); // Remove from DOM
    localStorage.setItem("budgetEntries", JSON.stringify(entries)); // Save updated entries
    updateSummary(); // Update totals and chart
    toggleClearButton(); // Check if button should hide
  });

  localStorage.setItem("budgetEntries", JSON.stringify(entries)); // Save updated entries
  updateSummary(); // Update totals and chart after adding
  toggleClearButton(); // Check if button should appear

  // Clear form inputs
  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
});

// Handle Clear All button click
clearButton.addEventListener("click", function () {
  entries = []; // Reset entries array
  localStorage.removeItem("budgetEntries"); // Clear saved entries from Local Storage
  entryList.innerHTML = ""; // Clear the list
  totalIncomeDisplay.textContent = "Total Income: $0"; // Reset income display
  totalExpensesDisplay.textContent = "Total Expenses: $0"; // Reset expenses display
  balanceDisplay.textContent = "Balance: $0"; // Reset balance display
  balanceDisplay.classList.remove("positive", "negative"); // Remove balance styling
  incomeBar.style.height = "0px"; // Reset income bar
  expenseBar.style.height = "0px"; // Reset expense bar
  toggleClearButton(); // Update button visibility after clearing
});

// Function to update summary and chart
function updateSummary() {
  // Calculate totals
  const totalIncome = entries
    .filter((entry) => entry.type === "income") // Filter income entries
    .reduce((sum, entry) => sum + entry.amount, 0); // Sum amounts
  const totalExpenses = entries
    .filter((entry) => entry.type === "expense") // Filter expense entries
    .reduce((sum, entry) => sum + entry.amount, 0); // Sum amounts
  const balance = totalIncome - totalExpenses; // Calculate balance

  // Update summary text
  totalIncomeDisplay.textContent = `Total Income: $${totalIncome.toFixed(2)}`;
  totalExpensesDisplay.textContent = `Total Expenses: $${totalExpenses.toFixed(
    2
  )}`;
  balanceDisplay.textContent = `Balance: $${balance.toFixed(2)}`;

  // Style balance based on value
  balanceDisplay.classList.remove("positive", "negative");
  if (balance >= 0) {
    balanceDisplay.classList.add("positive");
  } else {
    balanceDisplay.classList.add("negative");
  }

  // Update chart bars and labels
  const maxHeight = 100; // Matches .chart height in CSS (reduced from 200)
  const maxValue = Math.max(totalIncome, totalExpenses, 1000); // Scale bars, min 1000
  const incomeHeight = (totalIncome / maxValue) * maxHeight; // Calculate income bar height
  const expenseHeight = (totalExpenses / maxValue) * maxHeight; // Calculate expense bar height
  incomeBar.style.height = `${incomeHeight}px`; // Set income bar height
  expenseBar.style.height = `${expenseHeight}px`; // Set expense bar height
  incomeLabel.textContent = `$${totalIncome.toFixed(2)}`; // Update income label
  expenseLabel.textContent = `$${totalExpenses.toFixed(2)}`; // Update expense label
}

// Function to toggle Clear All button visibility
function toggleClearButton() {
  if (entries.length > 2) {
    clearButton.style.display = "block"; // Show when more than 2 entries
  } else {
    clearButton.style.display = "none"; // Hide when 2 or fewer entries
  }
}
