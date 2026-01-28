import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Bracket() {
    const [data, setData] = useState([]);

    useEffect(() => {
        load();
    }, []);

    // load function
    async function load() {
        try {
            const res = await fetch(API + "/api/tournament/bracket");
            if (res.ok) {
                const json = await res.json();
                // Final safety check to ensure we received an array
                setData(Array.isArray(json) ? json : []);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setData([]);
        }
    }

    // Replace your existing data.forEach block with this:
    const rounds = {};

    // Add the Array.isArray check to prevent the crash
    if (Array.isArray(data)) {
        data.forEach((p) => {
            if (!rounds[p.round]) rounds[p.round] = [];
            rounds[p.round].push(p);
        });
    }
    return (
        <Layout>
            <div className="bracket-page-container">
                <div className="app">
                    <h2>Tournament Bracket</h2>

                    {Object.keys(rounds).length === 0 && (
                        <p>No qualifiers yet</p>
                    )}

                    {Object.keys(rounds).map((r) => (
                        <div key={r} className="round-section">
                            <h3>Round {r}</h3>

                            <table className="bracket-table">
                                <thead>
                                    <tr>
                                        <th>Player Name</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rounds[r].map((p, i) => (
                                        <tr key={i}>
                                            <td>{p.username}</td>
                                            <td>
                                                {r === "3" ? "🏆 Winner" : "Qualified"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
