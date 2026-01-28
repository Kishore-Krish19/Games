import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        const res = await fetch(API + "/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
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
        <div className="app">

            <h2>Hanoi Game Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <p>
                    New player?{" "}
                    <a href="/register">Register here</a>
                </p>

            </form>

        </div>
    );
}
