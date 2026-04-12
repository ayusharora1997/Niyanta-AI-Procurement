import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes.tsx';
import { SidebarProvider } from '@/app/components/ui/sidebar';

export default function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors duration={4000} />
    </SidebarProvider>
  );
}
