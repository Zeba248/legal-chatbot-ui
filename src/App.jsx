// STEP 1: LEGAL CHATBOT UI (React + TailwindCSS)

import { useState } from "react";

export default function LegalChatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello Lawyer! How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    // Backend call placeholder
    const response = await fetch("https://your-backend-api.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();
    const botReply = { role: "bot", text: data.reply };
    setMessages((prev) => [...prev, botReply]);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow-xl rounded-xl p-6 h-[600px] overflow-y-auto border border-gray-200">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === "bot" ? "text-left" : "text-right"}`}>
            <div className={`inline-block px-4 py-2 rounded-xl ${msg.role === "bot" ? "bg-gray-100 text-black" : "bg-blue-600 text-white"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left text-sm text-gray-400">Typing...</div>
        )}
      </div>
      <div className="mt-4 flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-l-xl border-gray-300"
          placeholder="Ask your legal question..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-xl hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

