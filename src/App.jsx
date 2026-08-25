import "./App.css";
import Courses from "./Courses";

function App() {
  const path = window.location.pathname;

  if (path === "/courses") {
    return <Courses />;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>LibLearn</h1>

      <p>Welcome to LibLearn — a learning platform for Liberian students.</p>

      <a href="/courses">
        Go to Courses →
      </a>
    </div>
  );
}

export default App;