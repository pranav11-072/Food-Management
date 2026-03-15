// --- Global State ---
let cart = [];
const apiBase = '/api';

// --- Page Navigation ---
function showSection(id) {
    // Hide all sections
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    // Show the requested section
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
}

// --- Authentication Logic ---
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert("Please fill in all fields");

    try {
        const res = await fetch(`${apiBase}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('food_token', data.token);
            localStorage.setItem('user_role', data.role);
            
            // Redirect based on role or just show main section
            showSection('main-section');
            loadMenu();
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        console.error("Login Error:", err);
    }
}

async function handleRegister() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${apiBase}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'customer' })
        });

        if (res.ok) {
            alert("Registration successful! Please login.");
        } else {
            const data = await res.json();
            alert(data.error || "Registration failed");
        }
    } catch (err) {
        console.error("Reg Error:", err);
    }
}

function logout() {
    localStorage.removeItem('food_token');
    localStorage.removeItem('user_role');
    cart = [];
    updateCartUI();
    showSection('login-section');
}

// --- Menu Logic ---
async function loadMenu() {
    try {
        const res = await fetch(`${apiBase}/menu`);
        const items = await res.json();
        const grid = document.getElementById('items-grid');
        
        grid.innerHTML = items.map(i => `
            <div class="food-card">
                <img src="${i.image}" alt="${i.name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;">
                <h3>${i.name}</h3>
                <p class="price">₹${i.price}</p>
                <button onclick="addToCart('${i.name}', ${i.price})">Add to Order</button>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load menu:", err);
    }
}

// --- Cart Logic ---
function addToCart(name, price) {
    cart.push({ name, price });
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-items');
    const totalDisp = document.getElementById('total');
    
    // Render list items
    list.innerHTML = cart.map((item, index) => `
        <li class="cart-item">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
            <button onclick="removeFromCart(${index})" style="padding: 2px 5px; background: #c0392b; font-size: 10px;">X</button>
        </li>
    `).join('');
    
    // Calculate Total
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalDisp.innerText = `Grand Total: ₹${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

// --- Order Logic ---
async function placeOrder() {
    const token = localStorage.getItem('food_token');
    
    if (!token) {
        alert("Please login to place an order");
        return showSection('login-section');
    }

    if (cart.length === 0) {
        return alert("Your cart is empty!");
    }

    const total = cart.reduce((s, i) => s + i.price, 0);

    try {
        const res = await fetch(`${apiBase}/orders`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': token 
            },
            body: JSON.stringify({ items: cart, total })
        });

        const data = await res.json();
        
        if (res.ok) {
            alert("✅ " + data.message);
            cart = [];
            updateCartUI();
        } else {
            alert("Order failed: " + data.error);
        }
    } catch (err) {
        console.error("Order error:", err);
    }
}

// --- Initialization ---
window.onload = () => {
    const token = localStorage.getItem('food_token');
    if (token) {
        showSection('main-section');
        loadMenu();
    } else {
        showSection('login-section');
    }
};
