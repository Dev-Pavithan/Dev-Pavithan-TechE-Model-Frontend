import { createContext, useContext, useEffect, useState } from "react";

// const backendUrl = "http://localhost:8000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [currentMouthShape, setCurrentMouthShape] = useState("X"); // Track current mouth shape

  // Function to update the mouth shape based on lip-sync data
  const animateLipSync = (mouthCues) => {
    mouthCues.forEach((cue, index) => {
      const duration = (cue.end - cue.start) * 1000; // Calculate duration in milliseconds

      // Set the mouth shape when the cue starts
      setTimeout(() => {
        setCurrentMouthShape(cue.value);
      }, cue.start * 1000);

      // Reset the mouth shape when the cue ends, or after the last cue
      if (index === mouthCues.length - 1) {
        setTimeout(() => {
          setCurrentMouthShape("X"); // Reset to default mouth shape after the final cue
        }, cue.end * 1000);
      }
    });
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  // Function to generate lip-sync data via API
  // const generateLipSync = async (audioFile) => {
  //   try {
  //     const response = await fetch(`http://localhost:8000/generate-lipsync`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ audioFile }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to generate lip sync");
  //     }

  //     const data = await response.json();
  //     console.log("Lip Sync Data:", data);

  //     // Animate the lip sync using received mouth cues
  //     animateLipSync(data.mouthCues); // Pass the mouth cues to the animation function
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };


  const generateLipSync = async (audioFile) => {
    try {
      const response = await fetch(`http://localhost:8000/generate-lipsync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioFile }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate lip sync");
      }

      const data = await response.json();
      console.log("Lip Sync Data:", data);

      // Check if mouthCues is an array
      if (!Array.isArray(data.mouthCues)) {
        throw new Error("MouthCues is not an array.");
      }

      // Animate the lip sync using received mouth cues
      animateLipSync(data.mouthCues); // Pass the mouth cues to the animation function
    } catch (error) {
      console.error("Error:", error);
    }
};

  
  


  // Chat function with lip-sync generation
  const chat = async (message) => {
    setLoading(true);

    const data = await fetch(`http://localhost:8000/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const resp = (await data.json()).messages;
    setMessages((messages) => [...messages, ...resp]);

    // Assuming a static audio file path for demonstration purposes
    const audioFilePath = `message_0.wav`; // Adjust as needed based on response

    // Generate lip-sync data after receiving the message
    await generateLipSync(audioFilePath);

    setLoading(false);
  };

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        currentMouthShape, // Expose mouth shape to context consumers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
