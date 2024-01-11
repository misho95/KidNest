export type userSingUpInputType = {
  credentials: string;
  password: string;
  rePassword: string;
};

export type userSingInInputType = {
  credentials: string;
  password: string;
};

export type updateProfileInputType = {
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
};

export type updatePasswordType = {
  oldPassword: string;
  password: string;
  rePassword: string;
};

export type resetRequestType = {
  type: 'email' | 'mobile';
  credentials: string;
};

export type resetPasswordInputType = {
  type: 'email' | 'mobile';
  credentials: string;
  password: string;
  rePassword: string;
  validationCode: string;
};

export type cacheType = {
  cachedCredentials: string;
  cachedValidationToken: string;
};
