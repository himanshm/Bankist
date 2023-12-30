'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Himanshu Mishra',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'INR',
  locale: 'en-IN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-12-27T18:49:59.371Z',
    '2023-12-29T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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
const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, '0');
  // const month = `${date.getMonth() + 1}`.padStart(2, '0');
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// const getRupeeSymbolHtml = function (fontSize) {
//   return `<span style="font-size: ${fontSize}rem;">&#8377;</span>`;
// };

const displayAmount = (amount, locale, currency) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  movs.forEach((mov, i) => {
    const movementType = mov > 0 ? 'deposit' : 'withdrawal';
    const movementSign = mov > 0 ? '&#8601;' : '&#8599;';
    const movementSignColor = mov > 0 ? 'green' : 'red';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMovement = displayAmount(Math.abs(mov), acc.locale, acc.currency);

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${movementType}">${i + 1} ${movementType}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMovement}
          <span style="color:${movementSignColor};font-size:2.5rem;">${movementSign}</span>
          </div>

        </div>
        `;
    //

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  labelBalance.innerHTML = '';
  account.balance = account.movements.reduce((accumulator, movement) => accumulator + movement, 0);

  const formattedBalance = displayAmount(account.balance, account.locale, account.currency);
  labelBalance.innerHTML = `${formattedBalance}`;
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

  labelSumIn.innerHTML = `${displayAmount(Math.abs(incomes), account.locale, account.currency)}`;
  labelSumOut.innerHTML = `${displayAmount(Math.abs(expenses), account.locale, account.currency)}`;
  labelSumInterest.innerHTML = `${displayAmount(Math.abs(interest), account.locale, account.currency)}`;
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
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

// Logout Timer

const startLogoutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, '0');
    const sec = String(time % 60).padStart(2, '0');
    // In each callback call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 secs, stop timer and log the user out

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }
    // Decrease 1 second
    time--;
  };
  // Set the time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick(); // Call the tick function immediately
  const timer = setInterval(tick, 1000); // Call it every second

  return timer;
};

// Event Handlers
let currentAccount, timer;

// Experimenting with the API

btnLogin.addEventListener('click', event => {
  // prevent form submission
  event.preventDefault();
  currentAccount = accounts.find(account => account.username === inputLoginUsername.value);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and Welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    const currentDate = new Date();

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long', // 2-digit, long, numeric
      year: 'numeric',
      weekday: 'long',
    };

    // Get the locale from the browser
    // const locale = navigator.language;
    // console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(currentDate);

    // const day = `${currentDate.getDate()}`.padStart(2, '0');
    // const month = `${currentDate.getMonth() + 1}`.padStart(2, '0');
    // const year = currentDate.getFullYear();
    // const hours = currentDate.getHours();
    // const minutes = `${currentDate.getMinutes()}`.padStart(2, '0');

    // day/month/year -- DD/MM/YYYY or DD-MM-YYYY use hypen of slash(oblique) to format dates
    // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${minutes}`;

    // Clear Input Fields
    inputLoginUsername.value = inputLoginPin.value = ''; // Assignment operator works from right to left
    // Make the pin field loose its focus
    inputLoginPin.blur();
    // Timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    // Display balance, movements, and summary - update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', eve => {
  eve.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(account => account.username === inputTransferTo.value);

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // Add transfer dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    // Reset the timer after trasfer activity
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

// Our bank only grants a loan if there is at least one deposit with at least 10% of the requested loan amount
btnLoan.addEventListener('click', function (eve) {
  eve.preventDefault();

  const loanAmount = Math.floor(inputLoanAmount.value);
  if (loanAmount > 0 && currentAccount.movements.some(movement => movement >= loanAmount * 0.1)) {
    setTimeout(() => {
      // Add Movement
      currentAccount.movements.push(loanAmount);

      // Add loan dates
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update the UI
      updateUI(currentAccount);

      // Reset the timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (eve) {
  eve.preventDefault();

  if (inputCloseUsername.value === currentAccount.username && +inputClosePin.value === currentAccount.pin) {
    const accountIndex = accounts.findIndex(account => account.username === currentAccount.username);

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

labelBalance.addEventListener('click', () => {
  [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
  });
});
