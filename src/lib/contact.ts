export const CONTACT_EMAIL = 'contactdrivereadyindia@gmail.com';
export const contactHref = (subject = 'DriveReady India') => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
