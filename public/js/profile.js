document.addEventListener('DOMContentLoaded', () => {
  // ============================
  // Utility Functions
  // ============================

  const showModal = (modal) => modal && (modal.style.display = 'flex');
  const hideModal = (modal) => modal && (modal.style.display = 'none');
  const setupModalToggle = (btn, modal, closeBtn) => {
    if (btn && modal && closeBtn) {
      btn.addEventListener('click', () => showModal(modal));
      closeBtn.addEventListener('click', () => hideModal(modal));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal(modal);
      });
    }
  };

  // ============================
  // Menu Button Logic
  // ============================

  const menuButtons = document.querySelectorAll('.menu-buttons button');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const changePasswordBtn = document.getElementById('changePasswordBtn');

  menuButtons.forEach(button => {
    button.addEventListener('click', function () {
      menuButtons.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');

      if (this === changePasswordBtn && changePasswordForm) {
        changePasswordForm.style.display = 'block';
      } else if (changePasswordForm) {
        changePasswordForm.style.display = 'none';
      }
    });
  });

  // ============================
  // Notification Preferences Modal
  // ============================

  setupModalToggle(
    document.getElementById('notificationPreferencesBtn'),
    document.getElementById('notificationModal'),
    document.getElementById('closeNotificationModal')
  );

  const notificationForm = document.getElementById('notificationForm');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');

  if (notificationForm) {
    const checkboxes = notificationForm.querySelectorAll('input[type="checkbox"]');

    selectAllBtn?.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = true);
    });

    deselectAllBtn?.addEventListener('click', () => {
      checkboxes.forEach(cb => cb.checked = false);
    });

    resetDefaultsBtn?.addEventListener('click', () => {
      notificationForm.activity.checked = true;
      notificationForm.system.checked = true;
      notificationForm.promotions.checked = false;
      notificationForm.reminders.checked = true;
      notificationForm.security.checked = true;
      notificationForm.email.checked = true;
      notificationForm.push.checked = false;
      notificationForm.sms.checked = false;
      notificationForm.inapp.checked = true;
      notificationForm.frequency.value = 'immediately';
      notificationForm.muteDuration.value = '24h';
      notificationForm.sensitive.checked = true;
      notificationForm.mobilePush.checked = false;
      notificationForm.desktopPush.checked = false;
    });
  }

  // ============================
  // Help / FAQ Redirect
  // ============================

  const helpBtn = document.querySelector('.menu-buttons button:last-of-type');
  helpBtn?.addEventListener('click', () => {
    window.location.href = '/faq';
  });

  // ============================
  // Edit Profile Modal
  // ============================

  setupModalToggle(
    document.getElementById('editProfileBtn'),
    document.getElementById('editProfileModal'),
    document.getElementById('closeEditProfileModal')
  );

  // ============================
  // Change Password Modal
  // ============================

  setupModalToggle(
    document.getElementById('changePasswordBtn'),
    document.getElementById('changePasswordModal'),
    document.getElementById('closeChangePasswordModal')
  );

  // ============================
  // Language Settings Modal
  // ============================

  setupModalToggle(
    document.querySelector('.menu-buttons button:nth-child(3)'),
    document.getElementById('languageModal'),
    document.getElementById('closeLanguageModal')
  );
});
