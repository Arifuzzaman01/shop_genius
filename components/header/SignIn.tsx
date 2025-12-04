"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";

function SignIn() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-darkColor">
          Hi, {session.user?.name || session.user?.email}
        </span>
        <Button 
          onClick={() => signOut()} 
          className="text-sm font-semibold hover:text-darkColor hoverEffect text-lightColor cursor-pointer bg-transparent border-0 p-0 h-auto"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => signIn()} 
      className="text-sm font-semibold hover:text-darkColor hoverEffect text-lightColor cursor-pointer bg-transparent border-0 p-0 h-auto"
    >
      Login
    </Button>
  );
}

export default SignIn;