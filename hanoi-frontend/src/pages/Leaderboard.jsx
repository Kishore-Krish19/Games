import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Layout from "../components/Layout";
import { motion } from "framer-motion";

const API = "http://localhost:5000";

const socket = io(API);

export default function Leaderboard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);

        const res = await fetch(API + "/api/leaderboard");
        const json = await res.json();

        setData(json);
        setLoading(false);
    }


    useEffect(() => {
        load();

        socket.on("scoreUpdate", () => {
            load();
        });

        return () => {
            socket.off("scoreUpdate");
        };
    }, []);

    return (
        <Layout>
            <div className="bracket-page-container"> 
                <div className="app">
                    <h2>Live Leaderboard</h2>

                    <table className="bracket-table"> 
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Score</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="4">
                                            <div className="skeleton" style={{ height: "20px", margin: "10px 0" }}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // Real data
                                data.map((u, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <td>{i + 1}</td>
                                        <td>{u.username}</td>
                                        <td>{u.best_score}</td>
                                        <td>{u.best_time}</td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
