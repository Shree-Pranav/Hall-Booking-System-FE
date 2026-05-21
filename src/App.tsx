import { AppRoutes } from "./app/routes";
import { Toaster } from "./components/ui/Toaster";

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
