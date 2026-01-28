import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const moveSound = new Audio("/sounds/move.mp3");
const winSound = new Audio("/sounds/win.mp3");

const API = "http://localhost:5000";

/* ---------- Tower Component ---------- */
function Tower({ disks, onClick, selected, isGoal }) {
    return (
        <div
            className={`tower ${selected ? "selected" : ""} ${isGoal ? "goal" : ""}`}
            onClick={onClick}
        >
            {isGoal && <div className="goal-label">GOAL</div>}

            <div className="base" />

            {disks.map((disk) => (
                <motion.div
                    key={disk}
                    className="disk"
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    data-size={disk}
                    style={{ width: `${30 + disk * 18}px` }}
                />
            ))}

            <div className="pole" />
        </div>
    );
}

/* ---------- Game Page ---------- */
export default function Game() {
    const [diskCount, setDiskCount] = useState(3);
    const [towers, setTowers] = useState([]);
    const [selectedTower, setSelectedTower] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [moves, setMoves] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const [hasWon, setHasWon] = useState(false);
    const [gameId, setGameId] = useState(null);
    const { width, height } = useWindowSize();
    const [timeLeft, setTimeLeft] = useState(300);
    const [canPlay, setCanPlay] = useState(false);
    const [tournament, setTournament] = useState(null);

    const token = localStorage.getItem("token");

    /* ---------- Init Towers ---------- */
    const generateTowers = (n) => [
        Array.from({ length: n }, (_, i) => n - i),
        [],
        []
    ];
    // Helper to format time
    function formatTime(seconds) {

        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        return (
            m.toString().padStart(2, "0") +
            ":" +
            s.toString().padStart(2, "0")
        );
    }
    /* ---------- Load Disk Count (Admin Controlled Later) ---------- */
    useEffect(() => {
        fetch(API + "/api/config")
            .then((r) => r.json())
            .then((d) => {
                initGame(d.disks);
            });
    }, []);

    function initGame(n) {
        setDiskCount(n);
        setTowers(generateTowers(n));
        setMoves(0);
        setHasStarted(false);
        setHasWon(false);
        setSelectedTower(null);
    }
    /* ---------- Load Tournament Info ---------- */
    useEffect(() => {

        async function loadTournament() {

            const res = await fetch(API + "/api/tournament");
            const data = await res.json();

            console.log("Tournament:", data);

            setTournament(data);
        }

        loadTournament();

    }, []);
    /* ---------- Tournament Status Logic ---------- */
    useEffect(() => {

        // No tournament → lock
        if (!tournament) {
            setCanPlay(false);
            return;
        }

        // Tournament ended → lock
        if (tournament.status === "ended") {
            setCanPlay(false);
            return;
        }

        // Tournament pending → countdown
        if (tournament.status === "pending") {

            if (!tournament.start_time) {
                setCanPlay(false);
                return;
            }

            const timer = setInterval(() => {

                const diff = Math.floor(
                    (new Date(tournament.start_time) - new Date()) / 1000
                );

                if (diff > 0) {
                    setCountdown(diff);
                    setCanPlay(false);
                } else {
                    setCountdown(0);
                    setCanPlay(true);
                    clearInterval(timer);
                }

            }, 1000);

            return () => clearInterval(timer);
        }

        // Tournament active → allow play
        if (tournament.status === "active") {
            setCanPlay(true);
        }

    }, [tournament]);


    /* ---------- Countdown to Start ---------- */
    useEffect(() => {
        if (!startTime) return;

        const timer = setInterval(() => {

            const diff =
                Math.floor((startTime - new Date(Date.now() + 10000)) / 1000);

            console.log("Countdown:", diff); // DEBUG

            if (diff <= 0) {
                setCountdown(0);
                clearInterval(timer);
            } else {
                setCountdown(diff);
            }

        }, 1000);

        return () => clearInterval(timer);

    }, [startTime]);

    /* ---------- Start Game ---------- */
    useEffect(() => {
        startGame();
    }, []);
    /* ---------- Countdown Logic ---------- */
    useEffect(() => {
        if (hasWon || countdown > 0) return;

        const timer = setInterval(() => {

            setTimeLeft((t) => {

                if (t <= 1) {
                    clearInterval(timer);
                    finishGame();
                    return 0;
                }

                return t - 1;
            });

        }, 1000);

        return () => clearInterval(timer);

    }, [hasWon, countdown]);

    async function startGame() {
        const res = await fetch(API + "/api/game/start", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const data = await res.json();
        setGameId(data.gameId);
    }

    /* ---------- Move Logic ---------- */
    const moveDisk = (from, to) => {
        setTowers((prev) => {
            if (from === to) return prev;

            const fromTower = prev[from];
            const toTower = prev[to];
            if (fromTower.length === 0) return prev;

            const disk = fromTower[fromTower.length - 1];
            const top = toTower[toTower.length - 1];
            if (top && top < disk) return prev;

            const copy = prev.map((t) => [...t]);
            copy[from].pop();
            copy[to].push(disk);

            return copy;
        });

        setMoves((m) => m + 1);
        moveSound.currentTime = 0;
        moveSound.play();
        setHasStarted(true);
    };

    /* ---------- Click ---------- */
    const handleTowerClick = (index) => {
        if (!canPlay) return;
        if (hasWon) return;

        if (selectedTower === null) {
            setSelectedTower(index);
        } else {
            moveDisk(selectedTower, index);
            setSelectedTower(null);
        }
    };

    /* ---------- Win Check ---------- */
    useEffect(() => {
        if (towers[2]?.length === diskCount && moves > 0) {
            finishGame();
        }
    }, [towers]);

    /* ---------- End Game ---------- */
    async function finishGame() {
        if (hasWon) return;

        setHasWon(true);
        winSound.play();

        // End normal game
        const res = await fetch(API + "/api/game/end", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                gameId,
                moves
            })
        });

        // Send tournament result (use backend values)
        await fetch(API + "/api/tournament/result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({
                score: data.score,
                time: data.timeTaken
            })
        });
    }

    return (
        <Layout>

            <div className="app">

                <h1>Tower of Hanoi</h1>
                {/* STARTING SOON */}
                {tournament && countdown > 0 && (
                    <h2 className="countdown">
                        Round starts in: {formatTime(countdown)}
                    </h2>
                )}

                {/* NO TOURNAMENT */}
                {!tournament && (
                    <h2>No active tournament</h2>
                )}
                {tournament?.status === "ended" && (
                    <h2 className="ended">Tournament Ended</h2>
                )}

                <>
                    {canPlay && (
                        <>
                            {countdown === 0 && (
                                <h3>
                                    Time Left: {Math.floor(timeLeft / 60)}:
                                    {(timeLeft % 60).toString().padStart(2, "0")}
                                </h3>
                            )}
                            <p className="stats">
                                Moves: <strong>{moves}</strong> | Minimum:{" "}
                                <strong>{Math.pow(2, diskCount) - 1}</strong>
                            </p>

                            {hasWon && (
                                <>
                                    {/* Confetti */}
                                    <Confetti
                                        width={width}
                                        height={height}
                                        numberOfPieces={250}
                                    />

                                    {/* Win Message */}
                                    <motion.h2
                                        className="win"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        🎉 You Won!{" "}
                                        <a href="/leaderboard">View Leaderboard</a>
                                    </motion.h2>
                                </>
                            )}
                            < div className="game-card">
                                <div className="game">
                                    {towers.map((tower, i) => (
                                        <Tower
                                            key={i}
                                            disks={tower}
                                            selected={selectedTower === i}
                                            isGoal={i === 2}
                                            onClick={() => handleTowerClick(i)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>

            </div>

        </Layout >
    );
}