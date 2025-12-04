"use client";
import React from 'react';
import UserProfileDropdown from './UserProfileDropdown';
import { signIn, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const SignIn = () => {
const {data: session} = useSession()
  return (
    <div>
      {
      session ? <UserProfileDropdown /> : <button onClick={() => redirect("/auth/signin") } className='px-2.5 py-1.5 bg-shop_light_green hover:bg-shop_btn_dark_green text-white rounded-sm'>Sign In</button>
      }
    </div>
  );
};

export default SignIn;