/*
 * Validation shared by the sign-in/sign-up forms and the Better Auth config, so the
 * browser and the server agree on the rules. Each validator returns an error message
 * or undefined.
 */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 254;

export function validateName(value: string) {
  const name = value.trim();
  if (!name) return "Enter your name.";
  if (name.length > NAME_MAX_LENGTH) return `Use ${NAME_MAX_LENGTH} characters or fewer.`;
}

export function validateEmail(value: string) {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (email.length > EMAIL_MAX_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address, like name@example.com.";
  }
}

/** Sign-in only checks presence; the server decides whether the password is right. */
export function validatePasswordPresent(value: string) {
  if (!value) return "Enter your password.";
}

export function validateNewPassword(value: string) {
  if (!value) return "Create a password.";
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters (${PASSWORD_MIN_LENGTH - value.length} more).`;
  }
  if (value.length > PASSWORD_MAX_LENGTH) return `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`;
}
