import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch and display results
  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/votes");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setVotes(data);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Error loading results.");
    } finally {
      setLoading(false);
    }
  };

  // Function to cast a vote
  const castVote = async (option: string) => {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ option: option }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        alert(data.message); // TODO: Replace with a more user-friendly notification
        fetchResults(); // Refresh results after voting
      } else {
        console.error("Error casting vote:", data.error);
        alert("Error: " + (data.error || "Unknown error."));
      }
    } catch (err) {
      console.error("Network error casting vote:", err);
      alert("A network error occurred while casting your vote.");
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className="container">
      <h1>Who's gonna come out on top?</h1>

      <div className="vote-options">
        <button className="elon-button" onClick={() => castVote("Elon")}>
          Elon
        </button>
        <button className="donald-button" onClick={() => castVote("Donald")}>
          Donald
        </button>
      </div>

      <h2>Current Results:</h2>
      <div id="results" className="results">
        {loading && <p>Loading results...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && votes.length === 0 && <p>No votes cast yet.</p>}
        {!loading &&
          !error &&
          votes.length > 0 &&
          votes.map((item: { option_name: string; count: number }) => (
            <div key={item.option_name} className="result-item">
              <span>{item.option_name}:</span> <span>{item.count} votes</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
