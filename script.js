const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const category = document.getElementById('category');

const localStorageTransactions = JSON.parse(localStorage.getItem('transactions'));
let transactions = localStorage.getItem('transactions') !== null ? localStorageTransactions : [];

let expenseChartInstance = null; 

// =========================================
// CORE LOGIC (Transactions & Math)
// =========================================
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }

  let parsedAmount = +amount.value;
  if (category.value !== 'Income' && parsedAmount > 0) {
      parsedAmount = -Math.abs(parsedAmount);
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: parsedAmount,
    category: category.value,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();
  updateChart();

  text.value = '';
  amount.value = '';
}

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function getCategoryIcon(cat) {
  switch(cat) {
    case 'Income': return '<i class="fa-solid fa-money-bill-wave" style="color:#2ecc71"></i>';
    case 'Food': return '<i class="fa-solid fa-utensils" style="color:#ff4757"></i>';
    case 'Travel': return '<i class="fa-solid fa-car" style="color:#ffa502"></i>';
    case 'Shopping': return '<i class="fa-solid fa-bag-shopping" style="color:#7bed9f"></i>';
    case 'Entertainment': return '<i class="fa-solid fa-film" style="color:#3742fa"></i>';
    default: return '<i class="fa-solid fa-box" style="color:#a4b0be"></i>';
  }
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');
  const amountClass = transaction.amount < 0 ? 'minus' : 'plus';

  item.innerHTML = `
    <div class="transaction-info">
      <div class="cat-icon" style="background: #f4f6fa;">
        ${getCategoryIcon(transaction.category)}
      </div>
      <div class="transaction-details">
        <span>${transaction.text}</span>
        <small>${transaction.date} • ${transaction.category}</small>
      </div>
    </div>
    <div>
      <span class="transaction-amount money ${amountClass}">${sign}₹${Math.abs(transaction.amount)}</span>
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})"><i class="fa-solid fa-trash"></i></button>
    </div>
  `;
  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `+₹${income}`;
  money_minus.innerText = `-₹${expense}`;
}

function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  init();
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// =========================================
// CHART.JS LOGIC
// =========================================
function updateChart() {
  const expenses = transactions.filter(t => t.amount < 0);
  
  let categoryTotals = {
    'Food': 0, 'Travel': 0, 'Shopping': 0, 'Entertainment': 0, 'Others': 0
  };

  expenses.forEach(exp => {
    if(categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += Math.abs(exp.amount);
    } else {
      categoryTotals['Others'] += Math.abs(exp.amount);
    }
  });

  const dataValues = Object.values(categoryTotals);
  const backgroundColors = ['#ff4757', '#ffa502', '#7bed9f', '#3742fa', '#a4b0be'];

  if (expenseChartInstance) {
    expenseChartInstance.destroy();
  }

  const ctx = document.getElementById('expenseChart').getContext('2d');
  expenseChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function init() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
  updateChart();
}

init();
form.addEventListener('submit', addTransaction);

// =========================================
// USER NAME POPUP LOGIC
// =========================================
const welcomeModal = document.getElementById('welcomeModal');
const userNameInput = document.getElementById('userNameInput');
const saveNameBtn = document.getElementById('saveNameBtn');
const welcomeText = document.querySelector('.welcome-text');
const promoText = document.querySelector('.promo-card p');

function checkUserName() {
  const savedName = localStorage.getItem('expenseUserName');
  if (!savedName) {
    welcomeModal.classList.add('show');
  } else {
    updateNameInUI(savedName);
  }
}

function updateNameInUI(name) {
  welcomeText.innerHTML = `Welcome, <span style="color:#4361ee">${name}</span> 👋`;
  promoText.innerText = `${name}, manage your money smartly`;
}

if(saveNameBtn) {
  saveNameBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (name) {
      localStorage.setItem('expenseUserName', name);
      updateNameInUI(name);
      welcomeModal.classList.remove('show');
    } else {
      alert("Please enter your name to continue!");
    }
  });
}

checkUserName();

// =========================================
// NEW FEATURES (Hamburger, Settings, Backup, Restore)
// =========================================

// Hamburger Menu Logic
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');

if(menuBtn) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
}

// Dummy Buttons Alert
const navItems = document.querySelectorAll('.nav-links li');
const settingsBtn = navItems[4]; 

navItems.forEach((btn, index) => {
  if(index !== 0 && index !== 4) { 
    btn.addEventListener('click', () => alert("🛠️ This feature is under development for Phase 2!"));
  }
});

const datePicker = document.querySelector('.date-picker');
if(datePicker) datePicker.addEventListener('click', () => alert("🛠️ Calendar integration coming soon!"));

const notificationBtn = document.querySelector('.notification');
if(notificationBtn) notificationBtn.addEventListener('click', () => alert("🛠️ No new notifications!"));

// Settings Modal Logic
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');

if(settingsBtn && settingsModal && closeSettings) {
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
    if(window.innerWidth <= 768) sidebar.classList.remove('active'); 
  });

  closeSettings.addEventListener('click', () => {
    settingsModal.classList.remove('show');
  });
}

// Dark Mode Logic
const darkModeToggle = document.getElementById('darkModeToggle');
const isDarkMode = localStorage.getItem('expenseDarkMode') === 'true';

if (isDarkMode) {
  document.body.classList.add('dark-mode');
  if(darkModeToggle) darkModeToggle.checked = true;
}

if(darkModeToggle) {
  darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('expenseDarkMode', darkModeToggle.checked);
  });
}

// Data Backup (Download JSON)
const exportBtn = document.getElementById('exportBtn');
if(exportBtn) {
  exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(transactions);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'My_Expense_Backup.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  });
}

// Restore Data (Upload JSON)
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

if(importBtn && importFile) {
  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        if (Array.isArray(importedData)) {
          transactions = importedData;
          updateLocalStorage();
          init(); 
          updateChart(); 
          alert('Data restored successfully! 🎉');
          settingsModal.classList.remove('show');
        } else {
          alert('Invalid file format!');
        }
      } catch (err) {
        alert('Error reading the file! Make sure it is a valid JSON.');
      }
    };
    reader.readAsText(file);
  });
}

// =========================================
// BUG FIX: AUTO-CLOSE MOBILE SIDEBAR
// =========================================

document.addEventListener('click', function(event) {
  const sidebarContainer = document.querySelector('.sidebar');
  const hamburgerBtn = document.getElementById('menuBtn');
  
  // Agar mobile screen hai aur sidebar khula hua hai
  if (window.innerWidth <= 768 && sidebarContainer.classList.contains('active')) {
    // Agar user ne sidebar ke bahar click kiya hai, toh usko band kar do
    if (!sidebarContainer.contains(event.target) && !hamburgerBtn.contains(event.target)) {
      sidebarContainer.classList.remove('active');
    }
  }
});

// Agar user kisi menu option (jaise Settings) pe click kare, toh bhi menu band ho jaye
const sidebarLinks = document.querySelectorAll('.nav-links li');
sidebarLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      document.querySelector('.sidebar').classList.remove('active');
    }
  });
});