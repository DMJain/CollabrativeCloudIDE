import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function MessageApp ({socket}) {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const joinRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {


    return () => {

    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-[1fr_250px] gap-4">
        <div className="p-4">
          <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex-1 pr-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-4 ${msg.system ? 'text-center text-gray-500 text-sm' : ''}`}
                >
                  {!msg.system && (
                    <div className={`flex items-start gap-2 ${msg.id === socket.id ? 'flex-row-reverse' : ''}`}>
                      <div className={`max-w-[70%] ${msg.id === socket.id ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
                        <div className="font-medium text-sm mb-1">{msg.username}</div>
                        <div>{msg.text}</div>
                      </div>
                    </div>
                  )}
                  {msg.system && <div>{msg.text}</div>}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-4">Online Users ({users.length})</h3>
          <div className="h-[calc(100vh-10rem)]">
            {users.map((user, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <span>{user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessageApp;

MessageApp.propTypes = {
  socket: PropTypes.object,
};

