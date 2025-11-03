# database.py
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional

class MessageBoardDB:
    def __init__(self, db_path: str = "message_board.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    author TEXT NOT NULL DEFAULT 'Anonymous',
                    message TEXT NOT NULL,
                    likes INTEGER NOT NULL DEFAULT 0,
                    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN NOT NULL DEFAULT 1
                )
            """)
            conn.commit()
    
    def add_message(self, author: str, message: str) -> int:
        """Add a new message to the board"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT INTO messages (author, message) 
                VALUES (?, ?)
            """, (author or "Anonymous", message))
            conn.commit()
            return cursor.lastrowid
    
    def get_messages(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """Retrieve messages (newest first)"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                SELECT id, author, message, likes, timestamp
                FROM messages 
                WHERE is_active = 1
                ORDER BY timestamp DESC
                LIMIT ? OFFSET ?
            """, (limit, offset))
            
            messages = []
            for row in cursor.fetchall():
                messages.append({
                    "id": row["id"],
                    "author": row["author"],
                    "message": row["message"],
                    "likes": row["likes"],
                    "timestamp": row["timestamp"]
                })
            return messages
    
    def like_message(self, message_id: int) -> Optional[int]:
        """Increment like count for a message"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE messages 
                SET likes = likes + 1 
                WHERE id = ? AND is_active = 1
            """, (message_id,))
            
            if cursor.rowcount > 0:
                conn.commit()
                # Return updated like count
                cursor = conn.execute(
                    "SELECT likes FROM messages WHERE id = ?", 
                    (message_id,)
                )
                return cursor.fetchone()[0]
            return None
    
    def delete_message(self, message_id: int) -> bool:
        """Soft delete a message (set is_active = 0)"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE messages 
                SET is_active = 0 
                WHERE id = ?
            """, (message_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def get_message_count(self) -> int:
        """Get total active message count"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT COUNT(*) FROM messages WHERE is_active = 1"
            )
            return cursor.fetchone()[0]

# Global database instance
message_db = MessageBoardDB()