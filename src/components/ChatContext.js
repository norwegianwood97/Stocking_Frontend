// ChatContext.js
import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  return <ChatContext.Provider value={{ messages, setMessages }}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
