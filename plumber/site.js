'use strict';
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 10);
});
function toggleMenu() {
  const open = document.getElementById('mobileMenu').classList.toggle('open');
  document.querySelector('.hamburger').setAttribute('aria-expanded', String(open));
}
const dropdown = document.querySelector('.has-drop');
const servicesTrigger = dropdown.querySelector('[aria-haspopup]');
function setDropdown(open) {
  dropdown.classList.toggle('is-open', open);
  dropdown.classList.toggle('is-dismissed', !open);
  servicesTrigger.setAttribute('aria-expanded', String(open));
}
dropdown.addEventListener('mouseenter', () => setDropdown(true));
dropdown.addEventListener('mouseleave', () => setDropdown(false));
servicesTrigger.addEventListener('click', () => setDropdown(!dropdown.classList.contains('is-open')));
dropdown.addEventListener('focusout', event => {
  if (!dropdown.contains(event.relatedTarget)) setDropdown(false);
});
document.addEventListener('click', event => {
  if (!dropdown.contains(event.target)) setDropdown(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const wasOpen = dropdown.classList.contains('is-open');
    setDropdown(false);
    if (wasOpen) servicesTrigger.focus();
    document.getElementById('mobileMenu').classList.remove('open');
    document.querySelector('.hamburger').setAttribute('aria-expanded', 'false');
  }
  if (event.target.matches('[role="button"]') && ['Enter', ' '].includes(event.key)) {
    event.preventDefault(); event.target.click();
  }
});
// Preserve standalone pages while supporting documented hash-style entry links.
const pages = ['home','svc-emergency','svc-drain','svc-water-heater','svc-leak','svc-camera','svc-commercial','about','areas','contact','gallery'];
function go(page) {
  if (!pages.includes(page)) return;
  location.href = page === 'home' ? 'index.html' : page.replace(/^svc-/, '') + '.html';
}
function followLegacyHash() {
  const page = location.hash.slice(1);
  if (pages.includes(page) && !document.getElementById('page-' + page)) go(page);
}
window.addEventListener('hashchange', followLegacyHash);
followLegacyHash();

// Client-side formatting checks; the receiving service must also validate submissions.
function sanitizeInput(str) { return str.replace(/[<>"']/g, '').trim(); }
function validatePhone(phone) { return /^[\d\s\-\(\)\+]{7,15}$/.test(phone) && (phone.match(/\d/g) || []).length >= 7; }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

document.addEventListener('keydown', event => {
  const link = event.target.closest('[data-href]');
  if (link && event.key === 'Enter') { location.href = link.dataset.href; }
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-in:not(.visible)').forEach(el => observer.observe(el));

document.querySelectorAll('form[data-source]').forEach((form, formIndex) => {
  const fields = [...form.querySelectorAll('input:not([type="hidden"]), select, textarea')];
  fields.forEach((field, index) => {
    const label = field.closest('.form-group')?.querySelector('label');
    if (!field.id) field.id = 'booking-' + formIndex + '-' + index;
    if (label) label.htmlFor = field.id;
    field.required = ['full_name','phone','service','business_name'].includes(field.name);
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    const values = Object.fromEntries(new FormData(form));
    for (const key in values) values[key] = sanitizeInput(values[key]);
    if (!values.full_name || !values.phone) { alert('Please enter your name and phone number.'); return; }
    if (!validatePhone(values.phone)) { alert('Please enter a valid phone number.'); return; }
    if (values.email && !validateEmail(values.email)) { alert('Please enter a valid email address.'); return; }
    const config = window.BOOKING_CONFIG || {};
    if (!config.endpoint || config.endpoint.includes('REPLACE_WITH_YOUR_ID')) { alert('Online booking is not connected yet. Please call the phone number shown on this page.'); return; }
    const startedAt = Date.now();
    let succeeded = false;
    const payload = {...values, service: values.service || form.dataset.service,
      source: form.dataset.source, page_url: location.href, submitted_at: new Date().toISOString()};
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending...';
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 20000);
    try {
      const isForm = config.mode === 'form';
      const formData = new FormData();
      for (const [key, value] of Object.entries(payload)) formData.append(key, value);
      const response = await fetch(config.endpoint, {method:'POST', signal:abort.signal,
        headers: isForm ? {'Accept':'application/json'} : {'Accept':'application/json','Content-Type':'application/json'},
        body: isForm ? formData : JSON.stringify(payload)});
      if (!response.ok) throw new Error('Booking endpoint rejected request');
      succeeded = true;
      const success = document.getElementById(form.id === 'bookingForm' ? 'formSuccess' : 'contactSuccess');
      if (success) { form.style.display = 'none'; success.style.display = 'block'; }
      else { button.textContent = '✓ Request Sent!'; }
    } catch (error) {
      alert('Your booking could not be sent. Please try again or call us directly.');
      button.textContent = originalText;
    } finally {
      clearTimeout(timeout);
      const remaining = Math.max(0, 3000 - (Date.now() - startedAt));
      setTimeout(() => { if (!succeeded) button.disabled = false; }, remaining);
    }
  });
});

// === Requested site improvements (append-only) ===
// EDIT: ZIP codes served by this business. Keep five-digit strings.
const coveredZips = [
  '75001','75002','75006','75007','75010','75011','75013','75019',
  '75020','75021','75022','75023','75024','75025','75034','75035',
  '75038','75039','75040','75041','75042','75043','75044','75048',
  '75050','75051','75052','75060','75061','75062','75063','75080',
  '75081','75082','75087','75088','75089','75090','75093','75094',
  '75098','75099','75150','75201','75202','75203','75204','75205'
];
function checkZip() {
  const input = document.getElementById('zipInput');
  const result = document.getElementById('zipResult');
  if (!input || !result) return;
  const zip = input.value.trim();
  result.className = 'zip-checker__result';
  // EDIT: ZIP checker feedback and phone number.
  if (!/^\d{5}$/.test(zip)) {
    result.textContent = '⚠️ Please enter a valid 5-digit ZIP code.';
  } else if (coveredZips.includes(zip)) {
    result.textContent = '✅ Great news! We service your area. Book now for same-day service.';
    result.classList.add('covered');
  } else {
    result.textContent = '📞 Not sure? Call us at (555) 123-4567 — we may still be able to help!';
    result.classList.add('not-covered');
  }
}
const zipInput = document.getElementById('zipInput');
if (zipInput) {
  zipInput.setAttribute('aria-label', 'ZIP code');
  zipInput.autocomplete = 'postal-code';
  zipInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); checkZip(); }
  });
}

// Only the new accordion participates; existing service FAQs remain unchanged.
const faqButtons = [...document.querySelectorAll('#faq .faq-item__question')];
function closeFaq(button) {
  const item = button.closest('.faq-item');
  item.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
  item.querySelector('.faq-item__answer').setAttribute('aria-hidden', 'true');
}
faqButtons.forEach((button, index) => {
  const item = button.closest('.faq-item');
  const answer = item.querySelector('.faq-item__answer');
  button.type = 'button';
  button.id = 'faq-question-' + index;
  answer.id = 'faq-answer-' + index;
  button.setAttribute('aria-controls', answer.id);
  answer.setAttribute('role', 'region');
  answer.setAttribute('aria-labelledby', button.id);
  closeFaq(button);
  button.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    faqButtons.forEach(closeFaq);
    if (!wasOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      answer.setAttribute('aria-hidden', 'false');
      answer.style.setProperty('--answer-height', answer.scrollHeight + 48 + 'px');
    }
  });
});
window.addEventListener('resize', () => {
  document.querySelectorAll('#faq .faq-item.open .faq-item__answer').forEach(answer => {
    answer.style.setProperty('--answer-height', answer.scrollHeight + 48 + 'px');
  });
});

// Keep the existing validated booking handler; feedback follows confirmed delivery.
document.querySelectorAll('form[data-source]').forEach(form => {
  const date = form.querySelector('input[type="date"]');
  if (date) {
    const today = new Date();
    date.min = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
  }
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  new MutationObserver(() => {
    if (button.textContent.trim() === '✓ Request Sent!') {
      // EDIT: Successful service-page booking confirmation.
      button.textContent = "✅ Request Sent! We'll call you shortly.";
      button.classList.add('booking-sent');
    }
  }).observe(button, {childList:true,subtree:true});
});

// Use the existing mobile service links rather than duplicating or relocating pages.
const mobileServicesTrigger = document.querySelector('.mobile-services-trigger');
if (mobileServicesTrigger) {
  const menu = document.getElementById('mobileMenu');
  menu.querySelectorAll('[data-href]').forEach(link => {
    if (['emergency.html','drain.html','water-heater.html','leak.html','camera.html','commercial.html'].includes(link.dataset.href)) {
      link.closest('li').classList.add('mobile-service-item');
    }
  });
  menu.classList.add('services-collapsed');
  mobileServicesTrigger.addEventListener('click', () => {
    const collapsed = menu.classList.toggle('services-collapsed');
    mobileServicesTrigger.setAttribute('aria-expanded', String(!collapsed));
  });
}

// Keep native Learn More links independent of their clickable card containers.
document.querySelectorAll('.learn-more-link').forEach(link => {
  link.addEventListener('click', event => event.stopPropagation());
});
