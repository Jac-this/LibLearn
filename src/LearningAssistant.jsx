import { useMemo, useState } from "react";
import "./LearningAssistant.css";

function LearningAssistant({
  courseTitle = "",
  moduleTitle = "",
  topicTitle = "",
  section = null,
  learningOutcomes = [],
}) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestions = useMemo(() => {
    const heading = section?.heading || topicTitle || "this lesson";
    return [
      `Can you explain ${heading} more simply?`,
      `Why is ${heading} important?`,
      "Give me an example.",
      "Test me on what I just learned.",
    ];
  }, [section?.heading, topicTitle]);

  const sendQuestion = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setQuestion("");
    setExpanded(true);
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle,
          moduleTitle,
          topicTitle,
          section: section
            ? { heading: section.heading || "", text: section.text || "" }
            : null,
          learningOutcomes,
          messages: nextMessages,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "The AI assistant could not respond.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.response },
      ]);
    } catch (requestError) {
      setError(requestError.message || "The AI assistant could not respond.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = (event) => {
    event.preventDefault();
    sendQuestion(question);
  };

  const askSuggestion = (suggestion) => {
    setQuestion(suggestion);
    setExpanded(true);
  };

  return (
    <section className={`liblearn-ai-assistant${expanded ? " expanded" : ""}`} aria-label="AI Learning Assistant">
      <div className="liblearn-ai-heading">
        <div className="liblearn-ai-title">
          <span className="liblearn-ai-mark" aria-hidden="true">✦</span>
          <div>
            <span>LEARNING ASSISTANT</span>
            <strong>Learn with LibLearn AI</strong>
          </div>
        </div>
        <span className="liblearn-ai-context">{topicTitle || moduleTitle || courseTitle}</span>
      </div>

      {expanded && (
        <div className="liblearn-ai-conversation" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`liblearn-ai-message ${message.role}`} key={`${message.role}-${index}`}>
              <span>{message.role === "user" ? "You" : "AI"}</span>
              <p>{message.content}</p>
            </div>
          ))}
          {loading && (
            <div className="liblearn-ai-placeholder">
              <span>AI</span>
              <p>Thinking about this lesson...</p>
            </div>
          )}
          {error && (
            <div className="liblearn-ai-error" role="alert">
              {error}
            </div>
          )}
        </div>
      )}

      {!expanded && (
        <div className="liblearn-ai-suggestions">
          <div>
            <span>YOU MIGHT ASK</span>
            <p>Ask a question, request an explanation, or test your understanding.</p>
          </div>
          <div className="liblearn-ai-suggestion-list">
            {suggestions.map((suggestion) => (
              <button type="button" key={suggestion} onClick={() => askSuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {expanded && (
        <div className="liblearn-ai-followups">
          {suggestions.slice(0, 2).map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => askSuggestion(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form className="liblearn-ai-input" onSubmit={submitQuestion}>
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about this lesson..."
          aria-label="Ask the Learning Assistant"
          disabled={loading}
        />
        <button type="submit" aria-label="Send question" disabled={!question.trim() || loading}>
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className="liblearn-ai-disclaimer">
        The assistant uses the current lesson as its learning context.
      </p>
    </section>
  );
}

export default LearningAssistant;
