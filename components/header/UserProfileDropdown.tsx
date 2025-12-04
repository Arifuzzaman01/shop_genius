"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { LogOut, User } from "lucide-react";

const UserProfileDropdown = () => {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="focus:outline-none">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                className="w-10 h-10 rounded-full object-cover border-2 border-shop_light_green"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-shop_light_green flex items-center justify-center text-white">
                <User size={20} />
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent 
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-0 w-64"
          sideOffset={10}
        >
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-shop_light_green flex items-center justify-center text-white">
                  <User size={24} />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {session.user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500 truncate max-w-[150px]">
                  {session.user?.email}
                </p>
              </div>
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
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserProfileDropdown;