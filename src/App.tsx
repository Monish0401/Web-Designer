import { Toaster } from 'sonner';
import { Canvas } from './components/Canvas';
import './styles/canvas.css';

export default function App() {
  return (
    <>
      <Canvas />
      <Toaster position="bottom-right" />
    </>
  );
}
