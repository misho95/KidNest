export const cookieOptionsToken = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
  expires: new Date(new Date().getTime() + 320 * 1000),
};

export const cookieOptionsTokenRefresh = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
  expires: new Date(new Date().getTime() + 3600 * 24 * 1000),
};
