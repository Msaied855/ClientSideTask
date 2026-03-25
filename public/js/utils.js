const API = 'http://localhost:5500';

// get current logged-in user from sessionStorage
function getCurrentUser() {
  const data = sessionStorage.getItem('user');
  if (!data) return null;
  return JSON.parse(data);
}

// save user to session
function setCurrentUser(user) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

// logout
function logout() {
  sessionStorage.removeItem('user');
  window.location.href = '/';
}

// build the navbar dynamically based on login state
function renderNavbar() {
  const user = getCurrentUser();
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let links = `<a href="/">Home</a>`;

  if (user && user.role === 'admin') {
    links += `<a href="/admin.html">Admin Panel</a>`;
    links += `<a href="#" onclick="logout()">Logout</a>`;
  } else if (user) {
    links += `<a href="/create-campaign.html">Start Campaign</a>`;
    links += `<a href="/dashboard.html">My Dashboard</a>`;
    links += `<a href="#" onclick="logout()">Logout</a>`;
  } else {
    links += `<a href="/login.html">Log In</a>`;
    links += `<a href="/register.html">Sign Up</a>`;
  }

  navbar.innerHTML = links;
}

// helper to show alerts
function showAlert(container, message, type) {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = message;
  container.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

// format currency
function formatMoney(amount) {
  return '$' + Number(amount).toLocaleString();
}

// calculate % funded
function calcPercent(raised, goal) {
  if (goal <= 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

// category icons (simple text-based)
const categoryIcons = {
  technology: '💻',
  music: '🎵',
  community: '🌱',
  film: '🎬',
  art: '🎨',
  education: '📚',
  health: '❤️',
  gaming: '🎮',
  other: '📦'
};

function getCategoryIcon(cat) {
  return categoryIcons[cat] || '📦';
}

// run navbar on every page load
document.addEventListener('DOMContentLoaded', renderNavbar);
