document.addEventListener('DOMContentLoaded', () => {
  const language = document.getElementById('language');
  const open = document.getElementById('changeLanguage');
  const cancel = document.getElementById('cancel');
  if (open && language) {
    open.addEventListener('click', () => {
      language.showModal();
    });
  }
  if (cancel && language) {
    cancel.addEventListener('click', () => {
      language.close();
    });
  }
});