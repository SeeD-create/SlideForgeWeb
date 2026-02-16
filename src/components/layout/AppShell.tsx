import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { StepIndicator } from './StepIndicator';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <StepIndicator />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
