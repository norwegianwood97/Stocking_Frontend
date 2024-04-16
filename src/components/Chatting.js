import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatContext';
import './Chatting.css';

const Chat = () => {
  const { messages, setMessages } = useChat();
  const [input, setInput] = useState('');
  const [chatHeight, setChatHeight] = useState('300px'); // 기본 채팅창 높이 설정
  const ws = useRef(null);
  const chatContainerRef = useRef(null);
  const resizingRef = useRef(false);

  useEffect(() => {
    ws.current = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/ws/chatting`);

    ws.current.onopen = () => console.log('Connected to the WS server');
    ws.current.onclose = () => console.log('Disconnected from the WS server');
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === 'notices') {
        const noticesArray = Array.isArray(message.notices) ? message.notices : [message.notices];
        const newMessages = noticesArray.map((notice) => ({
          text: notice,
          isMine: false,
          timestamp: new Date().toLocaleTimeString(),
        }));
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { ...message, isMine: false, timestamp: new Date().toLocaleTimeString() }]);
      }
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const messageToSend = { text: input, isMine: true, timestamp: new Date().toLocaleTimeString() };
      ws.current.send(JSON.stringify(messageToSend));
      setMessages((prevMessages) => [...prevMessages, messageToSend]);
      setInput('');
    }
  };

  // 드래그 시작 핸들러
  const startResizing = (e) => {
    e.preventDefault();
    resizingRef.current = true;
    document.addEventListener('mousemove', resizeChat);
    document.addEventListener('mouseup', stopResizing);
  };

  // 채팅창 크기 조절 핸들러
  const resizeChat = (e) => {
    if (resizingRef.current) {
      const newHeight = window.innerHeight - e.clientY;
      setChatHeight(`${newHeight}px`);
    }
  };

  // 드래그 종료 핸들러
  const stopResizing = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', resizeChat);
    document.removeEventListener('mouseup', stopResizing);
  };

  return (
    <div className="chat-container" ref={chatContainerRef} style={{ height: chatHeight }}>
      <div className="resize-handle" onMouseDown={startResizing}></div>
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
          {(!message.isMine ? `${message.nickname || '서버 메세지'}: ` : '') + message.text}
          <span className="message-timestamp">{message.timestamp}</span>
        </li>
      ))}
      <div ref={endOfMessagesRef} />
    </ul>
  );
};

const MessageInput = ({ input, setInput, sendMessage }) => (
  <div className="input-container">
    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
    <button className="newButton" onClick={sendMessage}>Send</button>
  </div>
);

export default Chat;
