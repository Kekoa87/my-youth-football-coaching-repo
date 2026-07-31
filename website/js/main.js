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
      routeTreeSection.classList.add('hidden'); 
      routeTreeButton.textContent = 'Expand Route Tree';
      routeTreeButton.setAttribute('aria-expanded', 'false');

      routeTreeButton.addEventListener('click', () => {
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
      event.preventDefault();

      const parentLi = this.parentElement;
      parentLi.classList.toggle('submenu-active');

      const isExpanded = parentLi.classList.contains('submenu-active');
      this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });
  });
});

// Function to handle generic collapsible sections
function toggleCollapsible(event) {
    const button = event.target;
    const content = button.nextElementSibling;
    if (content) {
        const isNowHidden = content.classList.toggle('hidden');
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
    if (content) {
        content.classList.add('hidden');
        button.textContent = button.dataset.textExpand || 'Expand Section';
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', toggleCollapsible);
    }
});

// Lightbox functionality
// Reused across any page that includes the shared #lightbox-modal markup
// (see runConcepts.html, passingConcepts.html, blockingSchemes.html).
function initializeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;

  const modalImg = document.getElementById('lightbox-image');
  const closeButton = modal.querySelector('.close-button');
  const lightboxImages = document.querySelectorAll(
    '.concept-diagram-placeholder img, .blocking-rule-images img'
  );

  let lastFocusedElement = null;

  function openLightbox(img) {
    lastFocusedElement = document.activeElement;
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    modalImg.src = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  lightboxImages.forEach(img => {
    img.addEventListener('click', () => openLightbox(img));
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeLightbox);
  }

  // Click outside the image (on the dark backdrop) closes the modal.
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeLightbox();
    }
  });

  // Escape key closes the modal from anywhere on the page.
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
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


function slugifyDrillTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function assignDrillCardAnchors() {
  const isDrillPage = window.location.pathname.includes('/website/pages/drills/');
  if (!isDrillPage) return;

  const drillCards = document.querySelectorAll('.drill-card');
  if (!drillCards.length) return;

  drillCards.forEach((card, index) => {
    if (card.id) return;

    const titleElement = card.querySelector('h3');
    const titleText = titleElement ? titleElement.textContent : '';
    const slug = slugifyDrillTitle(titleText) || `drill-${index + 1}`;
    card.id = slug;
  });

  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
}

// Initialize drill filters
function initializeDrillFilters() {
  const filterContainer = document.querySelector('.drill-filters');
  if (!filterContainer || filterContainer.dataset.initialized === 'true') return;

  filterContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.dataset.filter;
      filterDrills(filter);
    }
  });
  filterContainer.dataset.initialized = 'true';
}

// Function to initialize the enterprise-level drill filter bar
function initializeDrillFilterBar() {
  const container = document.querySelector('.filter-bar-container');
  const scrollContainer = document.querySelector('.drill-filters');
  const btnLeft = document.querySelector('.scroll-btn-left');
  const btnRight = document.querySelector('.scroll-btn-right');

  if (!container || !scrollContainer || container.dataset.initialized === 'true') return;

  const updateIndicators = () => {
    const scrollLeft = scrollContainer.scrollLeft;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    container.classList.toggle('has-scroll-left', scrollLeft > 1);
    container.classList.toggle('has-scroll-right', scrollLeft < maxScroll - 1);
  };

  const smoothScrollBy = (amount) => {
    scrollContainer.scrollBy({ left: amount, behavior: 'smooth' });
  };

  scrollContainer.addEventListener('scroll', updateIndicators, { passive: true });

  if (btnLeft) {
    btnLeft.addEventListener('click', () => smoothScrollBy(-300));
  }
  if (btnRight) {
    btnRight.addEventListener('click', () => smoothScrollBy(300));
  }

  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      smoothScrollBy(200);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      smoothScrollBy(-200);
      e.preventDefault();
    }
  });

  updateIndicators();
  window.addEventListener('resize', updateIndicators, { passive: true });
  setTimeout(updateIndicators, 200);
  container.dataset.initialized = 'true';
}

// Function to fetch and initialize the drill filter bar template
function loadDrillFilterBar() {
  const container = document.querySelector('.filter-bar-container[data-needs-load="true"]');
  if (!container) {
    // If no dynamic container needs loading, initialize any static ones present
    initializeDrillFilters();
    initializeDrillFilterBar();
    return;
  }

  const buttonsHTML = container.innerHTML;
  container.innerHTML = ''; // Clear to prevent flickering while loading

  fetch("/website/includes/drill-filter-bar.html")
    .then(res => {
      if (!res.ok) throw new Error('Failed to load filter bar template');
      return res.text();
    })
    .then(template => {
      container.innerHTML = template.replace('<!-- FILTER_BUTTONS_PLACEHOLDER -->', buttonsHTML);
      container.removeAttribute('data-needs-load');
      // Initialize components now that HTML is injected
      initializeDrillFilters();
      initializeDrillFilterBar();
    })
    .catch(err => {
      console.error('Error loading drill filter bar:', err);
      // Fallback: Restore buttons in a simple wrapper if template fails
      container.innerHTML = `<div class="drill-filters" role="tablist">${buttonsHTML}</div>`;
      initializeDrillFilters();
    });
}

// Initial initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeLightbox();
      loadDrillFilterBar();
      assignDrillCardAnchors();
    });
} else {
    initializeLightbox();
    loadDrillFilterBar();
    assignDrillCardAnchors();
}
