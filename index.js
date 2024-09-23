const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Cấu hình view engine là EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Add CSP header to allow WebSocket connections
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' ws: wss:;"
  );
  next();
});

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
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);

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
      case "fill":
        // Handle 'click', 'open', and 'fill' actions
        wss.clients.forEach((client) => {
          client.send(JSON.stringify(data));
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
            ws.send(`Error saving XML: ${err.message}`);
          } else {
            console.log(`XML saved to ${filepath}`);
            ws.send(`XML saved as ${filename}`);
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
server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});