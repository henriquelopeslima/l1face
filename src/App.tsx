import { RouterProvider } from 'react-router';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { router } from '@/app/routes';

export default function App() {
  return (
    <ThemeProvider>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col">
          <RouterProvider router={router} />
        </div>
      </div>
    </ThemeProvider>
  );
}
