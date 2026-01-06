"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { LogOut, User, Mail, Phone, MapPin, Calendar, LogOutIcon } from "lucide-react";
import { useEffect, useState } from "react";

const UserProfileDropdown = () => {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData(session.user.email);
    }
  }, [session]);

  const fetchUserData = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users?email=${email}`, { method: 'GET' });
      const data = await response.json();
      setUserData(data);

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }
  // console.log(userData);
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <button className="focus:outline-none">
            {session.user?.image || (userData?.profile_url) ? (
              <img
                src={userData?.profileURL || session.user?.image}
                alt={userData?.name || session.user?.name || "User"}
                className="w-10 h-10 rounded-full object-cover border-2 border-shop_light_green hidden md:block"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-shop_light_green flex items-center justify-center text-white">
                <User size={20} />
              </div>
            )}
          </button>
          <button className=" py-1 text-sm text-shop_btn_dark_green bg-grey-200 rounded-md md:hidden"><LogOutIcon size={20} /></button>
          </div>

        </TooltipTrigger>
        <TooltipContent
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-0 w-80"
          sideOffset={10}
        >
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-shop_light_green"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {session.user?.image || (userData?.profile_url) ? (
                    <img
                      src={session.user?.image || userData?.profile_url}
                      alt={session.user?.name || userData?.name || "User"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-shop_light_green flex items-center justify-center text-white">
                      <User size={32} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {userData?.name || session.user?.name || "User"}
                    </p>
                    <p className="text-sm text-gray-500 truncate max-w-[180px]">
                      {userData?.email || session.user?.email}
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 mb-4">
                  {userData?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-gray-500" />
                      <span>{userData.phone}</span>
                    </div>
                  )}

                  {userData?.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin size={16} className="text-gray-500 mt-0.5" />
                      <span>{userData.address}</span>
                    </div>
                  )}

                  {userData?.created_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-500" />
                      <span>Member since {new Date(userData.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <Button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserProfileDropdown;