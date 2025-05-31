const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Tham gia phòng chat riêng cho user
    socket.on("join", (userID) => {
      socket.join(String(userID));
      console.log(`User ${userID} joined their room`);
    });

    // Signaling cho WebRTC: chuyển tiếp offer/answer/candidate
    socket.on("webrtc-signal", ({ to, data }) => {
      console.log("Nhận tín hiệu video call:", { to, data }); // Thêm dòng này
      io.to(String(to)).emit("webrtc-signal", {
        from: socket.id,
        data,
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket ${socket.id} disconnected`);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

module.exports = { initSocket, getIO };
