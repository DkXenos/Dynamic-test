// app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost/message-system-api/api";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchMessages();
  }, [router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages.php?admin=true`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMessages(data);
        
        // Calculate stats
        const total = data.length;
        const unread = data.filter(msg => msg.status === 'unread').length;
        const read = data.filter(msg => msg.status === 'read').length;
        
        setStats({ total, unread, read });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId })
      });

      const data = await response.json();
      if (data.success) {
        fetchMessages(); // Refresh messages
        if (selectedMessage && selectedMessage.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: 'read' });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage user messages</p>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4-4-4m0 0L7 9l4-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Messages</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Unread</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.unread}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-800">Read</h3>
                <p className="text-2xl font-bold text-green-600">{stats.read}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Messages List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No messages found</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 truncate">
                            {message.subject}
                          </h3>
                          <p className="text-sm text-gray-600">
                            From: {message.username} ({message.email})
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              message.status === 'unread' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {message.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div> {/* Close flex justify-between items-start mb-2 */}
                    </div> /* Close message item div */
                  ))}
                </div> /* Close divide-y divide-gray-200 */
              )}
            </div> {/* Close max-h-96 overflow-y-auto */}
          </div> {/* Close Messages List bg-white rounded-lg shadow-md */}

          {/* Selected Message Details */}
          <div className="bg-white rounded-lg shadow-md">
            {selectedMessage ? (
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 truncate" title={selectedMessage.subject}>{selectedMessage.subject}</h2>
                  {selectedMessage.status === 'unread' && (
                    <button
                      onClick={() => markAsRead(selectedMessage.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600"><strong>From:</strong> {selectedMessage.username} ({selectedMessage.email})</p>
                  <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(selectedMessage.created_at)}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> 
                    <span className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedMessage.status === 'unread' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedMessage.status}
                    </span>
                  </p>
                </div>
                <div className="flex-grow overflow-y-auto prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-center h-full">
                <p className="text-gray-500">Select a message to view details.</p>
              </div>
            )}
          </div> {/* Close Selected Message Details bg-white rounded-lg shadow-md */}
        </div> {/* Close grid grid-cols-1 lg:grid-cols-2 gap-8 */}
      </div> {/* Close max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 */}
    </div> /* Close min-h-screen bg-gray-50 */
  );
}