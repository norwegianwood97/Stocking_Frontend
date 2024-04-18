import React, { useState, useEffect, useRef } from 'react';
import { useChat } from './ChatContext';
import './Chatting.css';
import axios from '../api/axios.js';

const Chat = () => {
  const { messages, setMessages } = useChat();
  const [input, setInput] = useState('');
  const [chatHeight, setChatHeight] = useState('300px'); // 기본 채팅창 높이 설정
  const ws = useRef(null);
  const chatContainerRef = useRef(null);
  const resizingRef = useRef(false);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // 사용자 정보를 불러옵니다.
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/userGet');
        const fetchedUserInfo = response.data.data[0];
        setUserInfo(fetchedUserInfo); // 사용자 정보 상태 업데이트
        console.log('fetchedUserInfo: ', fetchedUserInfo);
      } catch (error) {
        console.error('Fetching user data failed:', error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.userId) {
      // userInfo가 있고, userId도 있을 때만 실행
      console.log('userId: ', userInfo.userId);
      // WebSocket 연결
      ws.current = new WebSocket(`${process.env.REACT_APP_WEBSOCKET_URL}/ws/chatting/${userInfo.userId}`);
      ws.current.onopen = () => console.log('Connected to the WS server');
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
      ws.current.onclose = () => console.log('Disconnected from the WS server');
    } else {
      console.log('userInfo.userId가 없음! userInfo: ', userInfo);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userInfo]); // userInfo 자체에 의존성 추가

  const sendMessage = () => {
    if (input.trim()) {
      const messageToSend = { text: input, isMine: true, timestamp: new Date().toLocaleTimeString() }; // 메시지 보낼 때 현재 시간 추가
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
