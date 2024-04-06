import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatContext';
import './Chatting.css';

const Chat = () => {
  const { messages, setMessages } = useChat();
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`wss://api.stockingchallenge/ws/chatting`);

    ws.current.onopen = () => console.log('Connected to the WS server');
    ws.current.onclose = () => console.log('Disconnected from the WS server');
    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);

      // message.type이 'notices'인 경우 처리
      if (message.type === 'notices') {
        // message.notices가 배열인지 확인, 배열이 아니면 배열로 변환
        const noticesArray = Array.isArray(message.notices) ? message.notices : [message.notices];

        // 배열을 사용하여 메시지 처리
        const newMessages = noticesArray.map((notice) => ({
          text: notice,
          isMine: false, // 이 메시지는 사용자 자신의 것이 아니라는 것을 나타냅니다.
          timestamp: new Date().toLocaleTimeString(), // 메시지에 현재 시간 추가
        }));

        // 새 메시지 배열을 기존 메시지 목록에 추가
        setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      } else {
        // message.type이 'notices'가 아닌 다른 메시지 처리
        setMessages((prevMessages) => [...prevMessages, { ...message, isMine: false, timestamp: new Date().toLocaleTimeString() }]);
      }
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
    <button onClick={sendMessage}>Send</button>
  </div>
);

export default Chat;
