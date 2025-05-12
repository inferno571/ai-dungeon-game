# AI Dungeon Crawler

A browser-based dungeon crawler powered by Groq for dynamic storytelling and Monad for on-chain item minting and player progress tracking.

**Status:** Abandoned Prototype (Hackathon Build)

## 🔍 Overview

This was built for a hackathon challenge focused on using Groq + Monad. It’s a DOOM-style dungeon crawler where:

- **Groq** generates real-time narrative updates based on player input.
- **Monad** mints in-game items and logs player runs on the blockchain.

No real tokens, no NFTs — just a concept experiment in combining AI-driven gameplay with smart contracts.

## 🧱 Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **AI Narrative:** [Groq API](https://groq.com/)
- **Blockchain:** [Monad Testnet](https://monad.xyz/)
- **Smart Contracts:** Track levels, weapons, and kills
- **Optional Simulate Mode:** For playing without wallet or gas

##  Features

- Keyboard-based movement and interaction
- Groq-driven story generation
- Item minting and run logging on Monad
- Terminal overlay with retro-inspired design

## 🛠 How to Run Locally

### Requirements

- Node.js
- Groq API key (in `.env`)
- MON testnet tokens (for full on-chain mode)

### Setup

```bash
git clone https://github.com/inferno571/ai-dungeon-game
cd ai-dungeon-game
npm install
npm run dev
Create a .env file and add:

env
Copy
Edit
GROQ_API_KEY=your_groq_api_key_here
# Modes
On-chain Mode: Interacts with Monad smart contract (requires wallet + test MON)

Simulate Mode: Play offline without wallet (mocked backend)

#❌ Why It's Abandoned
The game loop and integrations worked during the hackathon, but this was a solo build and didn’t evolve past the prototype phase. It’s left here as a reference or starting point for anyone interested in merging AI and blockchain in games.

# Credits
Groq API Docs

Monad SDK + Testnet

Built solo by inferno571 for a hackathon
