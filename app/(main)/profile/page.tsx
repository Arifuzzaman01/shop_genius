import { getServerAuthSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerAuthSession();

  // If not authenticated, redirect to sign in page
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.name || session.user?.email}!</h2>
          <div className="space-y-3">
            <p><strong>Email:</strong> {session.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}