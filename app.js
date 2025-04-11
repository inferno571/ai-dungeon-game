import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const contractAddress = "0x7211bC28e67470a0041CCE720200729AF1A8E88f"; // lowercase would work too
const abi = [
  "function updateProgress(uint256 _level, string memory _checkpoint) public",
  "function logKill(string memory _enemyType) public",
  "function mintWeapon(string memory _weaponName) public",
  "function getPlayerInfo(address _player) public view returns (uint256, string memory)",
  "function getKillCount(address _player, string memory _enemyType) public view returns (uint256)",
  "function getWeapons(address _player) public view returns (string[] memory)"
];

let signer, contract;

// 🔌 Connect wallet and initialize contract
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found. Please install it.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum); // ✅ fixed
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);

  const address = await signer.getAddress();
  console.log("✅ Wallet connected:", address);
  document.getElementById("connectWallet").innerText = `🟢 Connected: ${address.slice(0, 6)}...`;
}


// 🎮 Start game by setting progress to level 1
async function startGame() {
  try {
    if (!contract) await connectWallet();
    const tx = await contract.updateProgress(1, "Start");
    await tx.wait();
    alert("🎮 Game started at Level 1 - Checkpoint: Start");
  } catch (err) {
    console.error("❌ Error starting game:", err);
    alert("Game start failed.");
  }
}

// ⚔️ Kill an enemy
async function killEnemy(enemyType) {
  try {
    if (!contract) await connectWallet();
    const tx = await contract.logKill(enemyType);
    await tx.wait();
    alert(`💀 You killed a ${enemyType}`);
  } catch (err) {
    console.error("❌ Kill failed:", err);
    alert("Failed to log kill.");
  }
}

// 🛡️ Mint a weapon
async function mintWeapon(weaponName) {
  try {
    if (!contract) await connectWallet();
    const tx = await contract.mintWeapon(weaponName);
    await tx.wait();
    alert(`🔫 Weapon minted: ${weaponName}`);
  } catch (err) {
    console.error("❌ Mint failed:", err);
    alert("Failed to mint weapon.");
  }
}
async function simulateEncounter() {
  const enemy = prompt("Enter an enemy name to simulate:", "Cacodemon");
  if (!enemy) return;

  const promptText = `You're a gritty DOOM narrator. The player just faced a ${enemy} in a fiery dungeon. Give a brutal one-liner.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: promptText }],
        temperature: 0.9
      })
    });

    const data = await response.json();
    const line = data?.choices?.[0]?.message?.content || "🔥 The demon is dust. The Slayer walks on.";
    alert("💬 " + line);
  } catch (err) {
    console.error("❌ Groq simulation failed:", err);
    alert("Couldn't simulate — check console.");
  }
}
// Simulated Doom Game (no blockchain)
// Tracks player state and uses Groq for narration

let player = {
  health: 100,
  level: 1,
  kills: 0,
  weapons: [],
  log: []
};

const enemyTypes = ["Imp", "Cacodemon", "Hell Knight", "Baron of Hell", "Cyberdemon"];
const weaponsPool = ["Shotgun", "Chainsaw", "Rocket Launcher", "Plasma Rifle"];

async function simulateEncounterold() {
  const enemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const damage = Math.floor(Math.random() * 30) + 5;

  player.kills++;
  player.health -= damage;
  if (player.health <= 0) {
    alert("💀 You died. Game over.");
    resetSim();
    return;
  }

  if (player.kills % 3 === 0) player.level++;

  const narration = await getGroqNarration(enemy);
  player.log.unshift(`🩸 ${narration}`);

  updateSimUI();
}

function lootWeapon() {
  const weapon = weaponsPool[Math.floor(Math.random() * weaponsPool.length)];
  if (!player.weapons.includes(weapon)) {
    player.weapons.push(weapon);
    player.log.unshift(`🔫 Found: ${weapon}`);
  } else {
    player.log.unshift(`🔁 Already have: ${weapon}`);
  }
  updateSimUI();
}

function resetSim() {
  player = { health: 100, level: 1, kills: 0, weapons: [], log: [] };
  updateSimUI();
}

function updateSimUI() {
  document.getElementById("simStats").innerText =
    `❤️ Health: ${player.health}\n⚔️ Level: ${player.level}\n💀 Kills: ${player.kills}\n🧨 Weapons: ${player.weapons.join(", ")}`;
  document.getElementById("simLog").innerText = player.log.slice(0, 5).join("\n");
}

async function getGroqNarration(enemy) {
  const prompt = `You're a gritty DOOM narrator. The player just killed a ${enemy} in a brutal way. Give one brutal sentence.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9
      })
    });
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || "Another demon bites the dust.";
  } catch (err) {
    console.error("Groq error:", err);
    return "Silence echoes as the blood dries.";
  }
}

// Bind buttons
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("simFight")?.addEventListener("click", simulateEncounter);
  document.getElementById("simLoot")?.addEventListener("click", lootWeapon);
  document.getElementById("simReset")?.addEventListener("click", resetSim);
  updateSimUI();
});



// ✅ Bind all button events once DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectWallet")?.addEventListener("click", connectWallet);
  document.getElementById("startGame")?.addEventListener("click", startGame);
  document.getElementById("killImp")?.addEventListener("click", () => killEnemy("Imp"));
  document.getElementById("mintShotgun")?.addEventListener("click", () => mintWeapon("Shotgun"));
document.getElementById("simulateBtn")?.addEventListener("click", simulateEncounter);
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("simFight")?.addEventListener("click", simulateEncounter);
  document.getElementById("simLoot")?.addEventListener("click", lootWeapon);
  document.getElementById("simReset")?.addEventListener("click", resetSim);
  updateSimUI();
});


});
