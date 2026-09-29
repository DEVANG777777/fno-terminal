"""
Live WebSocket Streamer
Manages broadcasting real-time LTP updates to connected frontend clients.
"""
import asyncio
import json
from typing import Set
from fastapi import WebSocket

class LiveStreamer:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.is_streaming = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"[LiveStreamer] Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        print(f"[LiveStreamer] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        if not self.active_connections:
            return
        payload = json.dumps(message)
        dead = []
        for ws in self.active_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active_connections.discard(ws)

streamer = LiveStreamer()
