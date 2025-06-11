document.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded');
  const btn = document.getElementById('hamburgerBtn');
  if (btn) {
    btn.addEventListener('click', function() {
      console.log('Hamburger button clicked!');
      this.classList.toggle('open');
      const navBar = document.getElementById('navBar');
      if (navBar) {
        navBar.classList.toggle('show');
      }
    });
  }
});
