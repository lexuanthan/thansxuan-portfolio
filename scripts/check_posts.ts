import fs from "fs";

if (fs.existsSync(".env.local")) {
  const envFile = fs.readFileSync(".env.local", "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

async function main() {
  const { getPosts, getCategories } = await import("../src/lib/queries");
  const posts = await getPosts();
  const categories = await getCategories();
  console.log("POSTS COUNT:", posts.length);
  console.log("POSTS TITLES:", posts.map(p => p.title));
  console.log("CATEGORIES COUNT:", categories.length);
}

main().catch(console.error);
