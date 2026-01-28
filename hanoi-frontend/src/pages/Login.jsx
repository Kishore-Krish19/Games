import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const API = "http://localhost:5000";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        const res = await fetch(API + "/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.token) {
            // Save token
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("role", data.user.role);

            // Simple admin check (we'll improve later)
            if (data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/game");
            }
        } else {
            alert(data.message || "Login failed");
        }
    }

    return (

        <div className="main">
            <div className="center-card">
                <h2>Hanoi Game Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <br /><br />

                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <br /><br />

                    <button type="submit">
                        Login
                    </button>
                    <br /><br />
                    <p style={{ marginTop: "15px" }}>
                        New player?{" "}
                        <Link to="/register">Register here</Link>
                    </p>

                </form>
            </div>
        </div>
    );
}
