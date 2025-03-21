import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NotificationHandler } from '../notifications/NotificationHandler';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <NotificationHandler />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
} 