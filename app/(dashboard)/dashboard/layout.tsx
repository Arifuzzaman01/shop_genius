// components/dashboard-shell.tsx
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/dashboard/AppSider"
import { UserNav } from "@/components/dashboard/user-nav"
import AuthSessionProvider from "@/app/providers/sessionProvider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto bg-muted/20">
            <header className="fixed w-full  top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
              <div className="flex-1">
                <SidebarTrigger />
              </div>
              <div className="flex items-center gap-4 flex-2 ">
                <input type="text" placeholder="Search..." className="rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full" />
              </div>
               <div className="flex-1 flex justify-end">
                 <UserNav />
               </div>
            </header>
            <div className="p-6 md:p-8 mt-12">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthSessionProvider>
  )
}