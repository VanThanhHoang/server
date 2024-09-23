const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");
const cors = require('cors');
  
const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors());

// WebSocket server with less restrictive settings
const wss = new WebSocket.Server({ 
  server: server,
  verifyClient: () => true  // This allows all connections
});

// Cấu hình view engine là EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Cung cấp giao diện từ EJS
app.get("/", (req, res) => {
  res.render("index");
});

// Ensure the 'xml' directory exists
const xmlDir = path.join(__dirname, "xml");
if (!fs.existsSync(xmlDir)) {
  fs.mkdirSync(xmlDir);
}

// WebSocket logic
wss.on("connection", (ws, req) => {
  console.log(`New client connected from ${req.socket.remoteAddress}`);

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error("Error parsing message:", error);
      return;
    }

    switch (data.type) {
      case "screenshot":
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "dump" }));
          }
        });
        break;

      case "click":
      case "open":
      case "stopApp":
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        console.log(`Action ${data.type} with data:`, data.data);
        break;
      case "fill":
        // Broadcast these actions to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
        console.log(`Action ${data.type} with data:`, data.data);
        break;

      case "dump":
        console.log("Dump action requested");
        break;

      default:
        const date = new Date().toISOString().replace(/:/g, "-");
        const filename = `dumpscreen_${date}.xml`;
        const filepath = path.join(xmlDir, filename);
        fs.writeFile(filepath, data.data.text, (err) => {
          if (err) {
            console.error("Error saving XML:", err);
            ws.send(JSON.stringify({ type: "error", message: `Error saving XML: ${err.message}` }));
          } else {
            console.log(`XML saved to ${filepath}`);
            ws.send(JSON.stringify({ type: "success", message: `XML saved as ${filename}` }));
          }
        });
        break;
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Server lắng nghe trên cổng 8080
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});