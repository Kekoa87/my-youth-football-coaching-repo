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
});

// Function to handle collapsible sections
function toggleCollapsible(event) {
    const button = event.target;
    const content = button.nextElementSibling; // Assumes content is immediately after button
    const isExpanded = content.classList.toggle('hidden');
    button.textContent = isExpanded ? button.dataset.textCollapse : button.dataset.textExpand;
    button.setAttribute('aria-expanded', isExpanded);
}

// Add event listeners to all collapsible buttons
document.querySelectorAll('.collapsible-button').forEach(button => {
    // Ensure section is hidden by default by adding 'hidden' class if not present
    const content = button.nextElementSibling;
    if (content && !content.classList.contains('hidden')) {
        content.classList.add('hidden');
        // Update button state accordingly
        button.textContent = button.dataset.textExpand || 'Expand Section'; // Fallback text
        button.setAttribute('aria-expanded', 'false');
    }
    button.addEventListener('click', toggleCollapsible);
});

function toggleRouteTree() {
  const section = document.getElementById('routeTreeSection');
  const button = document.getElementById('toggleRouteTreeButton');
  if (section && button) {
    const isExpanded = section.classList.toggle('hidden');
    button.textContent = isExpanded ? 'Collapse Route Tree' : 'Expand Route Tree';
    button.setAttribute('aria-expanded', isExpanded);
  }
}

const routeTreeButton = document.getElementById('toggleRouteTreeButton');
if (routeTreeButton) {
  // Ensure section is hidden by default by adding 'hidden' class if not present
  const section = document.getElementById('routeTreeSection');
  if (section && !section.classList.contains('hidden')) {
     section.classList.add('hidden');
     // Update button state accordingly
     routeTreeButton.textContent = 'Expand Route Tree';
     routeTreeButton.setAttribute('aria-expanded', 'false');
  }
  routeTreeButton.addEventListener('click', toggleRouteTree);
}
