// app/dashboard/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost/message-system-api/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [messageData, setMessageData] = useState({
    subject: "",
    message: ""
  });
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === 'admin') {
      router.push('/admin');
      return;
    }

    setUser(parsedUser);
    fetchUserMessages(parsedUser.id);
  }, [router]);

  const fetchUserMessages = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages.php?user_id=${userId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setSubmitMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/messages.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subject: messageData.subject,
          message: messageData.message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage("Message sent successfully!");
        setMessageData({ subject: "", message: "" });
        fetchUserMessages(user.id); // Refresh messages
      } else {
        setSubmitMessage(data.message || "Failed to send message");
      }
    } catch (error) {
      setSubmitMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setMessageData({
      ...messageData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Send Message Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Send Message to Admin</h2>
            
            {submitMessage && (
              <div className={`mb-4 p-3 rounded-md ${
                submitMessage.includes('successfully') 
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {submitMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={messageData.subject}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter message subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={messageData.message}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* User's Messages History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Your Messages</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userMessages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages sent yet</p>
              ) : (
                userMessages.map((msg) => (
                  <div key={msg.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">{msg.subject}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        msg.status === 'read' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{msg.message}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}