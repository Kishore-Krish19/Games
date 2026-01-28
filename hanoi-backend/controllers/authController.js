const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [existing] = await db.query("SELECT id FROM users WHERE username = ?", [username]);

        if (existing.length > 0) return res.status(400).json({ message: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hash]);

        res.status(201).json({ message: "User registered successfully ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [result] = await db.query("SELECT * FROM users WHERE username = ?", [username]);

        if (result.length === 0) return res.status(400).json({ message: "Invalid credentials" });

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};