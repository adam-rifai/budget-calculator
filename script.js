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
const monthFilter = document.getElementById("month-filter"); // Month filter dropdown (for export and list)
const summaryMonthFilter = document.getElementById("summary-month-filter"); // Month filter for summary
const exportBtn = document.getElementById("export-btn"); // Export button

// Set default date to today on page load
const dateInput = document.getElementById("date");
const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
dateInput.value = today; // Set default value

// Function to populate month filters
function populateMonthFilters() {
  const months = new Set(
    entries.map((entry) => {
      const date = new Date(entry.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`; // YYYY-MM format
    })
  );
  const monthOptions = [
    '<option value="current">Current Month</option>',
    ...Array.from(months).map(
      (month) => `<option value="${month}">${month}</option>`
    ),
  ].join("");
  monthFilter.innerHTML =
    '<option value="all">All Months</option>' + monthOptions;
  summaryMonthFilter.innerHTML = monthOptions; // Same options, no "All Months" for summary
  summaryMonthFilter.value = today.slice(0, 7); // Default to current month (YYYY-MM)
}

// Function to render filtered entries in the list
function renderEntries() {
  entryList.innerHTML = ""; // Clear current list
  const selectedMonth = monthFilter.value;
  let filteredEntries = entries;

  if (selectedMonth !== "all") {
    filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      if (selectedMonth === "current") {
        const now = new Date();
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      }
      return (
        `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(
          2,
          "0"
        )}` === selectedMonth
      );
    });
  }

  filteredEntries.forEach((entry) => {
    const listItem = document.createElement("li");
    listItem.classList.add(entry.type); // Add income/expense class for styling
    const textSpan = document.createElement("span");
    textSpan.textContent = `${entry.date} - ${
      entry.description
    }: $${entry.amount.toFixed(2)}`; // Include date in display
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
      populateMonthFilters(); // Update month filters
      renderEntries(); // Re-render filtered list
    });
  });
}

// Load saved entries into the UI on page load
populateMonthFilters();
renderEntries(); // Render initial list
updateSummary(); // Update totals and chart with loaded entries after filters are set
toggleClearButton(); // Ensure button visibility matches loaded entries

// Handle form submission to add new entries
form.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent page refresh

  // Get input values
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value; // Get date value
  const type = document.getElementById("type").value;

  // Validate inputs
  if (description === "" || isNaN(amount) || amount <= 0 || date === "") {
    alert("Please enter a valid description, amount, and date!");
    return;
  }

  // Create entry object with date
  const entry = { description, amount, date, type };
  entries.push(entry); // Add to entries array

  localStorage.setItem("budgetEntries", JSON.stringify(entries)); // Save updated entries
  updateSummary(); // Update totals and chart after adding
  toggleClearButton(); // Check if button should appear
  populateMonthFilters(); // Update month filters after adding
  renderEntries(); // Re-render filtered list

  // Clear form inputs (except date)
  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
  // Date input stays as today, no clearing
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
  incomeLabel.textContent = "$0.00"; // Reset income label
  expenseLabel.textContent = "$0.00"; // Reset expense label
  toggleClearButton(); // Update button visibility after clearing
  populateMonthFilters(); // Reset month filters
  renderEntries(); // Re-render empty list
  updateSummary(); // Update summary and chart to reflect cleared state
});

// Handle Export button click
exportBtn.addEventListener("click", function () {
  const selectedMonth = monthFilter.value;
  let filteredEntries = entries;

  if (selectedMonth !== "all") {
    filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      if (selectedMonth === "current") {
        const now = new Date();
        return (
          entryDate.getMonth() === now.getMonth() &&
          entryDate.getFullYear() === now.getFullYear()
        );
      }
      return (
        `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(
          2,
          "0"
        )}` === selectedMonth
      );
    });
  }

  // Create CSV content
  const csvContent = [
    "Date,Description,Amount,Type", // Header row
    ...filteredEntries.map(
      (entry) =>
        `${entry.date},${entry.description},${entry.amount},${entry.type}`
    ),
  ].join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `budget_${
    selectedMonth === "all" ? "all" : selectedMonth
  }.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Handle month filter change for list and export
monthFilter.addEventListener("change", function () {
  renderEntries(); // Re-render list based on selected month
});

// Handle summary month filter change
summaryMonthFilter.addEventListener("change", function () {
  updateSummary(); // Update summary and chart based on selected month
});

// Function to update summary and chart based on selected month
function updateSummary() {
  const selectedMonth = summaryMonthFilter.value;
  let filteredEntries = entries;

  if (selectedMonth === "current") {
    // Filter for current month
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    });
  } else {
    // Filter for selected YYYY-MM
    filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(
          2,
          "0"
        )}` === selectedMonth
      );
    });
  }

  // Calculate totals for the filtered entries
  const totalIncome = filteredEntries
    .filter((entry) => entry.type === "income") // Filter income entries
    .reduce((sum, entry) => sum + entry.amount, 0); // Sum amounts
  const totalExpenses = filteredEntries
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
  const maxHeight = 100; // Matches .chart height in CSS
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
