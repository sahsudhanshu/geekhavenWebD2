import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {

  // const assignmentSeed = import.meta.env.VITE_ASSIGNMENT_SEED || '';
  // const accentColor = generateColorFromSeed(assignmentSeed);
  // const appStyle = {
  //   '--accent-color-dynamic': accentColor,
  // } as React.CSSProperties;

  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;