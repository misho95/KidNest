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
  credentials: string;
};

export type resetPasswordInputType = {
  credentials: string;
  password: string;
  rePassword: string;
  validationCode: string;
};
