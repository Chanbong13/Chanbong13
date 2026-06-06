import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      lineUserId?: string | null;
    } & DefaultSession["user"];
  }
}
