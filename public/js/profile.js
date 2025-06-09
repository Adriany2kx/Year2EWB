document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('changePasswordBtn');
  const form = document.getElementById('changePasswordForm');
  const menuButtons = document.querySelectorAll('.menu-buttons button');

  // Toggle 'selected' class for menu buttons and show/hide Change Password form
  menuButtons.forEach(button => {
    button.addEventListener('click', function() {
      menuButtons.forEach(btn => btn.classList.remove('selected'));
      this.classList.add('selected');
      // Only show the form if "Change Password" is selected
      if (this === btn && form) {
        form.style.display = 'block';
      } else if (form) {
        form.style.display = 'none';
      }
    });
  });

  // Notification Preferences Modal logic
  const notificationBtn = document.getElementById('notificationPreferencesBtn');
  const notificationModal = document.getElementById('notificationModal');
  const closeNotificationModal = document.getElementById('closeNotificationModal');
  if (notificationBtn && notificationModal && closeNotificationModal) {
    notificationBtn.addEventListener('click', function() {
      notificationModal.style.display = 'flex';
    });
    closeNotificationModal.addEventListener('click', function() {
      notificationModal.style.display = 'none';
    });
    // Close modal when clicking outside modal content
    notificationModal.addEventListener('click', function(e) {
      if (e.target === notificationModal) notificationModal.style.display = 'none';
    });
  }

  // Select All / Deselect All for notification checkboxes
  const selectAllBtn = document.getElementById('selectAllBtn');
  const deselectAllBtn = document.getElementById('deselectAllBtn');
  const notificationForm = document.getElementById('notificationForm');
  if (selectAllBtn && deselectAllBtn && notificationForm) {
    selectAllBtn.addEventListener('click', function() {
      notificationForm.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
    });
    deselectAllBtn.addEventListener('click', function() {
      notificationForm.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    });
  }

  // Reset to Default (example: set some defaults)
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  if (resetDefaultsBtn && notificationForm) {
    resetDefaultsBtn.addEventListener('click', function() {
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

  // Help / FAQ button redirect
  const helpBtn = document.querySelector('.menu-buttons button:last-of-type');
  if (helpBtn) {
    helpBtn.addEventListener('click', function() {
      window.location.href = '/faq';
    });
  }

  // Edit Profile Modal logic
  const editProfileBtn = document.getElementById('editProfileBtn');
  const editProfileModal = document.getElementById('editProfileModal');
  const closeEditProfileModal = document.getElementById('closeEditProfileModal');
  if (editProfileBtn && editProfileModal && closeEditProfileModal) {
    editProfileBtn.addEventListener('click', function() {
      editProfileModal.style.display = 'flex';
    });
    closeEditProfileModal.addEventListener('click', function() {
      editProfileModal.style.display = 'none';
    });
    // Close modal when clicking outside modal content
    editProfileModal.addEventListener('click', function(e) {
      if (e.target === editProfileModal) editProfileModal.style.display = 'none';
    });
  }
  
  
});