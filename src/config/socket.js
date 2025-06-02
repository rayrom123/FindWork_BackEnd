const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "https://web-fe-deploy.vercel.app",
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


    // Trong file socket.js hoặc nơi bạn xử lý socket
    socket.on("webrtc-signal", ({ to, data }) => {
      console.log("Nhận tín hiệu video call:", { to, data });
      // Lấy userId từ socket thay vì socket.id
      const userId = socket.userId; // Giả sử bạn đã lưu userId vào socket khi user kết nối
      io.to(String(to)).emit("webrtc-signal", {
        from: userId, // Sử dụng userId thay vì socket.id
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
