"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validateUrl,
  FormValidationErrors 
} from "@/lib/auth-validation";

export default function SignUpPage() {
    const router = useRouter();
    const { status } = useSession();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({});

    // If the user is already signed in, redirect to the dashboard
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") {
        return <div className="flex items-center justify-center w-full h-screen text-2xl font-bold">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setValidationErrors({});
        setIsLoading(true);

        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
        const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const profile_url = (form.elements.namedItem("profile_url") as HTMLInputElement).value.trim();

        // Client-side validation using utility functions
        const errors: FormValidationErrors = {};

        if (!validateName(name)) {
            errors.name = "Name must be between 2 and 50 characters";
        }

        if (!validateEmail(email)) {
            errors.email = "Please enter a valid email address";
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errors.join(", ");
        }

        if (!validateUrl(profile_url)) {
            errors.profile_url = "Please enter a valid URL";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError("Please fix the validation errors below");
            toast.error("Please fix the validation errors");
            setIsLoading(false);
            return;
        }

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

            // Check content type before parsing
            const contentType = response.headers.get("content-type");
            
            if (!contentType || !contentType.includes("application/json")) {
                console.error("API returned non-JSON response:", response.status);
                
                if (response.status === 404) {
                    throw new Error("Registration endpoint not found. Please check API configuration.");
                } else if (response.status >= 500) {
                    throw new Error("Server is temporarily unavailable. Please try again later.");
                } else {
                    throw new Error(`Server returned status ${response.status}. Please try again.`);
                }
            }

            const errorData = await response.json();

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
                    setError("Registration successful, but error during sign in. Please try logging in manually.");
                    toast.error("Registration successful, but error during sign in");
                } else {
                    toast.success("Signed in successfully!");
                    router.push("/dashboard");
                }
            } else {
                const errorData = await response.json();
                
                // Handle specific error cases
                if (response.status === 409) {
                    // Conflict - email already exists
                    setError("An account with this email already exists. Please sign in instead.");
                    toast.error("Email already registered");
                } else if (response.status === 400) {
                    // Bad request - validation error from server
                    setError(errorData.message || "Invalid information provided");
                    toast.error(errorData.message || "Invalid information provided");
                } else {
                    setError(errorData.message || "Failed to create account");
                    toast.error(errorData.message || "Failed to create account");
                }
            }
        } catch (err) {
            const errorMessage = "An error occurred during registration. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[82vh] py-10  flex items-center justify-center bg-green-100 hoverEffect">
            <div className="md:max-w-[80%] w-full md:max-h-[650px] md:h-[550px] bg-white rounded-lg p-5 flex flex-col-reverse md:flex-row items-center justify-center gap-5">
                <div className="md:flex-1 w-full">
                    <form onSubmit={handleSubmit} className="m-8 space-y-4 ">
                        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        
                        {/* Full Name */}
                        <div className="rounded-md shadow-sm space-y-2">
                            <label className="text-sm font-medium" >Your Full Name</label> <br />
                            <input 
                                type="text" 
                                name="name" 
                                placeholder="Enter your full name" 
                                className={`w-full p-2 border rounded-md mt-2 hover:bg-gray-200/80 hoverEffect ${validationErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                                required 
                                disabled={isLoading}
                            />
                            {validationErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                            )}
                        </div>
                        
                        {/* Email */}
                        <div className="rounded-md shadow-sm space-y-2">
                            <label className="text-sm font-medium" >Email Address</label> <br />
                            <input 
                                type="email" 
                                name="email" 
                                placeholder="Enter your email" 
                                className={`w-full p-2 border rounded-md mt-2 hover:bg-gray-200/80 hoverEffect ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                                required 
                                disabled={isLoading}
                            />
                            {validationErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                            )}
                        </div>
                        
                        {/* Password */}
                        <div className="rounded-md shadow-sm space-y-2">
                            <label className="text-sm font-medium" >Password</label> <br />
                            <input 
                                type="password" 
                                name="password" 
                                placeholder="Create a strong password" 
                                className={`w-full p-2 border rounded-md mt-2 hover:bg-gray-200/80 hoverEffect ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                                required 
                                disabled={isLoading}
                            />
                            {validationErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                            )}
                            {!validationErrors.password && (
                                <p className="text-gray-500 text-xs mt-1">
                                    Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
                                </p>
                            )}
                        </div>
                        
                        {/* Profile URL */}
                        <div className="rounded-md shadow-sm space-y-2">
                            <label className="text-sm font-medium" >Profile URL (Optional)</label> <br />
                            <input 
                                type="text" 
                                name="profile_url" 
                                placeholder="https://example.com/profile.jpg" 
                                className={`w-full p-2 border rounded-md mt-2 hover:bg-gray-200/80 hoverEffect ${validationErrors.profile_url ? 'border-red-500' : 'border-gray-300'}`}
                                disabled={isLoading}
                            />
                            {validationErrors.profile_url && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.profile_url}</p>
                            )}
                        </div>
                        
                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full bg-shop_btn_dark_green hover:bg-shop_light_green text-white font-bold py-2 px-4 rounded-md hoverEffect disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>
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