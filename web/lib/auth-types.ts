import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "estimator" | "foreman" | "viewer";
    } & DefaultSession["user"];
  }
  interface User {
    role: "admin" | "estimator" | "foreman" | "viewer";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: "admin" | "estimator" | "foreman" | "viewer";
    id: string;
  }
}

export type UserRole = "admin" | "estimator" | "foreman" | "viewer";
