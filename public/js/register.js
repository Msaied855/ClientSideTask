const form = document.getElementById('registerForm');
const alertBox = document.getElementById('alertBox');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    // check if email already exists
    const check = await fetch(`${API}/users?email=${encodeURIComponent(email)}`);
    const existing = await check.json();

    if (existing.length > 0) {
      showAlert(alertBox, 'An account with this email already exists.', 'error');
      return;
    }

    // create new user
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: 'user',
        isActive: true
      })
    });

    const newUser = await res.json();
    setCurrentUser(newUser);
    window.location.href = '/';
  } catch (err) {
    showAlert(alertBox, 'Registration failed. Try again.', 'error');
  }
});
