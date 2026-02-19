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

  // Mobile Navigation Dropdown Toggle Logic
  const navLinksWithSubmenus = document.querySelectorAll('nav.site-navigation li > a[aria-haspopup="true"]');

  navLinksWithSubmenus.forEach(link => {
    link.addEventListener('click', function(event) {
      // const submenu = this.nextElementSibling; // This line can be removed if submenu is not used below

      event.preventDefault(); // Prevent default link behavior

      const parentLi = this.parentElement;
      parentLi.classList.toggle('submenu-active');

      const isExpanded = parentLi.classList.contains('submenu-active');
      this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

      // Optional: Close other open submenus logic (if ever added) would go here.
      // Desktop hover/focus CSS will still work alongside this.
    });

    // Optional: Add keyboard support for opening/closing with Enter/Space for parent links
    // This can be added later if required.
  });
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

// Lightbox functionality
function initializeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) {
    // If the modal is not on this page, do nothing.
    return;
  }

  const modalImg = document.getElementById('lightbox-image');
  const closeButton = document.querySelector('.close-button');

  const diagramPlaceholders = document.querySelectorAll('.concept-diagram-placeholder');

  diagramPlaceholders.forEach(placeholder => {
    const img = placeholder.querySelector('img');
    if (img) {
      img.onclick = function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
        modalImg.alt = this.alt; // Copy alt text for accessibility
      }
    }
  });

  if (closeButton) {
    closeButton.onclick = function() {
      modal.style.display = 'none';
    }
  }

  // Close modal when clicking on the background
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

// Function to filter drills
function filterDrills(category) {
  const cards = document.querySelectorAll('.drill-card');
  const buttons = document.querySelectorAll('.filter-btn');

  cards.forEach(card => {
    const tags = card.dataset.tags ? card.dataset.tags.split(',').map(t => t.trim()) : [];
    const isCategoryMatch = category === 'all' || card.dataset.category === category;
    const isTagMatch = tags.includes(category);

    if (isCategoryMatch || isTagMatch) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  buttons.forEach(btn => {
    const isSelected = btn.dataset.filter === category;
    btn.classList.toggle('active', isSelected);
    btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });
}

// Initialize drill filters
function initializeDrillFilters() {
  const filterContainer = document.querySelector('.drill-filters');
  if (!filterContainer) return;

  filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.dataset.filter;
      filterDrills(filter);
    }
  });
}

// Function to initialize the enterprise-level drill filter bar
function initializeDrillFilterBar() {
  const container = document.querySelector('.filter-bar-container');
  const scrollContainer = document.querySelector('.drill-filters');
  const btnLeft = document.querySelector('.scroll-btn-left');
  const btnRight = document.querySelector('.scroll-btn-right');

  if (!container || !scrollContainer) return;

  const updateIndicators = () => {
    const scrollLeft = scrollContainer.scrollLeft;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    // Use a small threshold (1px) to avoid sub-pixel flickering
    container.classList.toggle('has-scroll-left', scrollLeft > 1);
    container.classList.toggle('has-scroll-right', scrollLeft < maxScroll - 1);
  };

  const smoothScrollBy = (amount) => {
    scrollContainer.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Scroll event for gradients with passive listener for performance
  scrollContainer.addEventListener('scroll', updateIndicators, { passive: true });

  // Chevron clicks for desktop
  if (btnLeft) {
    btnLeft.addEventListener('click', () => smoothScrollBy(-300));
  }
  if (btnRight) {
    btnRight.addEventListener('click', () => smoothScrollBy(300));
  }

  // Keyboard navigation when focus is within the filter bar
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      smoothScrollBy(200);
      e.preventDefault(); // Prevent page scroll
    } else if (e.key === 'ArrowLeft') {
      smoothScrollBy(-200);
      e.preventDefault(); // Prevent page scroll
    }
  });

  // Initial check to set correct gradient visibility
  updateIndicators();

  // Handle window resize to re-calculate overflow
  window.addEventListener('resize', updateIndicators, { passive: true });

  // Re-check after a short delay to ensure dynamic content and layout are stable
  setTimeout(updateIndicators, 200);
}

// Call the functions to initialize components
// We need to ensure this runs after the DOM is loaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeLightbox();
      initializeDrillFilters();
      initializeDrillFilterBar();
    });
} else {
    // DOMContentLoaded has already fired
    initializeLightbox();
    initializeDrillFilters();
    initializeDrillFilterBar();
}
