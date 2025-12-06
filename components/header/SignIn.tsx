"use client";
import React from 'react';
import UserProfileDropdown from './UserProfileDropdown';
import { signIn, useSession } from 'next-auth/react';
import { LogIn } from 'lucide-react';

const SignIn = () => {
const {data: session} = useSession()
  return (
    <div>
      {
      session ? <UserProfileDropdown /> : <>
      <button onClick={() => signIn() } className='px-2.5 py-1.5 bg-shop_light_green hover:bg-shop_btn_dark_green text-white rounded-sm hidden md:inline-block'>Sign In</button>
      <button className=' p-1.5 bg-shop_light_green hover:bg-shop_btn_dark_green text-white rounded-sm md:hidden'> <LogIn size={20}/> </button>
      </>
      }
    </div>
  );
};

export default SignIn;