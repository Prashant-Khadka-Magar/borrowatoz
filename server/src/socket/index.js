import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

function parseCookies(cookieHeader = "") {
  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (!key) return;
    cookies[key] = decodeURIComponent(valueParts.join("="));
  });

  return cookies;
}

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // socket authentication using same jwt cookie as your REST auth middleware
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie || "");
      const token = cookies.jwt;

      if (!token) {
        return next(new Error("Not authorized, no token"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select(
        "_id firstName lastName email avatar"
      );

      if (!user) {
        return next(new Error("Not authorized, user not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Not authorized, token failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} | user: ${socket.user._id}`);

    // personal room for this user
    socket.join(`user:${socket.user._id}`);

    // join a conversation room
    socket.on("conversation:join", (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation:${conversationId}`);
      console.log(
        `User ${socket.user._id} joined conversation:${conversationId}`
      );
    });

    // leave a conversation room
    socket.on("conversation:leave", (conversationId) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
      console.log(
        `User ${socket.user._id} left conversation:${conversationId}`
      );
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};