document.addEventListener('DOMContentLoaded', function () {
  const navItems = document.querySelectorAll('header nav ul li');

  navItems.forEach(function (item) {
    // Find direct anchor child for focus/blur
    const anchor = item.querySelector('a');
    if (anchor) {
        // If there's a submenu (ul inside this li)
        const submenu = item.querySelector('ul');
        if (submenu) {
            anchor.addEventListener('focus', function () {
                // Show submenu when parent link is focused
                item.classList.add('focus-within-parent');
            });

            // Find all focusable elements in the submenu
            const submenuLinks = submenu.querySelectorAll('a');
            if (submenuLinks.length > 0) {
                const lastLink = submenuLinks[submenuLinks.length - 1];
                lastLink.addEventListener('blur', function (e) {
                    // Check if focus is moving outside the current li
                    // Use a timeout to allow focus to shift before checking
                    setTimeout(() => {
                        if (!item.contains(document.activeElement)) {
                            item.classList.remove('focus-within-parent');
                        }
                    }, 0);
                });
            } else { // If no links in submenu, parent link blur should hide
                 anchor.addEventListener('blur', function() {
                    setTimeout(() => {
                        if (!item.contains(document.activeElement)) {
                            item.classList.remove('focus-within-parent');
                        }
                    }, 0);
                });
            }
        }
    }
  });

  // Add click listener for touch devices / ease of use
  const topLevelLinksWithSubmenus = document.querySelectorAll('header nav > ul > li > a');
  topLevelLinksWithSubmenus.forEach(link => {
    const parentLi = link.parentElement;
    const submenu = parentLi.querySelector('ul');
    if (submenu) {
      link.addEventListener('click', function(event) {
        // Prevent default if it's just a '#' link
        if (link.getAttribute('href') === '#') {
          event.preventDefault();
        }
        // Toggle a class to show/hide submenu
        parentLi.classList.toggle('submenu-active');
      });
    }
  });

});
