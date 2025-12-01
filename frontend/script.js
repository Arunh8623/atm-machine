const API_URL = 'https://atm-machine-2-nsc3.onrender.com';
const CORRECT_PIN = '8623';
let currentPin = '';
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;

// PIN Screen Functions
function addDigit(digit) {
    if (currentPin.length < 4) {
        currentPin += digit;
        document.getElementById('pin-input').value = currentPin;
        updatePinDots();
        
        // Play click sound effect (visual feedback)
        const buttons = document.querySelectorAll('.key-btn');
        buttons.forEach(btn => {
            if (btn.textContent === digit) {
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 100);
            }
        });
    }
}

function clearPin() {
    currentPin = '';
    document.getElementById('pin-input').value = '';
    updatePinDots();
    document.getElementById('pin-error').textContent = '';
    
    // Reset all dots
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById('dot' + i);
        dot.className = 'w-5 h-5 rounded-full border-4 border-gray-300 transition-all duration-300';
    }
}

function updatePinDots() {
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById('dot' + i);
        if (i <= currentPin.length) {
            dot.className = 'w-5 h-5 rounded-full border-4 border-blue-500 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 transform scale-125';
        } else {
            dot.className = 'w-5 h-5 rounded-full border-4 border-gray-300 transition-all duration-300';
        }
    }
}

function verifyPin() {
    const pinError = document.getElementById('pin-error');
    
    if (currentPin.length !== 4) {
        pinError.innerHTML = '<p class="text-red-600 animate-pulse">❌ Please enter 4 digits</p>';
        shakeElement(document.getElementById('pin-input'));
        return;
    }
    
    if (currentPin === CORRECT_PIN) {
        // Success Animation
        pinError.innerHTML = '<p class="text-green-600 text-xl animate-bounce">✅ PIN Verified! Access Granted</p>';
        
        // Success visual feedback
        for (let i = 1; i <= 4; i++) {
            const dot = document.getElementById('dot' + i);
            dot.className = 'w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300 transform scale-150';
        }
        
        // Create success confetti effect
        createConfetti();
        
        // Transition to main screen
        setTimeout(() => {
            document.getElementById('pin-screen').classList.add('hidden');
            document.getElementById('main-screen').classList.remove('hidden');
            loginAttempts = 0;
        }, 1500);
    } else {
        loginAttempts++;
        const remaining = MAX_ATTEMPTS - loginAttempts;
        
        if (remaining > 0) {
            pinError.innerHTML = `<p class="text-red-600 text-xl animate-pulse">❌ Incorrect PIN! ${remaining} attempt${remaining > 1 ? 's' : ''} remaining</p>`;
            
            // Shake animation
            shakeElement(document.querySelector('.glass-effect'));
            
            // Turn dots red
            for (let i = 1; i <= 4; i++) {
                const dot = document.getElementById('dot' + i);
                dot.className = 'w-5 h-5 rounded-full border-4 border-red-500 bg-red-500 transition-all duration-300';
            }
            
            setTimeout(() => {
                clearPin();
            }, 1000);
        } else {
            pinError.innerHTML = '<p class="text-red-700 text-xl font-bold">🔒 Card Blocked! Too many attempts. Refresh to try again.</p>';
            
            // Disable all keypad buttons
            document.querySelectorAll('.key-btn').forEach(btn => {
                btn.disabled = true;
                btn.className += ' opacity-50 cursor-not-allowed';
            });
        }
    }
}

function shakeElement(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function createConfetti() {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    const container = document.getElementById('money-rain-container');
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-50px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.animation = 'money-rain 3s linear';
            confetti.style.opacity = '0.8';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 50);
    }
}

function createMoneyRain() {
    const emojis = ['💵', '💴', '💶', '💷', '💰', '💸'];
    const container = document.getElementById('money-rain-container');
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const money = document.createElement('div');
            money.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            money.style.position = 'absolute';
            money.style.left = Math.random() * 100 + '%';
            money.style.top = '-50px';
            money.style.fontSize = '3rem';
            money.style.animation = 'money-rain 3s linear';
            money.style.pointerEvents = 'none';
            
            container.appendChild(money);
            
            setTimeout(() => {
                money.remove();
            }, 3000);
        }, i * 100);
    }
}

function logout() {
    if (confirm('🔒 Are you sure you want to logout?')) {
        // Add fade out animation
        document.getElementById('main-screen').style.opacity = '0';
        document.getElementById('main-screen').style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            document.getElementById('main-screen').classList.add('hidden');
            document.getElementById('main-screen').style.opacity = '1';
            document.getElementById('main-screen').style.transform = 'scale(1)';
            
            document.getElementById('pin-screen').classList.remove('hidden');
            clearPin();
            reset();
            
            // Re-enable keypad
            document.querySelectorAll('.key-btn').forEach(btn => {
                btn.disabled = false;
                btn.className = btn.className.replace(' opacity-50 cursor-not-allowed', '');
            });
            loginAttempts = 0;
        }, 300);
    }
}

// Keyboard support for PIN
document.addEventListener('DOMContentLoaded', function() {
    const pinInput = document.getElementById('pin-input');
    
    document.addEventListener('keydown', function(e) {
        if (!document.getElementById('pin-screen').classList.contains('hidden')) {
            if (e.key >= '0' && e.key <= '9') {
                addDigit(e.key);
            } else if (e.key === 'Enter') {
                verifyPin();
            } else if (e.key === 'Backspace') {
                currentPin = currentPin.slice(0, -1);
                pinInput.value = currentPin;
                updatePinDots();
            } else if (e.key === 'Escape') {
                clearPin();
            }
        }
    });
});

// ATM Withdrawal Functions
function setAmount(value) {
    const amountInput = document.getElementById('amount');
    amountInput.value = value;
    document.getElementById('error').textContent = '';
    
    // Add pulse animation
    amountInput.style.animation = 'pulse-glow 1s';
    setTimeout(() => {
        amountInput.style.animation = '';
    }, 1000);
}

async function withdraw() {
    const amount = parseInt(document.getElementById('amount').value);
    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');
    
    errorDiv.textContent = '';
    resultDiv.classList.add('hidden');
    
    // Validation
    if (!amount || isNaN(amount)) {
        errorDiv.innerHTML = '<p class="text-red-600 font-bold animate-pulse">❌ Please enter a valid amount</p>';
        shakeElement(document.getElementById('amount'));
        return;
    }
    
    if (amount <= 0) {
        errorDiv.innerHTML = '<p class="text-red-600 font-bold animate-pulse">❌ Amount must be greater than 0</p>';
        return;
    }
    
    if (amount % 100 !== 0) {
        errorDiv.innerHTML = '<p class="text-red-600 font-bold animate-pulse">❌ Amount must be a multiple of ₹100</p>';
        return;
    }
    
    if (amount > 50000) {
        errorDiv.innerHTML = '<p class="text-red-600 font-bold animate-pulse">❌ Maximum withdrawal limit is ₹50,000</p>';
        return;
    }
    
    try {
        // Show loading with animation
        errorDiv.innerHTML = '<p class="text-blue-600 font-bold text-xl animate-pulse">⏳ Processing withdrawal... Please wait</p>';
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            errorDiv.textContent = '';
            displayResult(data);
            createMoneyRain(); // Money rain animation!
        } else {
            throw new Error(data.error || 'Failed to dispense cash');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
        if (error.message.includes('Failed to fetch')) {
            errorDiv.innerHTML = '<p class="text-red-600 font-bold text-xl">❌ Cannot connect to server! Make sure C++ backend is running on port 8081.</p>';
        } else {
            errorDiv.innerHTML = `<p class="text-red-600 font-bold text-xl">❌ ${error.message}</p>`;
        }
    }
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    
    // Set result info with animations
    document.getElementById('result-amount').textContent = '₹' + data.amount.toLocaleString('en-IN');
    document.getElementById('result-notes').textContent = data.totalNotes;
    
    const methodBadge = document.getElementById('result-method');
    methodBadge.textContent = data.method;
    
    if (data.method === 'Greedy') {
        methodBadge.className = 'text-lg font-bold text-green-600 px-4 py-2 bg-green-100 rounded-full inline-block';
    } else {
        methodBadge.className = 'text-lg font-bold text-orange-600 px-4 py-2 bg-orange-100 rounded-full inline-block';
    }
    
    // Hide all denomination cards first
    ['2000', '500', '100'].forEach(denom => {
        document.getElementById('denom-' + denom).classList.add('hidden');
    });
    
    // Show denominations with staggered animation
    const denominations = data.denominations;
    let delay = 0;
    
    for (let denom in denominations) {
        const count = denominations[denom];
        if (count > 0) {
            setTimeout(() => {
                const denomCard = document.getElementById('denom-' + denom);
                denomCard.classList.remove('hidden');
                denomCard.querySelector('.count').textContent = count;
            }, delay);
            delay += 200;
        }
    }
    
    // Show result with slide animation
    resultDiv.classList.remove('hidden');
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function reset() {
    document.getElementById('amount').value = '';
    document.getElementById('error').textContent = '';
    document.getElementById('result').classList.add('hidden');
    
    // Focus back to input
    setTimeout(() => {
        document.getElementById('amount').focus();
    }, 100);
}

// Allow Enter key for withdrawal
document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
        amountInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                withdraw();
            }
        });
    }
});