import { useState } from 'react';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch("https://legal-bot-backend.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();
      setResponse(data.response || "⚠️ Unexpected response format.");
    } catch (err) {
      console.error("Error:", err);
      setResponse("❌ Backend not responding. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Legal Chatbot</h1>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Ask your legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="px-4 py-2 border rounded-md w-80"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>

      {response && (
        <div className="bg-white p-4 rounded-md shadow-md w-full max-w-xl">
          <strong>Bot:</strong>
          <p className="mt-2 whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
