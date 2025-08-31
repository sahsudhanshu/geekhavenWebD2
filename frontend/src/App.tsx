import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { generateColorFromSeed } from './utils/color';

function App() {

  const assignmentSeed = import.meta.env.VITE_ASSIGNMENT_SEED || '';
  const accentColor = generateColorFromSeed(assignmentSeed);
  const appStyle = {
    '--accent-color-dynamic': accentColor,
  } as React.CSSProperties;

  return (
    <div style={appStyle}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;