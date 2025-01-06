import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

function MessageApp ({socket}) {
  const user = useSelector((state) => state.user);
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const joinRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [showMessages, setShowMessages] = useState(true);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(!joinRef.current) {
      socket.emit('message:userJoin', user.userName)
      joinRef.current = true
    }
  }, [])

  useEffect(() => {
    socket.on('message:userSpawn', ({username}) => {
      setMessages((prev) => [...prev, { system: true, text: `${username} joined the chat` }])
    });

    socket.on('message:userList', (userList) => {
      setUsers(userList);
    })

    socket.on('message:recieve', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on('message:userDespawn', ({username}) => {
      setMessages((prev) => [...prev, { system: true, text: `${username} left the chat` }])
    })

    return () => {
      socket.off('message:userSpawn');
      socket.off('message:userList');
      socket.off('message:recieve');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    if(message) {
      socket.emit('message:send', message)
      setMessage('')
    }
  }

  console.log('messages socket', socket.id)
  console.log('messages', messages) 

  return (
    <div className="w-full h-full">
      <div className='flex flex-col gap-1 h-full'>
        <div className='border-b flex justify-between p-1'>
          <div></div>
          <div>Chats</div>
          <div>
            <button className='btn btn-xs btn-primary shadow-sm shadow-base-300' onClick={() => setShowMessages(!showMessages)}>{showMessages ? `Users : ${users.length}` : 'Show Chats'}</button>
          </div>
        </div>
        {showMessages ? (
          <div className="showmessageContainer flex-grow overflow-auto"> 
            {messages.map((msg, index) => (
              <div
                    key={index}
                    className={`${msg.system ? 'text-center text-gray-500 text-sm' : ''}`}
              >
                {msg.system ? 
                  (<div>{msg.text}</div>) 
                  : 
                  (<div>
                    <div className={`chat ${msg.id == socket.id ? 'chat-end chat-accent' : 'chat-start'}`}>
                      <div className="chat-header text-xs opacity-50">
                        {msg.username}
                      </div>
                      <div className={`chat-bubble ${msg.id == socket.id ? 'chat-bubble-accent' : 'chat-bubble-primary'}`}>{msg.text}</div>
                    </div>
                  </div>)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>) : (
          <div className='flex flex-col gap-2'>
            <div className='text-lg text-center'> Joined Users {users.length}</div>
            <div className='flex flex-col gap-1 overflow-auto items-center justify-center'> 
            {users.map((user, index) => (
              <div key={index} className="p-1 border border-base-200 rounded-sm">
                <span>{user}</span>
              </div>
            ))}
            </div>

          </div>)}
        
          {showMessages && <div className='sentMessageContainer border-t p-2'>
            <form onSubmit={handleSubmit} className="flex justify-between gap-2">
              <input
              type="text"
              className='flex-grow input input-bordered w-full input-sm'
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)} />
              <button type="submit">
                Send
              </button>
            </form>
          </div>}
      </div>
    </div>      
  )
}

export default MessageApp;

MessageApp.propTypes = {
  socket: PropTypes.object,
};

