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
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!question.trim()) return;

    const newMessages = [...messages, { sender: "user", text: question }];
    setMessages(newMessages);
    setQuestion("");

    const reply = await askLegalQuestion(question);
    setMessages([...newMessages, { sender: "bot", text: reply }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-xl font-bold mb-4 text-center">🧠 Indian Legal Bot</h1>
        
        <div className="h-96 overflow-y-auto border p-4 rounded mb-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-200" : "bg-green-100"}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-grow border rounded px-3 py-2"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your legal question..."
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
