import PocketBase from "pocketbase";

const POCKETBASE_URL = "https://pocketbase.hippou.cz";
const pb = new PocketBase(POCKETBASE_URL);

const form = document.getElementById("signup-form");
const list = document.getElementById("participants");
const msg = document.getElementById("msg");
const input = document.getElementById("name");
const eventSlug = form.dataset.eventSlug;
const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const avatarUrls = Array.from(
  { length: 30 },
  (_, index) => `${baseUrl}avatars/avatar-${String(index + 1).padStart(2, "0")}.png`,
);

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }

  return result >>> 0;
}

function assignAvatars(participants) {
  const assignments = new Map();
  const usedIndexes = new Set();
  const sortedParticipants = [...participants].sort(
    (a, b) => a.created.localeCompare(b.created) || a.id.localeCompare(b.id),
  );

  for (const participant of sortedParticipants) {
    const preferredIndex = hash(participant.id) % avatarUrls.length;

    for (let offset = 0; offset < avatarUrls.length; offset++) {
      const avatarIndex = (preferredIndex + offset) % avatarUrls.length;
      if (!usedIndexes.has(avatarIndex)) {
        usedIndexes.add(avatarIndex);
        assignments.set(participant.id, avatarUrls[avatarIndex]);
        break;
      }
    }
  }

  return assignments;
}

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
  const participantAvatars = assignAvatars(participants);

  for (const p of participants) {
    const div = document.createElement("div");
    div.className = "participant";

    const initial = p.name.charAt(0).toUpperCase();
    const avatar = document.createElement("div");
    avatar.className = "participant-avatar";

    const avatarUrl = participantAvatars.get(p.id);
    if (avatarUrl) {
      const image = document.createElement("img");
      image.className = "participant-avatar-image";
      image.src = avatarUrl;
      image.alt = "";
      image.width = 64;
      image.height = 64;
      image.decoding = "async";
      image.addEventListener("error", () => {
        image.remove();
        avatar.textContent = initial;
      });
      avatar.appendChild(image);
    } else {
      avatar.textContent = initial;
    }

    const name = document.createElement("div");
    name.className = "participant-name";
    name.textContent = p.name;

    div.append(avatar, name);
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
