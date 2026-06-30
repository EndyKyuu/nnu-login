// api/sign-in.js

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO;
const FILE_PATH = "logins.json";
const BRANCH = "main";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

  try {
    // 1. Get the current file (to read existing data + required sha)
    let currentData = [];
    let sha = null;

    const getRes = await fetch(`${apiUrl}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    if (getRes.status === 200) {
      const fileData = await getRes.json();
      sha = fileData.sha;
      const decoded = Buffer.from(fileData.content, "base64").toString("utf8");
      currentData = JSON.parse(decoded);
    } else if (getRes.status !== 404) {
      // 404 just means the file doesn't exist yet — that's fine, we'll create it
      throw new Error(`GitHub GET failed: ${getRes.status}`);
    }

    // 2. Append the new entry
    currentData.push({
      email,
      timestamp: new Date().toISOString()
    });

    const newContent = Buffer.from(
      JSON.stringify(currentData, null, 2)
    ).toString("base64");

    // 3. Commit the updated file back to GitHub
    const putRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        message: `Add login: ${email}`,
        content: newContent,
        sha: sha || undefined, // omit sha if file is new
        branch: BRANCH
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`GitHub PUT failed: ${putRes.status} ${errText}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save login" });
  }
}