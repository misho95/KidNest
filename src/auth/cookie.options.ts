export const cookieOptionsToken = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  expires: new Date(new Date().getTime() + 300 * 1000),
};

export const cookieOptionsTokenRefresh = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  expires: new Date(new Date().getTime() + 600 * 1000),
};
