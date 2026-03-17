/* ===================================================
   UI HELPERS — Crime Index Dashboard
   =================================================== */

const ui = {
  toast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(110%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  setLoading(btn, loading) {
    if (!btn) return;
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    if (loading) {
      btn.disabled = true;
      if (text) text.classList.add('hidden');
      if (spinner) spinner.classList.remove('hidden');
    } else {
      btn.disabled = false;
      if (text) text.classList.remove('hidden');
      if (spinner) spinner.classList.add('hidden');
    }
  },

  showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `alert ${type}`;
    el.textContent = message;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  },

  getIndexColor(index) {
    if (index < 30) return '#10B981';
    if (index < 60) return '#FFB800';
    return '#FF3B30';
  },

  getIndexLabel(index) {
    if (index < 30) return 'Low';
    if (index < 60) return 'Moderate';
    if (index < 80) return 'High';
    return 'Critical';
  },

  initClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const update = () => {
      el.textContent = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
    };
    update();
    setInterval(update, 1000);
  },

  initUserInfo() {
    const user = api.getUser();
    if (!user) return;

    const nameEls = document.querySelectorAll('.js-user-name');
    const roleEls = document.querySelectorAll('.js-user-role');
    const avatarEls = document.querySelectorAll('.js-user-avatar');

    nameEls.forEach(el => el.textContent = user.username || 'User');
    roleEls.forEach(el => el.textContent = user.role === 'admin' ? 'Administrator' : 'Analyst');
    avatarEls.forEach(el => el.textContent = (user.username || 'U').charAt(0).toUpperCase());

    // Show admin-only elements
    if (user.role === 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }
  },

  logout() {
    api.clearSession();
    window.location.href = '/';
  },
};
