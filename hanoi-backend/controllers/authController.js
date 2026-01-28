const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check existing user
        db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, result) => {
                if (err) return res.status(500).json(err);

                if (result.length > 0) {
                    return res.status(400).json({
                        message: "User already exists"
                    });
                }

                // Hash password
                const hash = await bcrypt.hash(password, 10);

                // Insert
                db.query(
                    "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                    [username, email, hash],
                    (err) => {
                        if (err) return res.status(500).json(err);

                        res.status(201).json({
                            message: "User registered successfully ✅"
                        });
                    }
                );
            }
        );
    } catch (err) {
        res.status(500).json(err.message);
    }
};

// LOGIN
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
          return res.status(400).json({
            message: "Invalid credentials"
          });
        }

        const user = result[0];

        // 🚫 BAN CHECK
        if (user.is_banned) {
          return res.status(403).json({
            message: "Your account has been banned"
          });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!isMatch) {
          return res.status(400).json({
            message: "Invalid credentials"
          });
        }

        // Create token
        const token = jwt.sign(
          {
            id: user.id,
            role: user.role
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.json({
          message: "Login successful ✅",
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });

      }
    );
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// exports.register = (req, res) => {
//   const { username, email, password } = req.body;

//   if (!username || !email || !password) {
//     return res.status(400).json({
//       message: "All fields required"
//     });
//   }

//   db.query(
//     "SELECT id FROM users WHERE email=?",
//     [email],
//     (err, exist) => {
//       if (exist.length) {
//         return res.status(400).json({
//           message: "Email already exists"
//         });
//       }

//       bcrypt.hash(password, 10, (err, hash) => {
//         db.query(
//           `
//           INSERT INTO users (username, email, password, role)
//           VALUES (?, ?, ?, 'player')
//           `,
//           [username, email, hash],
//           (err) => {
//             if (err) return res.status(500).json(err);

//             res.json({ message: "Registered successfully" });
//           }
//         );
//       });
//     }
//   );
// };
