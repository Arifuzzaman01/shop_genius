import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const isError = status === "unauthenticated";

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  return {
    session,
    isAuthenticated,
    isLoading,
    isError,
    login,
    logout,
  };
};