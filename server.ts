import express from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import * as dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  const roomService = livekitUrl && apiKey && apiSecret 
    ? new RoomServiceClient(livekitUrl, apiKey, apiSecret)
    : null;

  app.use(express.json());

  // LiveKit Token Endpoint
  app.post("/api/live/token", async (req, res) => {
    const { roomName, participantName, role } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ error: "roomName and participantName are required" });
    }

    if (!apiKey || !apiSecret || !livekitUrl) {
      return res.status(500).json({ error: "LiveKit credentials not fully configured (API Key, Secret, and URL are required)" });
    }

    try {
      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
      });

      // Admins, Teachers, and School Owners can publish. Students can only subscribe if we want to restrict them, 
      // but usually students need to speak too. However, the user said "students can only join sessions not start their own".
      // "Start" is handled by the UI. "Join" is joining an existing room.
      // If we want to restrict students from publishing video/audio, we can set canPublish: false.
      // But the user said "i want users to be able to mute the session, turn off their camers", implying they HAVE cameras.
      // So I'll give everyone publish rights for now, but restrict room creation to Admin/Teacher/School in the UI.
      
      const isStaff = role === 'admin' || role === 'teacher' || role === 'school';
      
      at.addGrant({ 
        roomJoin: true, 
        room: roomName,
        canPublish: true, // Everyone can publish their own stream
        canSubscribe: true,
        canPublishData: true,
        roomCreate: isStaff, // Only staff can create rooms
      });

      const token = await at.toJwt();
      const wsUrl = livekitUrl?.replace('https://', 'wss://');
      res.json({ token, serverUrl: wsUrl });
    } catch (error) {
      console.error("Error generating LiveKit token:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  // List Active Rooms
  app.get("/api/live/rooms", async (req, res) => {
    if (!roomService) {
      return res.status(500).json({ error: "LiveKit service not configured" });
    }

    try {
      const rooms = await roomService.listRooms();
      res.json({ rooms });
    } catch (error) {
      console.error("Error listing LiveKit rooms:", error);
      res.status(500).json({ error: "Failed to list rooms" });
    }
  });

  // Delete Room
  app.delete("/api/live/rooms/:roomName", async (req, res) => {
    if (!roomService) {
      return res.status(500).json({ error: "LiveKit service not configured" });
    }

    try {
      await roomService.deleteRoom(req.params.roomName);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting LiveKit room:", error);
      res.status(500).json({ error: "Failed to delete room" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
