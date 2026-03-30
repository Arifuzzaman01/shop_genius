import Header from "@/components/header/Header";
import QueryProvider from "../providers/queryProvider";
import Footer from "@/components/footer/Footer";
import AuthSessionProvider from "../providers/sessionProvider";
import { Toaster } from "react-hot-toast";
// import { CartProvider } from "@/contexts/CartContext";
import ReduxProvider from "../providers/ReduxProvider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionProvider>
      <ReduxProvider>
        <Header />
        <main>
          <QueryProvider>{children}</QueryProvider>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </ReduxProvider>
    </AuthSessionProvider>
  );
}