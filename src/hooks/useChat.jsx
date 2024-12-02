import { createContext, useContext, useEffect, useState } from "react";

// const backendUrl = "https://tech-e-modal-backend.vercel.app";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [currentMouthShape, setCurrentMouthShape] = useState("X");

  const animateLipSync = (mouthCues) => {
    mouthCues.forEach((cue, index) => {
      const duration = (cue.end - cue.start) * 1000;

      setTimeout(() => {
        setCurrentMouthShape(cue.value);
      }, cue.start * 1000);

      if (index === mouthCues.length - 1) {
        setTimeout(() => {
          setCurrentMouthShape("X");
        }, cue.end * 1000);
      }
    });
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
    setCameraZoomed(true);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const { lipsync } = messages[0];
      animateLipSync(lipsync);
    }
  }, [messages]);

  const getChatResponse = async (message) => {
    setLoading(true);
    const response = await fetch("https://tech-e-modal-backend.vercel.app/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    setMessages(data.messages);
    setLoading(false);
  };

  return (
    <ChatContext.Provider value={{ messages, loading, message, setMessage, getChatResponse, onMessagePlayed }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
