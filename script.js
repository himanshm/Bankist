'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [2000, 4500, -4000, 30000, -6500, -1300, 700, 13000],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [50000, 34000, -1500, -7900, -32100, -10000, 85000, -300],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [2000, -2000, 3400, -3000, -200, 500, 4000, -4600],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [4300, 10000, 7000, 500, 900],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
  ['INR', 'Indian rupee'],
]);

/////////////////////////////////////////////////
const getRupeeSymbolHtml = function (fontSize) {
  return `<span style="font-size: ${fontSize}rem;">&#8377;</span>`;
};
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach((mov, i) => {
    const movementType = mov > 0 ? 'deposit' : 'withdrawal';
    const movementSign = mov > 0 ? '&#8601;' : '&#8599;';
    const movementSignColor = mov > 0 ? 'green' : 'red';

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${movementType}">
          ${i + 1} ${movementType}
          </div>
          <div class="movements__value">
             ${getRupeeSymbolHtml(1)} ${Math.abs(mov)} 
             <span style='color:${movementSignColor};font-size:2.5rem;'>${movementSign}</span>
          </div>
        </div>
        `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  labelBalance.innerHTML = '';
  account.balance = account.movements.reduce(
    (accumulator, movement) => accumulator + movement,
    0
  );

  labelBalance.innerHTML = `${getRupeeSymbolHtml(2.8)} ${account.balance}`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(movement => movement > 0)
    .reduce((accumulator, movement) => accumulator + movement, 0);

  const expenses = account.movements
    .filter(movement => movement < 0)
    .reduce((accumulator, movement) => accumulator + movement, 0);

  // In our fictional bank we will receive 1.2% of interest in each deposit only if an interst is at least 100 rs
  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => deposit * account.interestRate)
    .filter(int => int >= 10)
    .reduce((acc, int) => acc + int, 0);

  labelSumIn.innerHTML = `${getRupeeSymbolHtml(1)} ${incomes}`;
  labelSumOut.innerHTML = `${getRupeeSymbolHtml(1)} ${Math.abs(expenses)}`;
  labelSumInterest.innerHTML = `${getRupeeSymbolHtml(1)} ${interest}`;
};

const createUsernames = function (accounts) {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
    // + Math.floor(1000 + Math.random() * 9000);
  });
};

createUsernames(accounts);

const updateUI = function (account) {
  displayMovements(account.movements);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

// Event Handlers
let currentAccount;
btnLogin.addEventListener('click', event => {
  // prevent form submission
  event.preventDefault();
  currentAccount = accounts.find(
    account => account.username === inputLoginUsername.value
  );

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and Welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear Input Fields
    inputLoginUsername.value = inputLoginPin.value = ''; // Assignment operator works from right to left
    // Make the pin field loose its focus
    inputLoginPin.blur();

    // Display balance, movements, and summary - update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', eve => {
  eve.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    account => account.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    updateUI(currentAccount);
  }
});

// Our bank only grants a loan if there is at least one deposit with at least 10% of the requested loan amount
btnLoan.addEventListener('click', function (eve) {
  eve.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(movement => movement >= loanAmount * 0.1)
  ) {
    // Add Movement
    currentAccount.movements.push(loanAmount);

    // Update the UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (eve) {
  eve.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const accountIndex = accounts.findIndex(
      account => account.username === currentAccount.username
    );

    // Delete account
    accounts.splice(accountIndex, 1); // Mutates the array so no need to save its result

    // Hide UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Login to get started`;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
let sorted = false;

btnSort.addEventListener('click', function (event) {
  event.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
