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
