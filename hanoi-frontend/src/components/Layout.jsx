import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
    const nav = useNavigate();
    const role = localStorage.getItem("role");

    function logout() {
        localStorage.clear();
        nav("/");
    }

    return (
        <div>

            {/* NAVBAR */}
            <nav className="navbar">

                <h2 className="logo">HanoiArena</h2>

                <div className="nav-links">

                    <Link to="/game">Game</Link>

                    <Link to="/leaderboard">Leaderboard</Link>

                    <Link to="/bracket">Bracket</Link>

                    {role === "admin" && (
                        <Link to="/admin">Admin</Link>
                    )}

                    <button onClick={logout}>
                        Logout
                    </button>

                </div>

            </nav>

            {/* CONTENT */}
            <main className="main">
                {children}
            </main>

        </div>
    );
}
