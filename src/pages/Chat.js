import React, { useState, useEffect, useRef } from 'react';
import './Chat.css'; // 수정될 CSS 파일

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`wss://api.stockingchallenge:3000/ws/chatting`);

    ws.current.onopen = () => console.log('Connected to the WS server');
    ws.current.onclose = () => console.log('Disconnected from the WS server');
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      // 서버로부터 받은 메시지에 현재 시간 추가
      setMessages((prevMessages) => [...prevMessages, { ...message, isMine: false, timestamp: new Date().toLocaleTimeString() }]);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const messageToSend = { text: input, isMine: true, timestamp: new Date().toLocaleTimeString() }; // 메시지 보낼 때 현재 시간 추가
      ws.current.send(JSON.stringify(messageToSend));
      setMessages((prevMessages) => [...prevMessages, messageToSend]);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <MessageInput input={input} setInput={setInput} sendMessage={sendMessage} />
    </div>
  );
};

const MessageList = ({ messages }) => {
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ul className="message-list">
      {messages.map((message, index) => (
        <li key={index} className={message.isMine ? 'my-message' : 'other-message'}>
          {(!message.isMine ? `${message.nickname}: ` : '') + message.text}
          <span className="message-timestamp">{message.timestamp}</span> {/* 메시지 시간 표시 */}
        </li>
      ))}
      <div ref={endOfMessagesRef} />
    </ul>
  );
};

const MessageInput = ({ input, setInput, sendMessage }) => (
  <div className="input-container">
    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
    <button onClick={sendMessage}>Send</button>
  </div>
);

export default Chat;
