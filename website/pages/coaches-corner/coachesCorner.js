(function () {
  function init() {
    window.coachAuth.guard('/coaches-login.html');
    hydrateSharedLayout();
    bindEvents();
  }

  function hydrateSharedLayout() {
    fetch('/website/includes/header.html')
      .then((r) => r.text())
      .then((html) => {
        document.getElementById('site-header').innerHTML = html;
      });

    fetch('/website/includes/footer.html')
      .then((r) => r.text())
      .then((html) => {
        document.getElementById('site-footer').innerHTML = html;
      });
  }

  function bindEvents() {
    const logoutLink = document.getElementById('coach-logout');
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.coachAuth.logout();
      window.location.replace('/index.html');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
