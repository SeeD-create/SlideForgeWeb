import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Step1Theme } from './components/steps/Step1Theme';
import { Step2Input } from './components/steps/Step2Input';
import { Step3Config } from './components/steps/Step3Config';
import { Step4Generate } from './components/steps/Step4Generate';
import { Step5Refine } from './components/steps/Step5Refine';
import { Step6Export } from './components/steps/Step6Export';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/theme" replace />} />
          <Route path="/theme" element={<Step1Theme />} />
          <Route path="/input" element={<Step2Input />} />
          <Route path="/config" element={<Step3Config />} />
          <Route path="/generate" element={<Step4Generate />} />
          <Route path="/refine" element={<Step5Refine />} />
          <Route path="/export" element={<Step6Export />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
