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
            style={{ position: "relative" }} // Ensure relative positioning for absolute child
        >
            {/* GOAL Label repositioned to top center above the tower box */}
            {isGoal && (
                <div
                    className="goal-label"
                    style={{
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontWeight: "bold",
                        color: "#facc15",
                        whiteSpace: "nowrap"
                    }}
                >
                    GOAL
                </div>
            )}

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
    const [hasPlayedThisRound, setHasPlayedThisRound] = useState(false);
    const token = localStorage.getItem("token");

    /* ---------- Init Towers ---------- */
    const generateTowers = (n) => [
        Array.from({ length: n }, (_, i) => n - i),
        [],
        []
    ];

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
    }

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

    useEffect(() => {
        async function loadTournament() {
            const res = await fetch(API + "/api/tournament");
            const data = await res.json();
            setTournament(data);
        }
        loadTournament();
    }, []);

    useEffect(() => {
        if (!tournament || tournament.status === "ended") {
            setCanPlay(false);
            return;
        }

        if (tournament.status === "pending") {
            const timer = setInterval(() => {
                const now = new Date();
                const start = new Date(tournament.start_time);
                const diff = Math.floor((start - now) / 1000);

                if (diff > 0) {
                    setCountdown(diff);
                    setCanPlay(false);
                } else {
                    setCountdown(0);
                    setCanPlay(true);
                    setTimeLeft(300);
                    clearInterval(timer);
                }
            }, 1000);
            return () => clearInterval(timer);
        }

        if (tournament.status === "active") {
            const totalDuration = 300;
            const now = new Date().getTime();
            const start = new Date(tournament.start_time).getTime();
            const secondsElapsed = Math.floor((now - start) / 1000);
            const remaining = totalDuration - secondsElapsed;

            if (remaining > 0) {
                setTimeLeft(remaining);
                setCanPlay(true);
            } else {
                setTimeLeft(0);
                setCanPlay(false);
                setHasPlayedThisRound(true);
            }
        }
    }, [tournament]);

    useEffect(() => {
        if (hasWon || !canPlay || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timer);
                    setCanPlay(false);
                    finishGame();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [hasWon, canPlay, timeLeft]);

    useEffect(() => {
        async function checkPlayStatus() {
            if (!tournament || !token) return;
            const res = await fetch(`${API}/api/tournament/my-status`, {
                headers: { Authorization: "Bearer " + token }
            });
            const data = await res.json();
            if (data.hasSubmitted) {
                setHasPlayedThisRound(true);
                setCanPlay(false);
            }
        }
        checkPlayStatus();
    }, [tournament, token]);

    // ELIGIBILITY CHECK RIGHT HERE:
    useEffect(() => {
        async function verifyEligibility() {
            // Everyone is allowed to play Round 1
            if (!tournament || tournament.current_round === 1) return;

            const res = await fetch(`${API}/api/tournament/check-eligibility`, {
                headers: { Authorization: "Bearer " + token }
            });

            // If the server returns 403 or isEligible is false, stop the player
            const data = await res.json();
            if (!data.isEligible) {
                setCanPlay(false);
                setHasPlayedThisRound(true); // Effectively locks the UI with your existing logic
                alert("You did not qualify for this round!");
            }
        }
        verifyEligibility();
    }, [tournament?.current_round, token]);

    async function startGame() {
        const res = await fetch(API + "/api/game/start", {
            method: "POST",
            headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setGameId(data.gameId);
    }

    useEffect(() => {
        if (token) startGame();
    }, []);

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

    const handleTowerClick = (index) => {
        if (!canPlay || hasWon) return;
        if (selectedTower === null) {
            setSelectedTower(index);
        } else {
            moveDisk(selectedTower, index);
            setSelectedTower(null);
        }
    };

    useEffect(() => {
        if (towers[2]?.length === diskCount && moves > 0) {
            finishGame();
        }
    }, [towers]);

    async function finishGame() {
        if (hasWon) return;
        setHasWon(true);
        setHasPlayedThisRound(true);
        setCanPlay(false);
        winSound.play();
        await fetch(API + "/api/game/end", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ gameId, moves })
        });
        const timeTaken = 300 - timeLeft;
        await fetch(API + "/api/tournament/result", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ score: moves, time: timeTaken })
        });
    }

    return (
        <Layout>
            <div className="app" style={{ textAlign: "center" }}> {/* Centers the text items */}
                <h1>Tower of Hanoi</h1>

                {/* 1. TOURNAMENT STATUS MESSAGES */}
                {!tournament && (
                    <h2>No active tournament</h2>
                )}

                {tournament?.status === "ended" && (
                    <h2 className="ended">Tournament Ended</h2>
                )}

                {/* 2. COUNTDOWN TO START */}
                {tournament && countdown > 0 && (
                    <h2 className="countdown">
                        Round starts in: {formatTime(countdown)}
                    </h2>
                )}

                {/* 3. POST-GAME STATES */}
                {timeLeft === 0 && !hasWon && !hasPlayedThisRound && (
                    <h2 style={{ color: "#ef4444" }}>Time's Up! Game Over.</h2>
                )}

                {hasWon && (
                    <>
                        <Confetti width={width} height={height} numberOfPieces={250} />
                        <motion.h2
                            className="win"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                        >
                            🎉 You Won! <a href="/leaderboard">View Leaderboard</a>
                        </motion.h2>
                    </>
                )}

                {/* 4. LOCK SCREEN */}
                {hasPlayedThisRound && !hasWon && (
                    <div className="center-card" style={{ margin: "0 auto" }}>
                        <h2 style={{ color: "#facc15" }}>Round Completed</h2>
                        <p>You have already submitted your score for this round.</p>
                        <p>
                            Please wait for <strong>Round {(tournament?.current_round || 0) + 1}</strong> to begin.
                        </p>
                        <a href="/leaderboard">
                            <button style={{ marginTop: "20px" }}>View Standings</button>
                        </a>
                    </div>
                )}

                {/* 5. ACTIVE GAMEPLAY INTERFACE */}
                {canPlay && !hasPlayedThisRound && (
                    <>
                        {countdown === 0 && (
                            <h3>Time Left: {formatTime(timeLeft)}</h3>
                        )}

                        <p className="stats">
                            Moves: <strong>{moves}</strong> | Minimum:{" "}
                            <strong>{Math.pow(2, diskCount) - 1}</strong>
                        </p>

                        <div className="game-card">
                            <div className="game" style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "50px" }}>
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
            </div>
        </Layout>
    );
}