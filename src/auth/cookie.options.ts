export const cookieOptionsToken = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  expires: new Date(new Date().getTime() + 600 * 1000),
};
