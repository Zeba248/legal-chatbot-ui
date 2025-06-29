import { useState, useEffect, useRef } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMsg.content }),
      });

      const data = await res.json();
      const botMsg = { role: "bot", content: data.response || "⚠️ Unexpected response." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "❌ Backend not responding. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-700 text-white p-4 text-xl font-bold text-center">
        ⚖️ ATOZ Legal Chatbot
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-xl px-4 py-2 max-w-xs whitespace-pre-wrap shadow-md text-sm ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-900 border"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border rounded-xl px-4 py-2 text-sm text-gray-500 animate-pulse">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t bg-white">
        <div className="max-w-2xl mx-auto flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask your legal question..."
            className="flex-1 px-4 py-2 border rounded-xl"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
