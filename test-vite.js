import { createServer } from "vite";
async function test() {
  try {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    console.log("Vite server created successfully");
  } catch(e) {
    console.error("VITE THREW:", e);
  }
}
test();