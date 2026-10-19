import { useEffect, useState } from "react";

type Repo = { id: number; full_name: string; description: string | null; stargazers_count: number; html_url: string; language: string | null };

const box: React.CSSProperties = { border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10 };

export default function App() {
  const [query, setQuery] = useState("react");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Repo[]>(() => JSON.parse(localStorage.getItem("saved") || "[]"));

  useEffect(() => { localStorage.setItem("saved", JSON.stringify(saved)); }, [saved]);

  // Third-party REST API integration (GitHub public API)
  const search = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=10`);
      if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
      setRepos((await res.json()).items);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { search(); }, []);

  const isSaved = (r: Repo) => saved.some((s) => s.id === r.id);
  const toggle = (r: Repo) => setSaved(isSaved(r) ? saved.filter((s) => s.id !== r.id) : [...saved, r]);

  const Item = ({ r }: { r: Repo }) => (
    <div style={box}>
      <a href={r.html_url} target="_blank" rel="noreferrer"><strong>{r.full_name}</strong></a>
      <p>{r.description ?? "No description"}</p>
      <small>⭐ {r.stargazers_count.toLocaleString()} · {r.language ?? "n/a"}</small>{" "}
      <button onClick={() => toggle(r)}>{isSaved(r) ? "Remove" : "Save"}</button>
    </div>
  );

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui", padding: "0 1rem" }}>
      <h1>Repo Explorer</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={{ flex: 1, padding: 8 }} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Search GitHub repos, e.g. typescript" />
        <button onClick={search}>Search</button>
      </div>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {repos.map((r) => <Item key={r.id} r={r} />)}
      <h2>Saved ({saved.length})</h2>
      {saved.length === 0 && <p>Nothing saved yet.</p>}
      {saved.map((r) => <Item key={r.id} r={r} />)}
    </main>
  );
}
