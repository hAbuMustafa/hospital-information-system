import crypto from 'crypto';

// CRITICAL: Generate the SHA256 hash correctly for all Gravatar operations
export function getGravatarHash(email: string) {
  // Trim and lowercase the email - BOTH steps are required
  email = email.trim().toLowerCase();

  // Create SHA256 hash (using a crypto library)
  const hash = crypto.createHash('sha256').update(email).digest('hex');

  return hash;
}

export function getGravatarLinkFromEmail(email: string) {
  return email
    ? `https://0.gravatar.com/avatar/${getGravatarHash(email)}`
    : '/default-profile.jpg';
}
