export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: "DOCTOR" | "PATIENT"; // optional, default = STUDENT
};

export type LoginPayload = {
  email: string;
  password: string;
};


