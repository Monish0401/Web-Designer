import { Toaster } from 'sonner';
import { Canvas } from './components/Canvas';
import { Header } from './components/ui/Header';
import { Footer } from './components/ui/Footer';
import './styles/canvas.css';

export default function App() {
  return (
    <>
      <Header />
      <Canvas />
      <Toaster position="bottom-right" />
      <Footer />
    </>
  );
}
