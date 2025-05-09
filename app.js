let player = {
  health: 100,
  level: 1,
  kills: 0,
  weapons: [],
  log: []
};

const enemyTypes = ["Imp", "Cacodemon", "Baron of Hell"];
const weaponsPool = ["Shotgun", "Chainsaw", "Rocket Launcher", "Plasma Rifle"];

let contract;
let signer;
const contractAddress = "0x7211bC28E67470a0041CCE720200729AF1A8E88F";
const abi = [
  "function updateProgress(uint256 _level, string memory _checkpoint) public",
  "function logKill(string memory _enemyType) public",
  "function mintWeapon(string memory _weaponName) public",
  "function getPlayerInfo(address _player) public view returns (uint256, string memory)",
  "function getKillCount(address _player, string memory _enemyType) public view returns (uint256)",
  "function getWeapons(address _player) public view returns (string[] memory)"
];

function playSFX(name) {
  const audio = new Audio(`sfx/${name}`);
  audio.play().catch(err => console.error("SFX error:", err));
}

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(contractAddress, abi, signer);
  const address = await signer.getAddress();
  alert(`🔌 Connected as ${address}`);
}

async function startGame() {
  try {
    if (!contract) await connectWallet();
    const tx = await contract.updateProgress(1, "Start");
    await tx.wait();
    alert("🎮 On-chain game started!");
    playSFX("power_surge.wav");
  } catch (err) {
    console.error("Error starting game:", err);
    alert("❌ Could not start game");
  }
}

async function simulateEncounter() {
  const enemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const damage = Math.floor(Math.random() * (enemy === "Baron of Hell" ? 40 : 25)) + 10;

  document.getElementById("enemy-image").src = `images/${enemy.toLowerCase().replace(/ /g, '_')}.png`;
  document.getElementById("enemy-name").innerText = enemy;

  player.kills++;
  player.health -= damage;

  if (player.health <= 0) {
    playSFX("death_roar.wav");
    alert("💀 You died. Game over.");
    resetSim();
    return;
  }

  if (player.kills % 3 === 0) {
    player.level++;
    playSFX("power_surge.wav");
  }

  try {
    if (!contract) await connectWallet();
    const tx = await contract.logKill(enemy);
    await tx.wait();
    playSFX("imp_scream.wav");
  } catch (err) {
    console.error("Error logging kill:", err);
  }

  const narration = await getGroqNarration(enemy);
  player.log.unshift(`🩸 ${narration}`);
  updateSimUI();
}

async function lootWeapon() {
  const weapon = weaponsPool[Math.floor(Math.random() * weaponsPool.length)];
  if (!player.weapons.includes(weapon)) {
    player.weapons.push(weapon);
    player.log.unshift(`🔫 Found: ${weapon}`);
    playSFX("pickup_weapon.wav");

    try {
      if (!contract) await connectWallet();
      await contract.mintWeapon(weapon);
    } catch (err) {
      console.error("mintWeapon error", err);
    }
  } else {
    player.log.unshift(`🔁 Already have: ${weapon}`);
  }

  updateSimUI();
}

function resetSim() {
  player = {
    health: 100,
    level: 1,
    kills: 0,
    weapons: [],
    log: []
  };
  updateSimUI();
}

function updateSimUI() {
  document.getElementById("hud-health").innerText = `❤️ Health: ${player.health}`;
  document.getElementById("hud-level").innerText = `⚔️ Level: ${player.level}`;
  document.getElementById("hud-kills").innerText = `💀 Kills: ${player.kills}`;
  document.getElementById("simStats").innerText = `🧠 Weapons: ${player.weapons.join(", ")}`;
  document.getElementById("simLog").innerText = player.log.slice(0, 5).join("\n");
}

async function getGroqNarration(enemy) {
  const prompt = `You're a gritty DOOM narrator. A ${enemy} appeared and the player fought back. Describe the battle in about 150 words. Player health: ${player.health}, weapon: ${player.weapons.at(-1) || 'fists'}.`;

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
    console.log("Groq response:", data);
    return data?.choices?.[0]?.message?.content || "Another demon bites the dust.";
  } catch (err) {
    console.error("Groq error:", err);
    return "Static crackles. The demon's scream fades into silence.";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectWallet")?.addEventListener("click", connectWallet);
  document.getElementById("startGame")?.addEventListener("click", startGame);
  document.getElementById("simFight")?.addEventListener("click", simulateEncounter);
  document.getElementById("simLoot")?.addEventListener("click", lootWeapon);
  document.getElementById("simReset")?.addEventListener("click", resetSim);
  updateSimUI();
});
