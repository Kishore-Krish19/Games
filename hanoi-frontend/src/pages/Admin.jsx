import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Admin() {
    const [disks, setDisks] = useState(3);
    const [players, setPlayers] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [tournament, setTournament] = useState(null);
    const [tName, setTName] = useState("");

    const token = localStorage.getItem("token");
    const nav = useNavigate();

    // Load config
    useEffect(() => {
        fetch(API + "/api/config")
            .then((r) => r.json())
            .then((d) => setDisks(d.disks));

        loadPlayers();
        loadTournament();
    }, []);
    // Load Players
    async function loadPlayers() {
        const res = await fetch(API + "/api/admin/players", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        setPlayers(data);
    }
    // Save config
    async function save() {
        const res = await fetch(API + "/api/config", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ disks })
        });

        const data = await res.json();
        alert(data.message);
    }
    // Load Tournament Info
    async function loadTournament() {
        const res = await fetch(API + "/api/tournament");
        const data = await res.json();
        setTournament(data);
    }
    // Start Tournament
    async function startTournament() {

        if (!tName || !startTime) {
            alert("Enter name and start time");
            return;
        }

        const res = await fetch(API + "/api/tournament/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                name: tName,
                start_time: startTime
            })
        });

        const data = await res.json();

        alert(data.message || "Tournament scheduled");

        loadTournament(); // refresh UI
    }
    // End Tournament
    async function endTournament() {

        if (!window.confirm("End tournament?")) return;

        const res = await fetch(API + "/api/tournament/end", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        alert(data.message || "Tournament ended");

        loadTournament(); // refresh UI
    }

    // Next Round
    async function nextRound() {
        await fetch(API + "/api/tournament/next", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        loadTournament();
    }
    // Qualify Players
    async function qualify() {
        const res = await fetch(API + "/api/tournament/qualify", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        alert("Qualified: " + data.qualified.length + " players");
    }
    // Remove Player
    async function removePlayer(id) {
        if (!window.confirm("Remove this player?")) return;

        const res = await fetch(API + "/api/admin/player/" + id, {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();

        alert(data.message);

        loadPlayers();
    }
    //  Ban Player
    async function banPlayer(id) {
        if (!confirm("Ban this player?")) return;

        const res = await fetch(API + "/api/admin/ban/" + id, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        alert(data.message);

        loadPlayers();
    }
    // Unban Player
    async function unbanPlayer(id) {
        if (!confirm("Unban this player?")) return;

        const res = await fetch(API + "/api/admin/unban/" + id, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        alert(data.message);

        loadPlayers();
    }
   
    return (
        <Layout>
            <div className="app">

                <h2>Admin Panel</h2>

                {/* CONFIG */}
                <h3>Game Settings</h3>

                <select
                    value={disks}
                    onChange={(e) => setDisks(Number(e.target.value))}
                >
                    {[3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>

                <button onClick={save}>Save</button>

                <hr />
                {/* TOURNAMENT */}
                <h3>Tournament Control</h3>

                {!tournament ? (
                    <>
                        {/* Tournament Name */}
                        <input
                            placeholder="Tournament Name"
                            value={tName}
                            onChange={(e) => setTName(e.target.value)}
                        />

                        <br /><br />

                        {/* Start Time */}
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />

                        <br /><br />

                        <button onClick={startTournament}>
                            Start Tournament
                        </button>
                    </>
                ) : (
                    <>
                        <p>
                            <b>{tournament.name}</b> | Round {tournament.current_round}
                        </p>

                        <button onClick={nextRound}>
                            Next Round
                        </button>
                        <button onClick={qualify}>
                            Qualify Players
                        </button>

                        <button onClick={endTournament}>
                            End Tournament
                        </button>
                    </>
                )}
                <hr />
                {/* PLAYERS */}
                <h3>Players</h3>

                <button onClick={loadPlayers}>
                    Refresh
                </button>

                <table border="1" cellPadding="8" style={{ margin: "auto" }}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Games</th>
                            <th>Best Score</th>
                            <th>Status</th>
                            <th>Control</th>
                            <th>Action</th>

                        </tr>
                    </thead>

                    <tbody>
                        {players.map((p) => (
                            <tr key={p.id}>
                                <td>{p.username}</td>
                                <td>{p.email}</td>
                                <td>{p.games}</td>
                                <td>{p.bestScore || "-"}</td>
                                <td>
                                    {p.is_banned ? "Banned" : "Active"}
                                </td>

                                <td>
                                    {p.is_banned ? (
                                        <button
                                            style={{ background: "#22c55e" }}
                                            onClick={() => unbanPlayer(p.id)}
                                        >
                                            Unban
                                        </button>
                                    ) : (
                                        <button
                                            style={{ background: "#ef4444" }}
                                            onClick={() => banPlayer(p.id)}
                                        >
                                            Ban
                                        </button>
                                    )}
                                </td>

                                <td>
                                    <button
                                        style={{ background: "#ef4444" }}
                                        onClick={() => removePlayer(p.id)}
                                    >
                                        Delete
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>

                <br />

            </div>
        </Layout>
    );
}
