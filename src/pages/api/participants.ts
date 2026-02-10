import type { APIRoute } from "astro";
import PocketBase from "pocketbase";

export const prerender = false;

const POCKETBASE_URL = import.meta.env.POCKETBASE_URL || process.env.POCKETBASE_URL;
if (!POCKETBASE_URL) {
  throw new Error("POCKETBASE_URL is not defined in environment variables");
}
const pb = new PocketBase(POCKETBASE_URL);

export const GET: APIRoute = async () => {
  const records = await pb.collection("participants").getFullList({
    sort: "-created",
    fields: "id,name,created",
  });

  return new Response(JSON.stringify(records), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid or empty JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name } = body ?? {};
  const clean = (name || "").toString().trim();

  if (clean.length < 2) {
    return new Response(JSON.stringify({ error: "Name too short" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await pb.collection("participants").create({ name: clean });

  const records = await pb.collection("participants").getFullList({
    sort: "-created",
    fields: "id,name,created",
  });

  return new Response(JSON.stringify(records), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};