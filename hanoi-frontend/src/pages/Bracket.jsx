import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const API = "http://localhost:5000";

export default function Bracket() {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(API + "/api/tournament/bracket");
    const json = await res.json();
    setData(json);
  }

  // Group by round
  const rounds = {};

  data.forEach((p) => {
    if (!rounds[p.round]) rounds[p.round] = [];
    rounds[p.round].push(p);
  });

  return (
    <Layout>

      <div className="app">

        <h2>Tournament Bracket</h2>

        {Object.keys(rounds).length === 0 && (
          <p>No qualifiers yet</p>
        )}

        {Object.keys(rounds).map((r) => (
          <div key={r} className="round">

            <h3>Round {r}</h3>

            <ul>
              {rounds[r].map((p, i) => (
                <li key={i}>
                  {p.username}
                  {r === "3" && " 🏆"}
                </li>
              ))}
            </ul>

          </div>
        ))}

      </div>

    </Layout>
  );
}
