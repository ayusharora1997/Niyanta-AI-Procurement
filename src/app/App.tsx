import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes.tsx';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        closeButton
        richColors
        toastOptions={{
          className: 'rounded-[20px] border border-[#e8ebf3] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]',
          duration: 4000,
        }}
      />
    </>
  );
}
