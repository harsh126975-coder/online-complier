const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

// Judge0 CE language IDs
const LANGUAGES = {
  python: 71, java: 62, c: 50, cpp: 54, javascript: 63, typescript: 74,
  lua: 64, php: 68, csharp: 51, go: 60, rust: 73, ruby: 72,
  kotlin: 78, swift: 83, r: 80, perl: 85, bash: 46, scala: 81, sql: 82,
};

app.post("/api/run", async (req, res) => {
  const { language, code, stdin } = req.body;
  if (!LANGUAGES[language] || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid language ya code" });
  }
  try {
    const r = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: LANGUAGES[language],
        source_code: code,
        stdin: stdin || "",
        cpu_time_limit: 5,
      }),
    });
    const data = await r.json();
    res.json({
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      compile_output: data.compile_output || "",
      status: data.status ? data.status.description : "Unknown",
      time: data.time,
    });
  } catch (e) {
    res.status(500).json({ error: "Code run nahi ho paya: " + e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));