const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let reports = [
  {
    id: "sample-1",
    location: "Dhanmondi",
    type: "Waterlogging",
    description: "Sample report for demonstration purposes.",
    createdAt: Date.now() - 3600000
  },
  {
    id: "sample-2",
    location: "Farmgate",
    type: "Roadblock",
    description: "Sample report for demonstration purposes.",
    createdAt: Date.now() - 1800000
  }
];

io.on("connection", (socket) => {
  // Send existing reports to a new visitor
  socket.emit("reports:update", reports);

  // Receive a new report
  socket.on("report:add", (report) => {
    if (
      !report ||
      typeof report.location !== "string" ||
      typeof report.type !== "string" ||
      typeof report.description !== "string"
    ) return;

    const newReport = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      location: report.location.slice(0, 100),
      type: report.type.slice(0, 50),
      description: report.description.slice(0, 500),
      createdAt: Date.now()
    };

    reports.push(newReport);

    // Broadcast the updated reports to all connected visitors
    io.emit("reports:update", reports);
  });
});

server.listen(3000, () => {
  console.log("DhakaPath running at http://localhost:3000");
});
