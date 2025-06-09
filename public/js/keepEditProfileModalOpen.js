// ==============================
// Persistent Modal Display Handler
// Keeps a modal open after a successful update, based on flag set in <body> or localStorage
// ==============================
(function () {
  /**
   * Check for modal ID from <body data-modal-to-open> or from localStorage (fallback)
   */
  const modalId = document.body.dataset.modalToOpen || localStorage.getItem('modalToOpen');

  // Open modal on page load if modalId is present
  if (modalId) {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'flex';
        }
        localStorage.removeItem('modalToOpen');
      }, 100); // Small delay ensures modal DOM is rendered
    });
  }

  /**
   * On form submit within a modal, store that modal's ID so we can reopen it after a page refresh
   */
  document.addEventListener(
    'submit',
    (e) => {
      const form = e.target;
      const modal = form.closest('.modal');
      if (modal?.id) {
        localStorage.setItem('modalToOpen', modal.id);
      }
    },
    true // Use capture to catch form submission before redirect/navigation
  );
})();
