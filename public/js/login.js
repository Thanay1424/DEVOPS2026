/* ===================================================
   LOGIN PAGE SCRIPT
   =================================================== */

// Redirect if already logged in
(function () {
  if (localStorage.getItem('cid_token')) {
    window.location.href = '/dashboard';
  }
})();

function togglePassword() {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}

document.getElementById('login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('submit-btn');
  const alertBox = document.getElementById('alert-box');

  alertBox.classList.add('hidden');

  if (!email || !password) {
    alertBox.className = 'alert error';
    alertBox.textContent = 'Please fill in all fields.';
    alertBox.classList.remove('hidden');
    return;
  }

  // Show spinner
  btn.disabled = true;
  btn.querySelector('.btn-text').classList.add('hidden');
  btn.querySelector('.btn-spinner').classList.remove('hidden');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      localStorage.setItem('cid_token', data.token);
      localStorage.setItem('cid_user', JSON.stringify(data.user));

      alertBox.className = 'alert success';
      alertBox.textContent = `Welcome back, ${data.user.username}! Redirecting…`;
      alertBox.classList.remove('hidden');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } else {
      alertBox.className = 'alert error';
      alertBox.textContent = data.message || 'Login failed. Please check your credentials.';
      alertBox.classList.remove('hidden');

      btn.disabled = false;
      btn.querySelector('.btn-text').classList.remove('hidden');
      btn.querySelector('.btn-spinner').classList.add('hidden');
    }
  } catch (err) {
    alertBox.className = 'alert error';
    alertBox.textContent = 'Network error. Please ensure the server is running.';
    alertBox.classList.remove('hidden');

    btn.disabled = false;
    btn.querySelector('.btn-text').classList.remove('hidden');
    btn.querySelector('.btn-spinner').classList.add('hidden');
  }
});
