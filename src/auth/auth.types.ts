export type userSingUpInputType = {
  email: string;
  password: string;
  rePassword: string;
};

export type userSingInInputType = {
  password: string;
  email: string;
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
  email?: string;
  mobile?: string;
};

export type resetPasswordInputType = {
  type: 'email' | 'mobile';
  email?: string;
  mobile?: string;
  password: string;
  rePassword: string;
  validationCode: string;
};
