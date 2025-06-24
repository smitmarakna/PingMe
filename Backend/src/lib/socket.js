import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
});

export function getRecieverSocketId(userId) {
    return userSocketMap[userId] || null; // Return the socket ID for the given user ID or null if not found
}

const userSocketMap = {}; // will store online users

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id; // Store the user ID and socket ID mapping
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit online users to all clients


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId]; // Remove the user from the online users map
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users to all clients
    });

});

export {io, server, app};