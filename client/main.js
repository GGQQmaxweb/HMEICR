// State
let currentUser = null;
let isEInvoiceLinked = false;

// Theme Logic
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️ Light';
    } else {
        body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '🌙 Dark';
    }
}

function toggleTheme() {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️ Light';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙 Dark';
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);

// DOM Elements
const views = {
    login: document.getElementById('login-view'),
    register: document.getElementById('register-view'),
    dashboard: document.getElementById('dashboard-view')
};
const navbar = document.getElementById('navbar');
const userEmailSpan = document.getElementById('user-email');

// Navigation
function showView(viewName) {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[viewName].classList.remove('hidden');

    if (viewName === 'dashboard') {
        navbar.classList.remove('hidden');
    } else {
        navbar.classList.add('hidden');
    }
}

// Auth Functions
async function login(email, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        const data = await res.json();

        if (res.ok) {
            currentUser = { email };
            userEmailSpan.textContent = email;
            showView('dashboard');
            loadReceipts();
            checkEInvoiceStatus(); // Check status on login
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Network error');
    }
}

async function register(email, password) {
    try {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            showView('login');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('Network error');
    }
}

async function logout() {
    await fetch('/api/logout');
    currentUser = null;
    showView('login');
}

// Receipt Functions
async function loadReceipts() {
    try {
        const res = await fetch('/api/receipt');
        if (res.ok) {
            const receipts = await res.json();
            renderReceipts(receipts);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderReceipts(receipts) {
    const list = document.getElementById('receipt-list');
    list.innerHTML = '';

    calculateMonthlyTotal(receipts);

    if (receipts.length === 0) {
        list.innerHTML = '<p>No receipts found.</p>';
        return;
    }

    receipts.forEach(r => {
        const div = document.createElement('div');
        div.className = 'receipt-item';

        // Handle both manually added receipts and synced invoices
        // Manual: { title, amount, currency, receipt_date, _id }
        // Invoice: { sellerName, totalAmount, invoiceDate, ... } (Assuming structure)

        const title = r.title || r.sellerName || 'Unknown';
        const amount = parseFloat(r.amount || r.totalAmount || 0);
        const currency = r.currency || 'TWD'; // Invoices are usually TWD

        // Parse Date safely
        let dateStr = 'Unknown Date';
        if (r.receipt_date) {
            dateStr = new Date(r.receipt_date).toLocaleDateString();
        } else if (r.invoiceDate) {
            // Invoice date formatting might be needed depending on API
            // e.g. "20230101" or "2023/01/01"
            dateStr = r.invoiceDate;
        }

        // Only add click handler if it has an ID (Manual receipt)
        // We could also allow editing invoices if backend supported it
        if (r._id) {
            div.onclick = () => openEditModal(r);
            div.style.cursor = 'pointer';
        }

        div.innerHTML = `
            <div>
                <strong>${title}</strong>
                <br>
                <small>${dateStr}</small>
            </div>
            <div style="text-align: right;">
                <span class="amount">${amount.toFixed(2)}</span>
                <span class="badge">${currency}</span>
            </div>
        `;
        list.appendChild(div);
    });
}

function calculateMonthlyTotal(receipts) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const total = receipts.reduce((acc, r) => {
        let rDate;
        if (r.receipt_date) {
            rDate = new Date(r.receipt_date);
        } else if (r.invoiceDate) {
            // Assuming invoiceDate is parseable or YYYYMMDD
            // For simplicity, we try new Date. If fails, we skip.
            rDate = new Date(r.invoiceDate);
        }

        if (rDate && !isNaN(rDate.getTime())) {
            if (rDate.getMonth() === currentMonth && rDate.getFullYear() === currentYear) {
                return acc + (parseFloat(r.amount || r.totalAmount) || 0);
            }
        }
        return acc;
    }, 0);

    const totalEl = document.getElementById('total-month-amount');
    if (totalEl) {
        totalEl.textContent = total.toFixed(2);
    }
}




async function addReceipt(formData) {
    try {
        const payload = new URLSearchParams();
        for (const pair of formData.entries()) {
            payload.append(pair[0], pair[1]);
        }

        console.log("DEBUG: Sending receipt payload", payload.toString());

        const res = await fetch('/api/receipt/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        });

        if (res.ok) {
            document.getElementById('add-receipt-modal').classList.add('hidden');
            document.getElementById('add-receipt-form').reset();
            loadReceipts();
        } else {
            const data = await res.json();
            alert('Error: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to add receipt');
    }
}

// E-Invoice Logic
const einvoiceModal = document.getElementById('einvoice-login-modal');
const linkEinvoiceBtn = document.getElementById('link-einvoice-btn');
const einvoiceUsernameInput = document.getElementById('einvoice-login-form').querySelector('[name="einvoice_username"]');
const einvoicePasswordInput = document.getElementById('einvoice-login-form').querySelector('[name="einvoice_password"]');
const unlinkEinvoiceBtn = document.getElementById('unlink-einvoice-btn');
const submitEinvoiceBtn = document.getElementById('submit-einvoice-btn');


async function checkEInvoiceStatus() {
    try {
        const res = await fetch('/api/einvoice/status');
        if (res.ok) {
            const data = await res.json();
            isEInvoiceLinked = data.linked;
            updateEInvoiceUI(data.username);
        }
    } catch (err) {
        console.error('Failed to check e-invoice status', err);
    }
}

function updateEInvoiceUI(username = '') {
    if (isEInvoiceLinked) {
        linkEinvoiceBtn.textContent = 'Manage E-Invoice';
        submitEinvoiceBtn.textContent = 'Update Account';
        unlinkEinvoiceBtn.classList.remove('hidden');
        if (username) {
            einvoiceUsernameInput.value = username;
        }
    } else {
        linkEinvoiceBtn.textContent = 'Link E-Invoice';
        submitEinvoiceBtn.textContent = 'Link Account';
        unlinkEinvoiceBtn.classList.add('hidden');
        einvoiceUsernameInput.value = '';
        einvoicePasswordInput.value = '';
    }
}

async function linkAccount(formData) {
    try {
        const payload = new URLSearchParams();
        for (const pair of formData.entries()) {
            payload.append(pair[0], pair[1]);
        }

        // Determine endpoint based on state
        const endpoint = isEInvoiceLinked ? '/api/einvoice_login/edit' : '/api/einvoice_login/create';

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        });
        const data = await res.json();

        if (res.ok) {
            alert(isEInvoiceLinked ? 'Updated Successfully!' : 'Linked Successfully!');
            einvoiceModal.classList.add('hidden');
            checkEInvoiceStatus();
        } else {
            alert('Operation failed: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error processing account');
    }
}

async function unlinkAccount() {
    if (!confirm('Are you sure you want to unlink your E-Invoice account?')) return;

    try {
        const res = await fetch('/api/einvoice_login/delete', { method: 'POST' });
        const data = await res.json();

        if (res.ok) {
            alert('Unlinked Successfully!');
            isEInvoiceLinked = false;
            einvoiceModal.classList.add('hidden');
            updateEInvoiceUI();
        } else {
            alert('Unlink failed: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Error unlinking account');
    }
}

async function syncInvoices() {
    try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '/');
        const from = formatDate(firstDay);
        const to = formatDate(lastDay);

        const res = await fetch(`/api/einvoice/carrier/invoices?from=${from}&to=${to}&size=100`);
        const data = await res.json();

        if (data.content) {
            const manualRes = await fetch('/api/receipt');
            const manualData = await manualRes.json();

            const allItems = [...manualData, ...data.content];
            allItems.sort((a, b) => {
                const da = new Date(a.receipt_date || a.invoiceDate);
                const db = new Date(b.receipt_date || b.invoiceDate);
                return db - da;
            });

            renderReceipts(allItems);
            alert(`Synced! Found ${data.content.length} invoices.`);
        } else {
            alert('No invoices found or error occurred.');
        }

    } catch (err) {
        console.error(err);
        alert('Error syncing invoices. Did you link your account?');
    }
}

// Edit Receipt Logic
const editModal = document.getElementById('edit-receipt-modal');
const editForm = document.getElementById('edit-receipt-form');

function openEditModal(receipt) {
    editForm.querySelector('[name="receipt_id"]').value = receipt._id;
    editForm.querySelector('[name="title"]').value = receipt.title;
    editForm.querySelector('[name="amount"]').value = receipt.amount;
    editForm.querySelector('[name="currency"]').value = receipt.currency;

    // Format date specifically for input type="date" (YYYY-MM-DD)
    const dateObj = new Date(receipt.receipt_date);
    const dateStr = dateObj.toISOString().split('T')[0];
    editForm.querySelector('[name="receipt_date"]').value = dateStr;

    editModal.classList.remove('hidden');
}

async function updateReceipt(formData) {
    try {
        const id = formData.get('receipt_id');
        const payload = new URLSearchParams();
        for (const pair of formData.entries()) {
            payload.append(pair[0], pair[1]);
        }

        // We use the existing server endpoint which is a POST to /receipt/<id>/edit
        // Note: The server currently redirects to list_receipt. Since we are checking res.ok, 
        // fetch follows redirects by default, so we should get the list back or just OK.
        // Actually, server does `redirect(url_for("list_receipt"))`. Fetch will follow it and return the JSON list!
        // So we can just setReceipts directly if we wanted, or just call loadReceipts.

        const res = await fetch(`/api/receipt/${id}/edit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload
        });

        if (res.ok) {
            editModal.classList.add('hidden');
            loadReceipts();
        } else {
            alert('Update failed');
        }
    } catch (err) {
        console.error(err);
        alert('Error updating receipt');
    }
}


// Event Listeners
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    login(fd.get('email'), fd.get('password'));
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    register(fd.get('email'), fd.get('password'));
});

document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    showView('register');
});

document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    showView('login');
});

document.getElementById('logout-btn').addEventListener('click', logout);

// Add Modal Logic
const modal = document.getElementById('add-receipt-modal');
document.getElementById('show-add-receipt-modal').addEventListener('click', () => {
    modal.classList.remove('hidden');
});
document.getElementById('close-modal-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
});

document.getElementById('add-receipt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addReceipt(fd);
});

// Edit Modal Logic
document.getElementById('close-edit-modal-btn').addEventListener('click', () => {
    editModal.classList.add('hidden');
});

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    updateReceipt(fd);
});

async function deleteReceipt() {
    if (!confirm('Are you sure you want to delete this receipt?')) return;

    const id = editForm.querySelector('[name="receipt_id"]').value;
    try {
        const res = await fetch(`/api/receipt/${id}/delete`, {
            method: 'POST'
        });

        if (res.ok) {
            editModal.classList.add('hidden');
            loadReceipts();
        } else {
            alert('Delete failed');
        }
    } catch (err) {
        console.error(err);
        alert('Error deleting receipt');
    }
}

document.getElementById('delete-receipt-btn').addEventListener('click', deleteReceipt);

// E-Invoice Listeners
document.getElementById('link-einvoice-btn').addEventListener('click', () => {
    einvoiceModal.classList.remove('hidden');
});
document.getElementById('close-einvoice-modal-btn').addEventListener('click', () => {
    einvoiceModal.classList.add('hidden');
});
document.getElementById('sync-einvoice-btn').addEventListener('click', syncInvoices);
document.getElementById('einvoice-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    linkAccount(fd);
});
document.getElementById('unlink-einvoice-btn').addEventListener('click', unlinkAccount);


// Init
loadTheme();
showView('login');
