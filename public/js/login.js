const form = document.getElementById('loginForm');
const alertBox = document.getElementById('alertBox');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    // find user by email
    const res = await fetch(`${API}/users?email=${encodeURIComponent(email)}`);
    const users = await res.json();

    if (users.length === 0) {
      showAlert(alertBox, 'No account found with that email.', 'error');
      return;
    }

    const user = users[0];

    // check password
    if (user.password !== password) {
      showAlert(alertBox, 'Incorrect password.', 'error');
      return;
    }

    // check if banned
    if (!user.isActive) {
      showAlert(alertBox, 'Your account has been banned. Contact support.', 'error');
      return;
    }

    // save session and redirect
    setCurrentUser(user);

    if (user.role === 'admin') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/';
    }
  } catch (err) {
    showAlert(alertBox, 'Something went wrong. Please try again.', 'error');
  }
});
