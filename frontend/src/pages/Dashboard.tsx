import { useEffect, useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Scheduled {
  id: string;
  next: string;
}

export default function Dashboard() {
  const [team, setTeam] = useState<{ teamId: string; teamName: string } | null>(
    null
  );
  const [jobs, setJobs] = useState<Scheduled[]>([]);
  const [channel, setChannel] = useState("");
  const [text, setText] = useState("");
  const [when, setWhen] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: "include" }).then(async (r) => {
      if (r.ok) setTeam(await r.json());
    });
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    fetch(`${API_BASE}/messages/schedule`, { credentials: "include" })
      .then((r) => r.json())
      .then(setJobs);
  };

  const sendNow = async () => {
    await fetch(`${API_BASE}/messages/send`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, text }),
    });
    alert("Sent!");
  };
  const schedule = async () => {
    const epoch = Math.floor(new Date(when).getTime() / 1000);
    await fetch(`${API_BASE}/messages/schedule`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, text, postAt: epoch }),
    });
    fetchJobs();
  };
  const cancel = async (id: string) => {
    await fetch(`${API_BASE}/messages/schedule/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchJobs();
  };

  if (!team) return <p className="center">Not connected.</p>;

  return (
    <div className="center">
      <h2>{team.teamName}</h2>
      <div>
        <input
          placeholder="Channel ID"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
      </div>
      <div>
        <textarea
          placeholder="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          cols={40}
        />
      </div>
      <button onClick={sendNow}>Send Now</button>
      <hr />
      <div>
        <input
          type="datetime-local"
          value={when}
          onChange={(e) => setWhen(e.target.value)}
        />
        <button onClick={schedule}>Schedule</button>
      </div>
      <h3>Scheduled</h3>
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>
            {j.id} – next: {String(j.next)}{" "}
            <button onClick={() => cancel(j.id)}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
