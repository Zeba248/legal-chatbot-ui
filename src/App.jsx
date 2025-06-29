import React, { useState } from "react";

async function askLegalQuestion(question) {
  const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

  const data = await res.json();
  return data.response;
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    const reply = await askLegalQuestion(question);
    setResponse(reply);
  };

  return (
    <div>
      <h2>Legal Chatbot</h2>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your legal question..."
      />
      <button onClick={handleSend}>Send</button>
      <div>
        <strong>Bot:</strong> {response}
      </div>
    </div>
  );
}
