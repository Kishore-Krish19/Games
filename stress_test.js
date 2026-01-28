const { io } = require("socket.io-client");
const axios = require("axios");

const API_URL = "http://localhost:5000";
const PLAYER_COUNT = 50; 

async function simulatePlayers() {
    console.log(`🚀 Starting stress test with ${PLAYER_COUNT} players...`);

    for (let i = 1; i <= PLAYER_COUNT; i++) {
        const username = `stress_user_${i}`;
        const password = "password123";

        try {
            // 1. REGISTER THE PLAYER
            // We use a try/catch inside here so if the user already exists, it just continues to login
            try {
                await axios.post(`${API_URL}/api/auth/register`, {
                    username,
                    password
                });
                console.log(`📝 Registered: ${username}`);
            } catch (regErr) {
                // If 400, user likely already exists from a previous test run
                if (regErr.response && regErr.response.status !== 400) {
                    throw regErr;
                }
            }

            // 2. LOGIN THE PLAYER
            const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
                username,
                password
            });

            const { token } = loginRes.data;
            console.log(`🔑 Logged in: ${username}`);

            // 3. CONNECT VIA SOCKET.IO
            const socket = io(API_URL, {
                extraHeaders: { Authorization: `Bearer ${token}` },
                transports: ['websocket'] // Force websocket for speed
            });

            socket.on("connect", () => {
                console.log(`✅ ${username} Socket Connected`);
            });

            // 4. SIMULATE STARTING A GAME
            await axios.post(`${API_URL}/api/game/start`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`🎮 ${username} started a game`);

            // 5. WAIT A MOMENT (Prevents database connection saturation)
            await new Promise(r => setTimeout(r, 200));

        } catch (err) {
            console.error(`❌ Error with ${username}:`, err.response ? err.response.data : err.message);
        }
    }
    console.log("🏁 Stress test sequence complete.");
}

simulatePlayers();