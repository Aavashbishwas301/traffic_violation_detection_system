import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import API_BASE_URL from "../config/api.js";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) return;

    const newSocket = io(API_BASE_URL, {
      auth: { token: user.token },
    });

    newSocket.on("connect", () => {
      setConnected(true);
      // Join room based on user role
      newSocket.emit("join", { role: user.role, userId: user._id });
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?.token, user?._id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
