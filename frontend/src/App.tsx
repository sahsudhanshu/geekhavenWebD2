import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;