import "./App.css";
import Courses from "./Courses";
import Course from "./Course";

function App() {
  const path = window.location.pathname;

  if (path === "/courses") {
    return <Courses />;
  }

  if (path === "/course") {
    return <Course />;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Liberian Learning</h1>

      <p>Welcome to Liberian Learning.</p>

      <a href="/courses">
        Go to Courses →
      </a>
    </div>
  );
}

export default App;