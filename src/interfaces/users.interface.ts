export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  password: string;
  avatar: string;
}

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar: string;
}

export interface SignupUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface LoginUser {
  email: string;
  password: string;
}
