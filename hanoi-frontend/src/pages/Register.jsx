import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const nav = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();

        const res = await fetch(API + "/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registered! Please login.");
            nav("/");
        } else {
            alert(data.message);
        }
    }

    return (
        <div className="main">
            <div className="center-card">
                <div className="page-wrapper">
                    <h2>Register</h2>

                    <form onSubmit={handleRegister}>

                        <input
                            placeholder="Username"
                            required
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <br /><br />

                        <input
                            type="password"
                            placeholder="Password"
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <br /><br />

                        <button>Register</button>

                    </form>
                </div>
            </div>
        </div>
    );
}
