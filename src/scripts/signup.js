import PocketBase from "pocketbase";

const POCKETBASE_URL = "https://pocketbase.hippou.cz";
const pb = new PocketBase(POCKETBASE_URL);

const form = document.getElementById("signup-form");
const list = document.getElementById("participants");
const msg = document.getElementById("msg");
const input = document.getElementById("name");
const eventSlug = form.dataset.eventSlug;

async function loadParticipants() {
  try {
    const records = await pb.collection("participants").getFullList({
      sort: "-created",
      filter: pb.filter("eventSlug = {:eventSlug}", { eventSlug }),
      fields: "id,name,created",
    });
    render(records);
  } catch (err) {
    console.error("Nepodařilo se načíst účastníky:", err);
  }
}

function render(participants) {
  list.innerHTML = "";
  for (const p of participants) {
    const div = document.createElement("div");
    div.className = "participant";
    div.innerHTML = `
      <div class="participant-avatar">${p.name.charAt(0).toUpperCase()}</div>
      <div class="participant-name">${p.name}</div>
    `;
    list.appendChild(div);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const name = input.value.trim();
  if (name.length < 2) {
    msg.textContent = "Zadej prosím jméno (aspoň 2 znaky).";
    return;
  }

  try {
    await pb.collection("participants").create({ name, eventSlug });
    await loadParticipants();
    input.value = "";
    input.focus();
  } catch (err) {
    msg.textContent = "Nepodařilo se odeslat přihlášku.";
    console.error(err);
  }
});

loadParticipants();
