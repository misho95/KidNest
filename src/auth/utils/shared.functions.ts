export const checkCredentialType = (cred: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+995[0-9]{9}$/;
  if (emailRegex.test(cred)) {
    return 'email';
  }

  if (phoneRegex.test(cred)) {
    return 'mobile';
  }

  return null;
};
