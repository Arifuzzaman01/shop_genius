"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        const profile_url = form.profile_url.value;
        console.log(name, email, password, profile_url);
        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/");
            }
        } catch (err) {
            setError("An error occurred during sign in");
            console.error(err);
        }
    };

    return (
        <div className="min-h-[82vh] py-10  flex items-center justify-center bg-green-100">
            <div className="max-w-[80%] w-full max-h-[600px] h-[550px] bg-white rounded-lg p-5 flex flex-col md:flex-row items-center justify-center gap-5">
                <div className="flex-1">
                    <form onSubmit={handleSubmit} className="m-8 space-y-6 ">
                        {/* Full Name */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Your Full Name</label> <br />
                            <input type="text" name="name" placeholder="Enter your full name" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Email */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Enter Your Email</label> <br />
                            <input type="text" name="email" placeholder="Enter your email" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Password */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Enter a Valid Password</label> <br />
                            <input type="text" name="password" placeholder="Enter your password" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Profile URL */}
                        <div className="rounded-md shadow-sm space-y-5 ">
                            <label className="text-sm font-medium m-2" >Enter a Valid Profile URL</label> <br />
                            <input type="text" name="profile_url" placeholder="Enter your profile URL" className="w-full p-2 border border-gray-300 rounded-md mt-2 hover:bg-gray-200/80 hoverEffect" required />
                        </div>
                        {/* Submit Button */}
                        <button type="submit" className="w-full bg-shop_btn_dark_green hover:bg-shop_light_green text-white font-bold py-2 px-4 rounded-md hoverEffect">SignUp</button>
                    </form>
                </div>
                <div className="flex-1 h-full w-full hover:bg-shop_light_green rounded-l-full rounded-tr-full flex flex-col justify-center items-center text-white overflow-hidden  bg-shop_btn_dark_green hoverEffect group gap-2.5 border-4 border-shop_light_green text-center">
                    <h2 className="text-2xl font-bold capitalize">Welcome to Back Our Shop</h2>
                    <h1 className="text-3xl font-bold capitalize"> Please <span className="group-hover:text-shop_dark_green text-4xl text-shop_light_green hoverEffect text-shadow-2xs">Login</span> to Continue</h1>
                    <p className="text-xl">and</p>
                    <h2 className="text-xl font-bold capitalize"> Shop With Confidence </h2>
                    <p>You have no account yet? Please <Link href="/auth/signup" className="text-green-500 underline hoverEffect group-hover:text-shop_dark_green" >SignUp</Link></p>
                </div>
            </div>
        </div>
    );
}