// ============================================================
//  Winter Park Care & Rehabilitation Center — main.js
//  Handles: shared header/footer, navigation, animations, forms
// ============================================================

// ── Shared Header ────────────────────────────────────────────
const headerHTML = `
<header class="site-header" id="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo" aria-label="Winter Park Care & Rehabilitation Center Home">
      <img src="images/logo-mark.png" alt="WP" style="height:52px;width:52px;flex-shrink:0;">
      <div class="logo-text">
        <span class="logo-name">Winter Park Care</span>
        <span class="logo-sub">&amp; Rehabilitation Center</span>
      </div>
    </a>
    <nav class="main-nav" aria-label="Main Navigation">
      <a href="index.html"    class="nav-link">Home</a>
      <a href="about.html"    class="nav-link">About Us</a>
      <a href="services.html" class="nav-link">Services</a>
      <a href="careers.html"  class="nav-link">Careers</a>
      <a href="contact.html"  class="nav-link">Contact</a>
      <a href="contact.html?tour=1" class="nav-cta">Schedule a Tour</a>
    </nav>
    <button class="hamburger" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
  </div>
  <nav class="mobile-nav" aria-label="Mobile Navigation">
    <a href="index.html"    class="nav-link">Home</a>
    <a href="about.html"    class="nav-link">About Us</a>
    <a href="services.html" class="nav-link">Services</a>
    <a href="careers.html"  class="nav-link">Careers</a>
    <a href="contact.html"  class="nav-link">Contact</a>
    <a href="contact.html?tour=1" class="nav-cta">Schedule a Tour</a>
  </nav>
</header>`;

// ── Shared Footer ────────────────────────────────────────────
const footerHTML = `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo footer-logo" style="margin-bottom:16px;display:inline-flex;">
          <img src="images/logo-mark.png" alt="WP" style="height:52px;width:52px;flex-shrink:0;">
          <div class="logo-text">
            <span class="logo-name" style="color:#ffffff;">Winter Park Care</span>
            <span class="logo-sub" style="color:#D4B48C;">&amp; Rehabilitation Center</span>
          </div>
        </a>
        <p>Providing quality, compassionate care to residents and families in the Winter Park community.</p>
        <p style="margin-top:8px;font-size:0.82rem;color:rgba(255,255,255,0.4);">Licensed by the State of Florida Agency for Health Care Administration</p>
      </div>
      <div>
        <p class="footer-heading">Quick Links</p>
        <ul class="footer-links">
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About Us</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="careers.html">Careers</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="contact.html?tour=1">Schedule a Tour</a></li>
        </ul>
      </div>
      <div>
        <p class="footer-heading">Hours</p>
        <ul class="footer-links">
          <li style="color:rgba(255,255,255,0.65);font-size:.9rem;">Monday – Friday</li>
          <li style="color:rgba(255,255,255,0.65);font-size:.9rem;margin-bottom:12px;">9:00 AM – 5:00 PM</li>
          <li style="color:rgba(255,255,255,0.65);font-size:.9rem;">Resident Care</li>
          <li style="color:rgba(255,255,255,0.65);font-size:.9rem;">24 Hours / 7 Days</li>
        </ul>
      </div>
      <div class="footer-contact">
        <p class="footer-heading">Contact Us</p>
        <p>42970 Scarlet Road<br>Winter Park, FL 32792</p>
        <p><a href="tel:4076718030">(407) 671-8030</a></p>
        <p>Fax: (407) 671-3746</p>
        <p><a href="mailto:contactuss@winterparkcrh.com">contactus@winterparkcrh.com/a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Winter Park Care & Rehabilitation Center. All rights reserved.</p>
    </div>
  </div>
</footer>`;

// ── Inject Header & Footer ───────────────────────────────────
document.getElementById('header-mount')?.insertAdjacentHTML('afterend', headerHTML);
document.getElementById('footer-mount')?.insertAdjacentHTML('beforebegin', footerHTML);

// ── Scroll Shadow on Header ──────────────────────────────────
window.addEventListener('scroll', () => {
  document.querySelector('.site-header')?.classList.toggle('scrolled', window.scrollY > 10);
});

// ── Mobile Hamburger Menu ────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav?.classList.toggle('open');
});

// ── Active Nav Link ──────────────────────────────────────────
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.getAttribute('href') === currentPage) link.classList.add('active');
});

// ── Scroll-triggered Animations ─────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.animate-in').forEach((el, i) => {
  if (!el.dataset.delay) el.dataset.delay = (i % 4) * 80;
  observer.observe(el);
});

// ── Form Success Handler ─────────────────────────────────────
function handleFormSubmit(formId, successTitle) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    // TODO: Replace setTimeout with real fetch() call to Cloudflare Worker
    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#7A9E87" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;margin:16px 0 8px;">${successTitle}</h3>
          <p style="color:#4A5568;">We'll be in touch within one business day.</p>
        </div>`;
    }, 1000);
  });
}
