import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Game from "./pages/Game";
import Admin from "./pages/Admin";
import Leaderboard from "./pages/Leaderboard";
import Bracket from "./pages/Bracket";
import Register from "./pages/Register";

function Protected({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;

  if (adminOnly && role !== "admin") {
    return <Navigate to="/game" />;
  }

  return children;
}


export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">

      <Routes location={location} key={location.pathname}>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/game"
          element={
            <Protected>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <Game />
              </motion.div>
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected adminOnly>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <Admin />
              </motion.div>
            </Protected>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          }
        />

        <Route
          path="/bracket"
          element={
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.3 }}
            >
              <Bracket />
            </motion.div>
          }
        />

      </Routes>

    </AnimatePresence>
  );
}