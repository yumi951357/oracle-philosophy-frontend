# 🔮 Oracle Philosophy Frontend

> The Blackout Protocol - Truth Verification Interface

![Version](https://img.shields.io/badge/version-M1.5-blue)
![Deployment](https://img.shields.io/badge/deployed-Vercel-success)

## 🧭 Overview

Frontend portal for the Oracle Philosophy system (M1.5) - a verifiable AI oracle that cryptographically audits its own honesty through blockchain-style audit logs.

**Live Demo:** https://oracle-philosophy-frontend-hnup.vercel.app/
📖 Formal Verification 
We've established a mathematical foundation for verifiable AI auditing through formal specification:

[**Formal Specification: Verifiable AI Audit Chain**](./docs/formal-spec.md)

> *Inspired by Professor Philip Wadler's work on semantic ledgers, this Coq/Agda-style specification provides rigorous mathematical guarantees for AI audit trail integrity.*
## ✨ Core Features

- **🔍 Oracle Interface**: Ask questions and receive analyzed responses
- **📊 Integrity Metrics**: View determinacy & deception probability scores
- **⛓️ Audit Chain Verification**: Hash-based blockchain verification system
- **📄 Documentation**: Integrated whitepaper and protocol guide
- **🔐 Transparency Tools**: Real-time truth integrity verification

## 🛠️ Tech Stack

- **Frontend**: HTML5 / CSS3 / Vanilla JavaScript
- **HTTP Client**: Axios for API communication
- **Deployment**: Vercel
- **Styling**: Custom CSS with responsive design
- **Verification**: SHA-256 hash verification module

## 🚀 Quick Start

### Prerequisites
- Modern web browser with JavaScript enabled
- Local development server (optional)

### Local Development
```bash
# Clone repository
git clone https://github.com/yumi951357/oracle-philosophy-frontend.git

# Navigate to project directory
cd oracle-philosophy-frontend

# Open with local server (using Python)
python -m http.server 8000
# or using Node.js
npx live-server
# or using PHP
php -S localhost:8000
