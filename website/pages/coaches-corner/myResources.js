(function () {
  function init() {
    window.coachAuth.guard('/coaches-login.html');
    loadIncludes();
    initJumpNav();
  }

  function loadIncludes() {
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

  function initJumpNav() {
    const links = document.querySelectorAll('.resource-jump-nav__list a');
    if (!links.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );

    document.querySelectorAll('.resource-section').forEach((section) => {
      observer.observe(section);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
