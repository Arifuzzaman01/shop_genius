"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function SignUpPage() {
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
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const profile_url = (form.elements.namedItem("profile_url") as HTMLInputElement).value;

        try {
            // Register the user with the backend API
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    profile_url
                }),
            });

            if (response.ok) {
                // User registered successfully
                toast.success("Account created successfully!");
                
                // Automatically sign in the user after registration
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError("Registration successful, but error during sign in");
                    toast.error("Registration successful, but error during sign in");
                } else {
                    toast.success("Signed in successfully!");
                    router.push("/");
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Failed to create account");
                toast.error(errorData.message || "Failed to create account");
            }
        } catch (err) {
            setError("An error occurred during registration");
            toast.error("An error occurred during registration");
            console.error(err);
        }
    };

    return (
        <div className="min-h-[82vh] py-10  flex items-center justify-center bg-green-100 hoverEffect">
            <div className="md:max-w-[80%] w-full md:max-h-[650px] md:h-[550px] bg-white rounded-lg p-5 flex flex-col-reverse md:flex-row items-center justify-center gap-5">
                <div className="md:flex-1 w-full">
                    <form onSubmit={handleSubmit} className="m-8 space-y-6 ">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {/* Full Name */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Your Full Name</label> <br />
                            <input type="text" name="name" placeholder="Enter your full name" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
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
                        {/* Profile URL */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Profile URL</label> <br />
                            <input type="text" name="profile_url" placeholder="Enter your profile URL" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Submit Button */}
                        <button type="submit" className="w-full bg-shop_btn_dark_green hover:bg-shop_light_green text-white font-bold py-2 px-4 rounded-md hoverEffect">Sign Up</button>
                    </form>
                    
                    <div className="text-center mt-4">
                        <p>Already have an account? <Link href="/auth/signin" className="text-green-600 hover:underline">Sign In</Link></p>
                    </div>
                </div>
                <div className="md:flex-1 h-full w-full hover:bg-shop_light_green rounded-l-full rounded-tr-full flex flex-col justify-center items-center text-white overflow-hidden  bg-shop_btn_dark_green hoverEffect group gap-2.5 border-4 border-shop_light_green text-center p-5">
                    <h2 className="text-2xl font-bold capitalize">Welcome to Our Shop</h2>
                    <h1 className="text-3xl font-bold capitalize"> Please <span className="group-hover:text-shop_dark_green text-4xl text-shop_light_green hoverEffect text-shadow-2xs">Sign Up</span> to Continue</h1>
                    <p className="text-xl hidden md:block">and</p>
                    <h2 className="text-xl font-bold capitalize hidden md:block"> Shop With Confidence </h2>
                    <p className="hidden md:block">Already have an account? <Link href="/auth/signin" className="text-green-500 underline hoverEffect group-hover:text-shop_dark_green" >Sign In</Link></p>
                </div>
            </div>
        </div>
    );
}