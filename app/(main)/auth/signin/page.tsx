"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SignInPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [error, setError] = useState("");

    // If the user is already signed in, redirect to the home page
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="flex items-center justify-center w-full h-screen text-2xl font-bold">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const email = form.email.value;
        const password = form.password.value;
        
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                toast.error("Invalid email or password");
            } else {
                toast.success("Signed in successfully!");
                router.push("/");
            }
        } catch (err) {
            setError("An error occurred during sign in");
            toast.error("An error occurred during sign in");
            console.error(err);
        }
    };

    return (
        <div className="min-h-[82vh] py-10 flex flex-col md:flex-row items-center justify-center bg-green-100">
            <div className="md:max-w-[80%] w-full md:max-h-[600px] md:h-[550px] bg-white rounded-lg p-5 flex flex-col md:flex-row items-center justify-center gap-5 hoverEffect">
                  <div className="flex-1 h-full w-full hover:bg-shop_light_green rounded-r-full rounded-tl-full flex flex-col justify-center items-center text-white overflow-hidden  bg-shop_btn_dark_green hoverEffect group gap-2.5 border-4 border-shop_light_green text-center p-5">
                    <h2 className="text-2xl font-bold capitalize">Welcome Back</h2>
                    <h1 className="text-3xl font-bold capitalize"> Please <span className="group-hover:text-shop_dark_green text-4xl text-shop_light_green hoverEffect text-shadow-2xs">Sign In</span> to Continue</h1>
                    <p className="text-xl hidden md:block">and</p>
                    <h2 className="text-xl font-bold capitalize hidden md:block"> Shop With Confidence </h2>
                    <p className="hidden md:block">New user? <Link href="/auth/signup" className="text-green-500 underline hoverEffect group-hover:text-shop_dark_green" >Create an account</Link></p>
                </div>
                <div className="md:flex-1 w-full">
                    <form onSubmit={handleSubmit} className="m-8 space-y-6 ">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In to Your Account</h2>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {/* Email */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Email Address</label> <br />
                            <input type="email" name="email" placeholder="Enter your email" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Password */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Password</label> <br />
                            <input type="password" name="password" placeholder="Enter your password" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Submit Button */}
                        <button type="submit" className="w-full bg-shop_btn_dark_green hover:bg-shop_light_green text-white font-bold py-2 px-4 rounded-md hoverEffect">Sign In</button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <p>Don't have an account? <Link href="/auth/signup" className="text-green-600 hover:underline">Sign Up</Link></p>
                    </div>
                </div>
              
            </div>
        </div>
    );
}