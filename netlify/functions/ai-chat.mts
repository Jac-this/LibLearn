const MODEL = "gemini-3.7-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const buildSystemPrompt = ({
  courseTitle,
  moduleTitle,
  topicTitle,
  section,
  learningOutcomes,
}) => `You are LibLearn's Learning Assistant.

Your job is to help a student learn the lesson they are currently reading.

RULES:
- Use the supplied lesson context as your primary source.
- Explain ideas clearly in accessible high-school/university English.
- Do not simply give an answer when guiding the student to understand would be more useful.
- You may simplify, give examples, make connections, ask checking questions, or create a short practice question.
- If the student's question is not answered by the supplied lesson context, say that the lesson does not directly cover it, then give a concise general explanation if you can do so reliably.
- Never pretend that information is in the lesson when it is not.
- Do not overwhelm the student with unnecessary detail.
- Keep responses focused on the student's current learning goal.

COURSE: ${courseTitle || "Not specified"}
MODULE: ${moduleTitle || "Not specified"}
TOPIC: ${topicTitle || "Not specified"}
CURRENT SUBTOPIC: ${section?.heading || "Not specified"}

LEARNING OUTCOMES:
${Array.isArray(learningOutcomes) && learningOutcomes.length
    ? learningOutcomes.map((item, index) => `${index + 1}. ${typeof item === "string" ? item : item?.text || ""}`).join("\n")
    : "Not specified"}

CURRENT LESSON CONTENT:
${section?.text || "No lesson text was supplied."}
`;

const toGeminiContents = (messages) =>
  messages
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.content || "").slice(0, 4000) }],
    }));

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const body = await req.json();
    const {
      courseTitle = "",
      moduleTitle = "",
      topicTitle = "",
      section = null,
      learningOutcomes = [],
      messages = [],
    } = body || {};

    if (!Array.isArray(messages) || !messages.length) {
      return Response.json({ error: "A question is required." }, { status: 400 });
    }

    const apiKey = Netlify.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return Response.json(
        { error: "The LibLearn AI service is not enabled on this Netlify site yet." },
        { status: 503 },
      );
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: buildSystemPrompt({
              courseTitle,
              moduleTitle,
              topicTitle,
              section,
              learningOutcomes,
            }),
          }],
        },
        contents: toGeminiContents(messages),
        generationConfig: {
          maxOutputTokens: 700,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LibLearn Gemini provider error:", response.status, errorText);
      return Response.json(
        { error: "The AI assistant could not respond right now." },
        { status: 502 },
      );
    }

    const result = await response.json();
    const answer = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!answer) {
      return Response.json(
        { error: "The AI assistant returned an empty response." },
        { status: 502 },
      );
    }

    return Response.json({ response: answer });
  } catch (error) {
    console.error("LibLearn AI request failed:", error);
    return Response.json(
      { error: "Something went wrong while contacting the AI assistant." },
      { status: 500 },
    );
  }
};

export const config = {
  path: "/api/ai-chat",
};
