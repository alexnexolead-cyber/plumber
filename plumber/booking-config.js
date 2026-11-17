// EDIT: Replace REPLACE_WITH_YOUR_ID with your actual Formspree form ID.
// The endpoint belongs to the account that should receive booking emails.
window.BOOKING_CONFIG = {
  endpoint: 'https://formspree.io/f/REPLACE_WITH_YOUR_ID',
  // EDIT: Keep 'form' for Formspree; 'json' supports a public Make/Zapier webhook.
  mode: 'form'
};
