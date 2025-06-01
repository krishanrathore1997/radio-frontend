import Sidebar from "../components/Sidebar";
import { Toaster } from "react-hot-toast";
import Loading from "../components/Loading";


// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen bg-gray-100 font-sans">
//       <Sidebar />
//       <Toaster position="top-right" />
//       <main className="flex-1 overflow-y-auto p-2">{children}</main>
//     </div>
//   );
// }

interface AdminLayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function AdminLayout({ 
  children, 
  isLoading = false, 
  loadingMessage = "Loading..." 
}: AdminLayoutProps) {
  if (isLoading) {
    return <Loading message={loadingMessage} size="lg" />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <Toaster position="top-right" />
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}