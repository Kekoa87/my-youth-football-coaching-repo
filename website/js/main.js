// Function to toggle the mobile menu
function toggleMenu() {
  const nav = document.querySelector('nav ul');
  const hamburger = document.querySelector('.hamburger-menu');
  nav.classList.toggle('show');
  hamburger.classList.toggle('active');
}

// Function to toggle dark mode
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  // Optionally, save user preference to localStorage
  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark-mode');
  } else {
    localStorage.removeItem('theme');
  }
}

// Apply saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark-mode') {
    document.body.classList.add('dark-mode');
  }

  // Event listener for hamburger menu
  const hamburger = document.querySelector('.hamburger-menu');
  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }

  // Event listener for dark mode toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  // Route Tree Toggle Logic
  const routeTreeButton = document.getElementById('toggleRouteTreeButton');
  const routeTreeSection = document.getElementById('routeTreeSection');

  if (routeTreeButton && routeTreeSection) {
      // Ensure section is hidden by default and button state is correct
      // This will run regardless of whether 'hidden' is already on the section in HTML
      routeTreeSection.classList.add('hidden'); 
      routeTreeButton.textContent = 'Expand Route Tree';
      routeTreeButton.setAttribute('aria-expanded', 'false');

      routeTreeButton.addEventListener('click', () => {
          // Toggle returns true if class was added (now hidden), false if removed (now visible)
          const isNowHidden = routeTreeSection.classList.toggle('hidden');
          
          if (isNowHidden) {
              routeTreeButton.textContent = 'Expand Route Tree';
              routeTreeButton.setAttribute('aria-expanded', 'false');
          } else {
              routeTreeButton.textContent = 'Collapse Route Tree';
              routeTreeButton.setAttribute('aria-expanded', 'true');
          }
      });
  }
});

// Function to handle generic collapsible sections (if any are still used)
function toggleCollapsible(event) {
    const button = event.target;
    const content = button.nextElementSibling; // Assumes content is immediately after button
    if (content) { // Check if content exists
        const isNowHidden = content.classList.toggle('hidden');
        // Text and ARIA update based on whether 'hidden' is now present
        if (isNowHidden) {
            button.textContent = button.dataset.textExpand || 'Expand Section';
            button.setAttribute('aria-expanded', 'false');
        } else {
            button.textContent = button.dataset.textCollapse || 'Collapse Section';
            button.setAttribute('aria-expanded', 'true');
        }
    }
}

// Add event listeners to all generic collapsible buttons
document.querySelectorAll('.collapsible-button').forEach(button => {
    const content = button.nextElementSibling;
    if (content) { // Check if content exists
        // Set initial state for generic collapsibles
        content.classList.add('hidden');
        button.textContent = button.dataset.textExpand || 'Expand Section';
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', toggleCollapsible);
    }
});
