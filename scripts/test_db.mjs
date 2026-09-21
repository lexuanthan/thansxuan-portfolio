import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Connecting to:", url);
const supabase = createClient(url, key);

async function check() {
  const { data: cats, error: catErr } = await supabase.from("categories").select("*");
  console.log("Categories:", cats, catErr);

  const { data: posts, error: postErr } = await supabase.from("posts").select("id, title, slug, published, category_id");
  console.log("Posts:", posts, postErr);
}

check();
