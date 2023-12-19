export const cookieOptionsToken = {
  httpOnly: true,
  maxAge: 60 * 5,
  secure: true,
  sameSite: 'strict',
};

export const cookieOptionsRefreshToken = {
  httpOnly: true,
  maxAge: 60 * 10,
  secure: true,
  sameSite: 'strict',
};
