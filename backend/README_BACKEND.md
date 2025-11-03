
## 📁 后端 README.md

```markdown
# ⚙️ Oracle Philosophy Backend

> Audit Chain Engine - Verifiable AI Integrity System

![Python](https://img.shields.io/badge/python-3.10+-blue)
![Framework](https://img.shields.io/badge/flask-2.0+-green)
![API](https://img.shields.io/badge/status-live-success)

## 🧭 Overview

Backend engine powering the Oracle Ethics M1.5 system. Provides cryptographic audit chain functionality, AI response analysis, and integrity verification services.

**Live API:** https://oracle-philosophy-backend.onrender.com

## 🏗️ Architecture

The backend implements a blockchain-inspired audit system where:
- Each interaction generates a cryptographically linked record
- SHA-256 hashes ensure immutability and verification capability
- Determinacy and deception scores provide transparency metrics

## 🛠️ Tech Stack

- **Framework**: Flask (Python)
- **Cryptography**: hashlib (SHA-256)
- **Deployment**: Render
- **Monitoring**: UptimeRobot
- **CORS**: Flask-CORS for secure frontend communication

## 🚀 Installation & Setup

### Prerequisites
- Python 3.10 or higher
- pip package manager

### Local Development
```bash
# Clone repository
git clone https://github.com/yumi951357/oracle-philosophy-backend.git

# Navigate to project directory
cd oracle-philosophy-backend

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py