
// Track function calls
let scrollCallCount = 0;
let isScrollListenerAdded = false;

// Handle scroll for dynamic card
function handleScroll() {
  scrollCallCount++;
  const dynamicCard = document.querySelector('.dynamic-card');
  
  if (dynamicCard) {
    const scrollPosition = window.scrollY;
    const triggerPoint = 1500; // Adjust this value to change when the transition happens
    
    console.log(scrollPosition, triggerPoint, dynamicCard, 'scrollCallCount');
    if (scrollPosition > triggerPoint) {
      dynamicCard.classList.add('is-scrolled');
    } else {
      dynamicCard.classList.remove('is-scrolled');
    }
  }
}

const savePath = () => {
  // Use event delegation to handle all auth-related buttons
  document.addEventListener('click', (e) => {
    // Check if the clicked element or its parent is an auth link
    const authLink = e.target.closest('[data-auth-type]');
    console.log(authLink);
    if (authLink) {
      const currentPath = window.location.pathname + window.location.hash || '/';
      if (!currentPath.includes('login') && !currentPath.includes('signup')) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
  });
}

// Function to safely add scroll listener
function initializeScrollHandler() {
  // Only add the scroll listener if we're on a page that has or will have the dynamic card
  const isOfferPage = window.location.pathname.includes('/details/') || 
                     window.location.hash.startsWith('#/details/');
  
  console.log('Initializing scroll handler. Is offer page:', isOfferPage);
  console.log(isOfferPage, 'isoffer')
  if (isOfferPage && !isScrollListenerAdded) {  
    // Wait for the dynamic card to be available
    const checkForDynamicCard = () => {
      const dynamicCard = document.querySelector('.dynamic-card');
      if (dynamicCard) {
        console.log('Dynamic card found, adding scroll listener');
        window.addEventListener('scroll', handleScroll);
        isScrollListenerAdded = true;
        // handleScroll(); // Initial check
      } else {
        console.log('Dynamic card not found yet, retrying in 100ms');
        setTimeout(checkForDynamicCard, 100);
      }
    };
    
    checkForDynamicCard();
  } else {
    console.log('Not an offer page or listener already added - skipping');
  }
}

// Initialize on both DOMContentLoaded and on route changes
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Initializing scroll handler');
  initializeScrollHandler();
  savePath();
  updateNavbar();
});

// Handle route changes
window.addEventListener('hashchange', () => {
  console.log('Route changed - Reinitializing scroll handler');
  // Remove existing scroll listener if it exists
  if (isScrollListenerAdded) {
    window.removeEventListener('scroll', handleScroll);
    isScrollListenerAdded = false;
  }
  initializeScrollHandler();
});

// Show offer page
function showOfferPage(offer) {
  window.scrollTo(0, 0);
  const template = document.getElementById('offer-template').innerHTML;
  
  // Create the dynamic content sections
  const detailedDescriptionHtml = `
    <div class="detailed-description">
      <p class="overview">${offer.detailedDescription.overview}</p>
      
      <div class="description-points">
        ${offer.detailedDescription.keyPoints.map(point => `
          <div class="description-point">
            <h4>${point.title}</h4>
            <p>${point.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="use-cases">
        <h4>Common Use Cases</h4>
        <ul>
          ${offer.detailedDescription.useCases.map(useCase => `
            <li>${useCase}</li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;

  const benefitsHtml = offer.benefits.map(benefit => `
    <div class="benefit-card">
      <span class="benefit-icon">${benefit.icon}</span>
      <h4>${benefit.title}</h4>
      <p>${benefit.description}</p>
    </div>
  `).join('');

  const featuresHtml = offer.features.map(feature => `
    <div class="feature-card">
      <div class="feature-check">✓</div>
      <div class="feature-content">
        <h4>${feature.title}</h4>
        <p>${feature.description}</p>
      </div>
    </div>
  `).join('');

  const eligibilityHtml = offer.eligibility.map(item => `<li>${item}</li>`).join('');

  const faqHtml = offer.faq.map((item, idx) => `
    <div class="faq-item">
      <div class="faq-question" data-faq-idx="${idx}">
      <h3>${item.question}</h3>
        <span class="faq-icon">+</span>
      </div>
      <div class="faq-answer" style="display:none;">
      <p>${item.answer}</p>
      </div>
    </div>
  `).join('');

  const testimonialsHtml = offer.testimonials.map(testimonial => `
    <div class="testimonial-card">
      <div class="testimonial-rating">${'⭐'.repeat(testimonial.rating)}</div>
      <p>${testimonial.text}</p>
      <div class="testimonial-author">
        <img src="${testimonial.author.avatar}" alt="${testimonial.author.name}">
        <div>
          <strong>${testimonial.author.name}</strong>
          <span>${testimonial.author.title}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Generate HTML for key points in the dynamic card
  const keyPointsHtml = offer.keyPoints ? offer.keyPoints.map(point => `<li>${point}</li>`).join('') : '';

  // Generate alternatives (exclude current offer)
  const alternativesHtml = offers
    .filter(o => o.id !== offer.id)
    .slice(0, 3)
    .map(o => `
      <div class="alternative-card">
        <img src="${o.logo}" class="logo" alt="${o.name}">
        <div class="alt-name">${o.name}</div>
        <a href="/details#${o.id}" data-link class="alt-link">View</a>
      </div>
    `).join('');

  // Generate more tools section (all available tools in card format)
  const moreToolsHtml = offers
    .filter(o => o.id !== offer.id)
    .slice(0, 6)
    .map(o => `
      <div class="card">
        ${o.id === 'aws' ? '<span class="flame">🔥</span>' : ''}
        ${o.id === 'digitalocean' ? '<span class="flame">🔥</span>' : ''}
        ${o.id === 'xero' ? '<span class="badge">NEW</span>' : ''}
        <img src="${o.logo}" class="logo" alt="${o.name}">
        <div class="discount">${o.discount}</div>
        <div class="description">${o.description}</div>
        <a href="/details#${o.id}" data-link class="cta">Learn More</a>
      </div>
    `).join('');

  // Replace all content
  const content = template
    .replace(/\${offer\.name}/g, offer.name)
    .replace(/\${offer\.logo}/g, offer.logo)
    .replace(/\${offer\.discount}/g, offer.discount)
    .replace(/\${offer\.description}/g, offer.description)
    .replace(/\${offer\.shortDescription}/g, offer.shortDescription)
    .replace(/\${offer\.keyPoints}/g, keyPointsHtml)
    .replace(/\${detailedDescription}/g, detailedDescriptionHtml)
    .replace(/\${offer\.originalPrice}/g, offer.originalPrice)
    .replace(/\${offer\.discountedPrice}/g, offer.discountedPrice)
    .replace(/\${offer\.savings}/g, offer.savings)
    .replace(/\${offer\.stats\.redeemed}/g, offer.stats.redeemed)
    .replace(/\${offer\.stats\.rating}/g, offer.stats.rating)
    .replace(/\${offer\.stats\.reviews}/g, offer.stats.reviews)
    .replace(/\${benefits}/g, benefitsHtml)
    .replace(/\${features}/g, featuresHtml)
    .replace(/\${eligibility}/g, eligibilityHtml)
    .replace(/\${faq}/g, faqHtml)
    .replace(/\${testimonials}/g, testimonialsHtml)
    .replace(/\${alternatives}/g, alternativesHtml)
    .replace(/\${moreTools}/g, moreToolsHtml);

  document.querySelector('main').innerHTML = content;

  // Add scroll event listener
  // window.addEventListener('scroll', handleScroll); // This line is removed as per the edit hint
  // handleScroll(); // Initial check

  // FAQ dropdown logic
  document.querySelectorAll('.faq-question').forEach((el) => {
    el.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('.faq-icon');
      const isOpen = answer.style.display === 'block';
      // Close all other answers
      document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        answer.style.display = 'block';
        icon.classList.add('open');
      } else {
        answer.style.display = 'none';
        icon.classList.remove('open');
      }
    });
  });
}



// Show home page
function showHomePage() {
  const template = document.getElementById('home-template').content.cloneNode(true);
  document.querySelector('main').innerHTML = '';
  document.querySelector('main').appendChild(template);
}

// Show 404 page
function showNotFound() {
  document.querySelector('main').innerHTML = '<h1>404 - Page Not Found</h1>';
}

// Show pricing page
function showPricingPage() {
  document.querySelector('main').innerHTML = document.getElementById('pricing-template').innerHTML;
  
  // Setup pricing toggle
  const toggleOptions = document.querySelectorAll('.toggle-option');
  const priceElements = {
    startup: { yearly: '$149', lifetime: '$999' },
    agency: { yearly: '$299', lifetime: '$1,999' },
    accelerator: { yearly: '$499', lifetime: '$2,999' },
    community: { yearly: '$399', lifetime: '$2,499' }
  };
  
  // Handle period toggle
  toggleOptions.forEach(option => {
    option.addEventListener('click', () => {
      const period = option.dataset.period;
      toggleOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      // Update prices based on selected business type and period
      const selectedType = document.querySelector('.selector-option.active').dataset.type;
      updatePrices(selectedType, period);
    });
  });
  
  // Handle business type selection
  const typeOptions = document.querySelectorAll('.selector-option');
  typeOptions.forEach(option => {
    option.addEventListener('click', () => {
      typeOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      // Update prices based on selected type and period
      const period = document.querySelector('.toggle-option.active').dataset.period;
      updatePrices(option.dataset.type, period);
    });
  });
  
  // Function to update prices
  function updatePrices(type, period) {
    const priceElement = document.querySelector('.pricing-card.premium .price.' + period);
    const periodElement = document.querySelector('.pricing-card.premium .period.' + period);
    const otherPriceElement = document.querySelector('.pricing-card.premium .price.' + (period === 'yearly' ? 'lifetime' : 'yearly'));
    const otherPeriodElement = document.querySelector('.pricing-card.premium .period.' + (period === 'yearly' ? 'lifetime' : 'yearly'));
    
    priceElement.textContent = priceElements[type][period];
    priceElement.classList.add('active');
    periodElement.classList.add('active');
    otherPriceElement.classList.remove('active');
    otherPeriodElement.classList.remove('active');
  }
}

// Show dashboard page
async function showDashboardPage() {
  try {
    // Clean up existing page elements
    document.body.className = 'dashboard-page'; // Add dashboard-specific class
    document.querySelector('nav.navbar')?.remove(); // Remove main navigation
    document.querySelector('footer')?.remove(); // Remove footer
    document.querySelector('.hero')?.remove(); // Remove hero section
    document.querySelector('.features-section')?.remove(); // Remove features section
    document.querySelector('.cta-section')?.remove(); // Remove CTA section
    document.querySelector('.testimonials-section')?.remove(); // Remove testimonials section
    
    // Load all required resources first
    console.log('Loading dashboard page');
    const loadResources = async () => {
      // Load dashboard styles
      if (!document.querySelector('link[href="/dashboard/dashboard.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/dashboard/dashboard.css';
        await new Promise((resolve, reject) => {
          link.onload = resolve;
          link.onerror = reject;
          document.head.appendChild(link);
        });
      }
      
      // Load Font Awesome
      if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        await new Promise((resolve, reject) => {
          faLink.onload = resolve;
          faLink.onerror = reject;
          document.head.appendChild(faLink);
        });
      }
      
      // Load Google Fonts
      if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        await new Promise((resolve, reject) => {
          fontLink.onload = resolve;
          fontLink.onerror = reject;
          document.head.appendChild(fontLink);
        });
      }
    };

    // Wait for all resources to load
    await loadResources();

    // Fetch the dashboard HTML
    const response = await fetch('/dashboard/index.html');
    const html = await response.text();
    
    // Replace the main content
    document.querySelector('main').innerHTML = html;
    
    // Load and execute dashboard script
    const script = document.createElement('script');
    script.src = '/dashboard/dashboard.js';
    
    // Wait for script to load before proceeding
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

    // Initialize dashboard functionality
    if (typeof fetchDeals === 'function') {
      fetchDeals();
    }
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.querySelector('main').innerHTML = '<h1>Error loading dashboard</h1>';
  }
}

// Show details page
async function showDetailsPage(offerId) {
  // Show loading state first
  // const template = document.getElementById('details-template').content.cloneNode(true);
  // document.querySelector('main').innerHTML = '';
  // document.querySelector('main').appendChild(template);

  try {
    const deal = await fetchDealDetails(offerId);
    if (!deal) {
    showNotFound();
    return;
  }

    
    // Update the content first
    await updatePageContent(deal);
    
    // Immediately hide skeleton and show content
    const skeletonState = document.querySelector('.skeleton-state');
    const contentContainer = document.querySelector('.content-container');
    console.log(skeletonState, 'skeletonState');
    console.log(contentContainer, 'contentContainer');
    
    if (skeletonState) {
      skeletonState.style.display = 'none';
    }
    
    if (contentContainer) {
      contentContainer.style.display = 'block';
    }
    

  } catch (error) {
    console.error('Error loading deal details:', error);
    showNotFound();
  }
}

// Handle navigation
document.addEventListener('click', async (e) => {
  // Check if the clicked element or its parent has data-auth-type
  const authLink = e.target.closest('[data-auth-type]');
  if (authLink) {
    const currentPath = window.location.pathname + window.location.hash;
    if (!currentPath.includes('login') && !currentPath.includes('signup')) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
  }

  // Handle regular navigation links
  if (e.target.matches('[data-link]')) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    
    // Update URL and handle route
    window.history.pushState({}, '', href);
    window.scrollTo(0, 0); // Scroll to top before handling route
    handleRoute();
  }
});

// Handle browser back/forward and hash changes
window.addEventListener('popstate', () => {
  window.scrollTo(0, 0); // Scroll to top on back/forward
  handleRoute();
});
window.addEventListener('hashchange', () => {
  window.scrollTo(0, 0); // Scroll to top on hash change
  handleRoute();
});

// Initial route handling
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0); // Scroll to top on initial load
    handleRoute();
  });
} else {
  window.scrollTo(0, 0); // Scroll to top if already loaded
  handleRoute();
}

// Clean up scroll listener when changing pages
function cleanupPage() {
  window.removeEventListener('scroll', handleScroll);
  // Remove mobile fixed card if it exists
  const mobileCard = document.querySelector('.mobile-fixed-card');
  const slidingCard = document.querySelector('.mobile-sliding-card');
  if (mobileCard) {
    mobileCard.remove();
  }
  if (slidingCard) {
    slidingCard.remove();
  }
  // Reset body overflow
  document.body.style.overflow = '';
}

// Show login page
async function showLoginPage() {
  try {
    // Remove navigation and footer
    const navbar = document.querySelector('nav.navbar');
    const footer = document.querySelector('footer');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Load auth styles if not already loaded
    if (!document.querySelector('link[href="/auth/auth.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/auth/auth.css';
      document.head.appendChild(link);
    }

    // Fetch and display login template
    const response = await fetch('/auth/login.html');
    const html = await response.text();
    document.querySelector('main').innerHTML = html;

    // Load auth.js if not already loaded
    if (!document.querySelector('script[src="/auth/auth.js"]')) {
      const script = document.createElement('script');
      script.src = '/auth/auth.js';
      document.body.appendChild(script);
    }

  } catch (error) {
    console.error('Error loading login page:', error);
    showNotFound();
  }
}

// Show signup page
async function showSignupPage() {
  try {
    console.log('Loading signup page');
    // Remove navigation and footer
    const navbar = document.querySelector('nav.navbar');
    const footer = document.querySelector('footer');
    if (navbar) navbar.style.display = 'none';
    if (footer) footer.style.display = 'none';

    // Load auth styles if not already loaded
    if (!document.querySelector('link[href="/auth/auth.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/auth/auth.css';
      document.head.appendChild(link);
    }

    // Fetch and display signup template
    const response = await fetch('/auth/signup.html');
    const html = await response.text();
    document.querySelector('main').innerHTML = html;

    // Load auth.js if not already loaded
    if (!document.querySelector('script[src="/auth/auth.js"]')) {
      const script = document.createElement('script');
      script.src = '/auth/auth.js';
      document.body.appendChild(script);
    }

  } catch (error) {
    console.error('Error loading signup page:', error);
    showNotFound();
  }
}

// Function to store current path before redirecting to login
function storePathAndRedirectToLogin() {
  const currentPath = window.location.pathname + window.location.hash;
  if (!currentPath.includes('login') && !currentPath.includes('signup')) {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  window.history.replaceState({}, '', '/#login');
  showLoginPage();
}

// Add this function near the top of the file
async function updateNavbar() {
  const isLoggedIn = await fetch('/api/auth/me', {credentials: 'include'}).then(res => res.ok).catch(() => false);
  const navButton = document.querySelector('.nav-button');
  
  if (navButton) {
    if (isLoggedIn) {
      navButton.textContent = 'Logout';
      navButton.href = '#';
      navButton.removeAttribute('data-auth-type');
      navButton.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'GET',
            credentials: 'include'
          });
          
          if (response.ok) {
            // Clear any stored data
            sessionStorage.removeItem('redirectAfterLogin');
            // Refresh the page
            window.location.href = '/#signup';
          } else {
            console.error('Logout failed');
          }
        } catch (error) {
          console.error('Error during logout:', error);
        }
      });
    } else {
      navButton.textContent = 'Sign up';
      navButton.href = '/#signup';
      navButton.setAttribute('data-auth-type', 'signup');
    }
  }
}

// Update handleRoute function to call updateNavbar
function handleRoute() {
  cleanupPage(); // Clean up before changing routes
  const path = window.location.pathname;
  const hash = window.location.hash.substring(1); // Remove the # symbol

  // Update navbar first
  updateNavbar();

  // First check hash-based routes
  if (hash.startsWith('signup')) {
    showSignupPage();
    return;
  } else if (hash.startsWith('login')) {
    showLoginPage();
    return;
  } else {
    // Show navigation and footer for non-auth pages
    const navbar = document.querySelector('nav.navbar');
    const footer = document.querySelector('footer');
    if (navbar) navbar.style.display = '';
    if (footer) footer.style.display = '';
  }
  
  // Then check other routes
  if (path === '/details' || path === '/details/' || path.includes('/details/index.html')) {
    if (hash) {
      // Load the details page template and fetch deal data
      console.log('Loading details page template');
      fetch('/details/index.html')
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Get the template content
          const template = doc.getElementById('details-template');
          if (!template) {
            console.error('Details template not found');
            showNotFound();
            return;
          }

          // Clear main content and add template
          const main = document.querySelector('main');
          main.innerHTML = template.innerHTML;

          showDetailsPage(hash);
        })
        .catch(error => {
          console.error('Error loading details template:', error);
          showNotFound();
        });
    } else {
      window.history.replaceState({}, '', '/');
      showHomePage();
    }
  } else if (path === '/' || path === '') {
    showHomePage();
  } else if (path === '/pricing' || path === '/pricing/') {
    showPricingPage();
  } else if (path === '/dashboard' || path === '/dashboard/') {
    // Check if user is authenticated
    showDashboardPage();
  } else {
    showNotFound();
  }
  window.scrollTo(0, 0);
}

// Function to fetch deal details from the API
async function fetchDealDetails(dealId) {
  try {
    const response = await fetch(`/api/deals/${dealId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
    
    console.error('Unexpected API response format:', result);
    return null;
  } catch (error) {
    console.error('Error fetching deal details:', error);
    return null;
  }
}

// Function to update the page with deal details
async function updatePageContent(deal) {
  console.log(deal, 'deal');
  // Update header section
  document.querySelectorAll('.offer-logo').forEach(img => {
    img.src = deal.imageUrl;
    img.alt = deal.name;
  });
  document.querySelectorAll('.offer-name').forEach(el => el.textContent = deal.name);
  document.querySelector('.offer-subtitle').textContent = deal.description;

  // Check if user is logged in
  const isLoggedIn = await fetch('/api/auth/me', {credentials: 'include'}).then(res => res.ok).catch(() => false);
  const dealButtonHtml = isLoggedIn ? `
    <div class="coupon-container">
      <div class="coupon-code">${deal.coupon || 'FOUNDER50'}</div>
      <button class="copy-btn" onclick="copyCode('${deal.coupon || 'FOUNDER50'}')">
        <i class='bx bx-copy'></i>
      </button>
    </div>
  ` : '<a data-link data-auth-type="signup" style="text-decoration: none; text-align: center;" href="/#signup" class="cta-large">Get this deal</a>';

  // Update the copyCode function to show copy animation
  async function copyCode(code) {
    try {
        await navigator.clipboard.writeText(code);
        const copyBtn = document.querySelector('.copy-btn i');
        copyBtn.className = 'bx bx-check';
        copyBtn.style.color = '#2ecc71';
        
        setTimeout(() => {
            copyBtn.className = 'bx bx-copy';
            copyBtn.style.color = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
  }

  // Add copyCouponCode function for sidebar coupon
  window.copyCouponCode = async function() {
    try {
        const couponCode = document.querySelector('.coupon-code-text').textContent;
        await navigator.clipboard.writeText(couponCode);
        const copyBtn = document.querySelector('.copy-coupon-btn i');
        copyBtn.className = 'bx bx-check';
        copyBtn.style.color = '#2ecc71';
        
        setTimeout(() => {
            copyBtn.className = 'bx bx-copy';
            copyBtn.style.color = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy coupon:', err);
    }
  };

  // Add mobile fixed card
  const mobileCard = document.createElement('div');
  mobileCard.className = 'mobile-fixed-card';
  mobileCard.innerHTML = `
    <div class="deal-info">
      <h3 class="deal-name">${deal.name}</h3>
      ${dealButtonHtml}
    </div>
  `;
  document.body.appendChild(mobileCard);

  // Add mobile sliding card
  const slidingCard = document.createElement('div');
  slidingCard.className = 'mobile-sliding-card';
  const details = deal.details[0] || {};
  const savings = calculateSavings(details.originalPrice, details.discountedPrice);
  
  slidingCard.innerHTML = `
    <div class="close-btn">&times;</div>
    <div class="deal-content">
      <div class="deal-description">${deal.description}</div>
      <div class="price-details">
        <div class="price-item">
          <span class="price-label">Original Price</span>
          <span class="price-value">${formatPrice(details.originalPrice)}</span>
        </div>
        <div class="price-item">
          <span class="price-label">Your Price</span>
          <span class="price-value">${formatPrice(details.discountedPrice)}</span>
        </div>
        <div class="price-item">
          <span class="price-label">You Save</span>
          <span class="price-value">${formatPrice(savings)}</span>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-icon">👥</span>
          <span class="stat-text">${details.numberOfPeopleRedeemed || 0} redeemed</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⭐</span>
          <span class="stat-text">${details.rating ? `${details.rating.toFixed(1)} stars` : 'No ratings yet'}</span>
        </div>
      </div>
      ${dealButtonHtml}
    </div>
  `;
  document.body.appendChild(slidingCard);

  // Add click handlers for mobile sliding card
  const dealName = mobileCard.querySelector('.deal-name');
  const closeBtn = slidingCard.querySelector('.close-btn');

  dealName.addEventListener('click', () => {
    slidingCard.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  });

  closeBtn.addEventListener('click', () => {
    slidingCard.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  });

  // Add touch swipe to close
  let touchStartY = 0;
  let touchEndY = 0;

  slidingCard.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  });

  slidingCard.addEventListener('touchmove', (e) => {
    touchEndY = e.touches[0].clientY;
    const diff = touchEndY - touchStartY;
    
    // Only allow downward swipe
    if (diff > 0) {
      slidingCard.style.bottom = `-${diff}px`;
    }
  });

  slidingCard.addEventListener('touchend', () => {
    const diff = touchEndY - touchStartY;
    
    if (diff > 100) { // If swiped down more than 100px
      slidingCard.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    slidingCard.style.bottom = ''; // Reset position
    touchStartY = 0;
    touchEndY = 0;
  });

  // Update desktop sidebar buttons
  const sidebarButtons = document.querySelectorAll('.dynamic-card .key-points .cta-large, .dynamic-card .pricing-details .cta-large');
  sidebarButtons.forEach(button => {
    const parentDiv = button.parentElement;
    const newElement = document.createElement('div');
    newElement.className = 'sidebar-cta';
    newElement.innerHTML = dealButtonHtml;
    button.replaceWith(newElement);
  });

  // Add click handler for desktop get deal button if not logged in
  if (!isLoggedIn) {
    document.querySelectorAll('.sidebar-cta .get-deal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Store current path and redirect to login
        const currentPath = window.location.pathname + window.location.hash;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/#login';
      });
    });
  }

  // Add click handler for the mobile get deal button if not logged in
  if (!isLoggedIn) {
    const getDealBtn = mobileCard.querySelector('.get-deal-btn');
    if (getDealBtn) {
      getDealBtn.addEventListener('click', () => {
        // Store current path and redirect to login
        const currentPath = window.location.pathname + window.location.hash;
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/#login';
      });
    }
  }

  // Update pricing details
  document.querySelector('.value.original').textContent = formatPrice(details.originalPrice);
  document.querySelector('.value.discounted').textContent = formatPrice(details.discountedPrice);
  document.querySelector('.value.savings').textContent = formatPrice(savings);
  
  // Update coupon section
  const couponSection = document.querySelector('.coupon-section');
  const couponCodeText = document.querySelector('.coupon-code-text');
  if (deal.coupon && couponSection && couponCodeText) {
    couponCodeText.textContent = deal.coupon;
    couponSection.style.display = 'block';
  }
  
  // Update stats
  document.querySelector('.stat-text.redeemed').textContent = `${details.numberOfPeopleRedeemed || 0} redeemed`;
  document.querySelector('.stat-text.rating').textContent = details.rating ? `${details.rating.toFixed(1)} stars` : 'No ratings yet';

  // Update main content sections
  document.querySelector('.detailed-description').innerHTML = renderDetailedDescription(deal.detailedDescription, deal.useCases);
  document.querySelector('.benefits-grid').innerHTML = renderBenefits(deal.keyBenefits);
  document.querySelector('.features-grid').innerHTML = renderFeatures(deal.whatsIncluded || []);
  document.querySelector('.eligibility-list').innerHTML = renderEligibility(deal.useCases || []);
  document.querySelector('.faq-list').innerHTML = renderFAQ(deal.faq || []);
  document.querySelector('.testimonials-grid').innerHTML = renderTestimonials(deal.reviews || []);

  // Update key points in sidebar
  const keyPointsList = document.querySelector('.key-points-list');
  keyPointsList.innerHTML = (deal.keyBenefits || []).slice(0, 3).map(benefit => `
    <li>${benefit.title}</li>
  `).join('');

  // Update tool description in sidebar
  document.querySelector('.tool-description').innerHTML = `<p>${deal.description}</p>`;
  document.querySelector('.tool-hero-image').src = deal.imageUrl;

  // Add copy code function to window
  window.copyCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      // Update all copy buttons on the page
      document.querySelectorAll('.copy-btn').forEach(btn => {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = originalIcon;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  };

  // Add styles for coupon code
  if (!document.querySelector('#coupon-styles')) {
    const style = document.createElement('style');
    style.id = 'coupon-styles';
    style.textContent = `
      .coupon-container {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .coupon-code {
        padding: 8px 16px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 16px;
        letter-spacing: 1px;
      }
      .copy-btn {
        color: white;
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 36px;
      }
      .copy-btn:hover {
        background: #4f46e5;
      }
      .copy-btn.copied {
        background: #22c55e;
      }
      .sidebar-cta .coupon-container {
        width: 100%;
      }
      .sidebar-cta .coupon-code {
        flex: 1;
        text-align: center;
      }
      
    `;
    document.head.appendChild(style);
  }

  // Setup FAQ interactions
  document.querySelectorAll('.faq-question').forEach((el) => {
    el.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('.faq-icon');
      const isOpen = answer.style.display === 'block';
      
      // Close all other answers
      document.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
      document.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('open'));
      
      if (!isOpen) {
        answer.style.display = 'block';
        icon.classList.add('open');
      } else {
        answer.style.display = 'none';
        icon.classList.remove('open');
      }
    });
  });

  // Fetch other deals for alternatives and more tools sections
      fetch('/api/deals')
    .then(response => response.json())
    .then(result => {
      if (result.success && result.data) {
        const otherDeals = result.data.filter(d => d._id !== deal._id);
        
        // Sort deals: status deals first, then others
        otherDeals.sort((a, b) => {
          const aHasStatus = a.recent || a.trending || a.popular;
          const bHasStatus = b.recent || b.trending || b.popular;
          
          if (aHasStatus && !bHasStatus) return -1;
          if (!aHasStatus && bHasStatus) return 1;
          
          // If both have status, prioritize recent > trending > popular
          if (aHasStatus && bHasStatus) {
            if (a.recent && !b.recent) return -1;
            if (!a.recent && b.recent) return 1;
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            if (a.popular && !b.popular) return -1;
            if (!a.popular && b.popular) return 1;
          }
          
          return 0;
        });

        // Update alternatives section
        const alternativesHtml = otherDeals.slice(0, 3).map(d => {
          const statusBadges = [];
          if (d.recent) statusBadges.push('<span class="status-badge recent">Recent</span>');
          if (d.trending) statusBadges.push('<span class="status-badge trending">Trending</span>');
          if (d.popular) statusBadges.push('<span class="status-badge popular">Popular</span>');
          
          return `
            <div class="alternative-card ${d.recent ? 'recent' : ''}">
              ${statusBadges.join('')}
              <img src="${d.imageUrl}" class="logo" alt="${d.name}">
              <div class="alt-name">${d.name}</div>
              <a href="/details#${d._id}" data-link class="alt-link">View</a>
            </div>
          `;
        }).join('');
        document.querySelector('.alternatives-grid').innerHTML = alternativesHtml;

        // Update more tools section
        const moreToolsHtml = otherDeals.slice(0, 6).map(d => {
          const statusBadges = [];
          if (d.recent) statusBadges.push('<span class="status-badge recent">Recent</span>');
          if (d.trending) statusBadges.push('<span class="status-badge trending">Trending</span>');
          if (d.popular) statusBadges.push('<span class="status-badge popular">Popular</span>');
          
          return `
            <div class="card">
              ${d.details[0]?.rating >= 4.5 ? '<span class="flame">🔥</span>' : ''}
              ${d.details[0]?.numberOfPeopleRedeemed >= 1000 ? '<span class="flame">🔥</span>' : ''}
              ${isNewDeal(d) ? '<span class="badge">NEW</span>' : ''}
              ${statusBadges.join('')}
              <img src="${d.imageUrl}" class="logo" alt="${d.name}">
              <div class="discount">${calculateDiscount(d.details[0])}</div>
              <div class="description">${d.description}</div>
              <a href="/details#${d._id}" data-link class="cta">Learn More</a>
            </div>
          `;
        }).join('');
        document.querySelector('.more-tools .grid').innerHTML = moreToolsHtml;
      }
    })
    .catch(error => console.error('Error fetching other deals:', error));
}

// Helper function to calculate discount display
function calculateDiscount(details) {
  if (!details) return '';
  const original = details.originalPrice;
  const discounted = details.discountedPrice;
  if (!original || !discounted) return '';
  const percentage = ((original - discounted) / original * 100).toFixed(0);
  return `${percentage}% Off`;
}

// Helper function to check if a deal is new (less than 7 days old)
function isNewDeal(deal) {
  if (!deal._id) return false;
  const timestamp = deal._id.toString().substring(0, 8);
  const dealDate = new Date(parseInt(timestamp, 16) * 1000);
  const now = new Date();
  const diffDays = (now - dealDate) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

// Helper function to format price (e.g., $100.50 to $100.50)
function formatPrice(price) {
  if (typeof price === 'string') {
    return price;
  }
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}

// Helper function to render detailed description
function renderDetailedDescription(description, useCases) {
  let html = '<div class="description-points">';
  description.forEach(point => {
    html += `
      <div class="description-point">
        <h4>${point.title}</h4>
        <p>${point.content}</p>
      </div>
    `;
  });
  html += '</div>';
  html += '<div class="use-cases">';
  html += '<h4>Common Use Cases</h4>';
  html += '<ul>';
  useCases.forEach(useCase => {
    html += `<li>${useCase}</li>`;
  });
  html += '</ul>';
  html += '</div>';
  return html;
}

// Helper function to render benefits
function renderBenefits(benefits) {
  let html = '';
  benefits.forEach(benefit => {
    html += `
      <div class="benefit-card">
        <h4>${benefit.title}</h4>
        <p>${benefit.content}</p>
      </div>
    `;
  });
  return html;
}

// Helper function to render features
function renderFeatures(features) {
  let html = '';
  features.forEach(feature => {
    html += `
      <div class="feature-card">
        <div class="feature-check">✓</div>
        <div class="feature-content">
          <h4>${feature.title}</h4>
          <p>${feature.content}</p>
        </div>
      </div>
    `;
  });
  return html;
}

// Helper function to render eligibility
function renderEligibility(eligibility) {
  let html = '<ul>';
  eligibility.forEach(item => {
    html += `<li>${item}</li>`;
  });
  html += '</ul>';
  return html;
}

// Helper function to render FAQ
function renderFAQ(faq) {
  let html = '';
  faq.forEach((item, idx) => {
    html += `
      <div class="faq-item">
        <div class="faq-question" data-faq-idx="${idx}">
          <h3>${item.question}</h3>
          <span class="faq-icon">+</span>
        </div>
        <div class="faq-answer" style="display:none;">
          <p>${item.answer}</p>
        </div>
      </div>
    `;
  });
  return html;
}

// Helper function to render testimonials
function renderTestimonials(testimonials) {
  let html = '';
  testimonials.forEach(testimonial => {
    html += `
      <div class="testimonial-card">
        <div class="testimonial-rating">${'⭐'.repeat(testimonial.rating)}</div>
        <p>${testimonial.comment}</p>
        <div class="testimonial-author">
          <div>
            <strong>${testimonial.userName}</strong>
          </div>
        </div>
      </div>
    `;
  });
  return html;
}

// Helper function to calculate savings between original and discounted price
function calculateSavings(original, discounted) {
  if (!original || !discounted) return 0;
  return original - discounted;
}

// Function to render deals in the grid
function renderDeals(deals) {
  const gridContainer = document.querySelector('.grid');
  if (!gridContainer) return;

  // Add loading class to show skeleton
  gridContainer.classList.add('loading');

  // Update the deals count in the hero section
  const dealsCountElement = document.querySelector('.hero-subtitle .highlight-amount');
  if (dealsCountElement) {
    const totalValue = deals.reduce((sum, deal) => {
      const savings = deal.details?.[0]?.originalPrice - deal.details?.[0]?.discountedPrice || 0;
      return sum + savings;
    }, 0);
    dealsCountElement.textContent = `$${Math.round(totalValue).toLocaleString()}+`;
  }

  // Create the deals HTML
  const dealsHTML = deals.map(deal => createDealCard(deal)).join('');
  
  // After a short delay to show the skeleton, render the content
  setTimeout(() => {
    // Remove loading class to hide skeleton
    gridContainer.classList.remove('loading');
    // Add the deals with a fade-in effect
    const contentDiv = document.createElement('div');
    contentDiv.className = 'deals-content';
    contentDiv.style.opacity = '0';
    contentDiv.innerHTML = dealsHTML;
    
    // Clear previous content (except skeleton)
    const oldContent = gridContainer.querySelector('.deals-content');
    if (oldContent) {
      oldContent.remove();
    }
    
    gridContainer.appendChild(contentDiv);
    
    // Trigger fade in
    requestAnimationFrame(() => {
      contentDiv.style.transition = 'opacity 0.3s ease';
      contentDiv.style.opacity = '1';
    });
  }, 1000); // Show skeleton for 1 second
}

// Function to create a single deal card HTML
function createDealCard(deal) {
  const savings = calculateSavings(deal.details?.[0]?.originalPrice, deal.details?.[0]?.discountedPrice);
  const discountText = calculateDiscount(deal.details?.[0]);
  const isNew = isNewDeal(deal);

  return `
    <div class="card">
      ${deal.id === 'aws' ? '<span class="flame">🔥</span>' : ''}
      ${deal.id === 'digitalocean' ? '<span class="flame">🔥</span>' : ''}
      ${deal.id === 'xero' ? '<span class="badge">NEW</span>' : ''}
      <img src="${deal.imageUrl}" class="logo" alt="${deal.name}">
      <div class="discount">${discountText}</div>
      <div class="description">${deal.description}</div>
      <a href="/details#${deal._id}" data-link class="cta">Learn More</a>
    </div>
  `;
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

// Initialize mobile menu on page load and after route changes
document.addEventListener('DOMContentLoaded', initMobileMenu);
window.addEventListener('popstate', initMobileMenu); 