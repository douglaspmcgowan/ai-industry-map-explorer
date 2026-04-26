import { Octokit } from "@octokit/rest";

const REPO_OWNER = "douglaspmcgowan";
const REPO_NAME = "ai-industry-map-explorer";
const QUEUE_PATH = "public/data/news-queue.json";
const BRANCH = "main";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const updates = body?.items ?? [];
    if (!Array.isArray(updates)) return res.status(400).json({ error: "items must be an array" });

    const octokit = new Octokit({ auth: process.env.GH_TOKEN });

    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER, repo: REPO_NAME, path: QUEUE_PATH, ref: BRANCH,
    });
    const queue = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf8"));

    const updateMap = new Map(updates.map(u => [u.id, u.status]));
    for (const item of queue.items) {
      if (updateMap.has(item.id)) item.status = updateMap.get(item.id);
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER, repo: REPO_NAME, path: QUEUE_PATH,
      message: `news: update ${updates.length} article decision(s)`,
      content: Buffer.from(JSON.stringify(queue, null, 2), "utf8").toString("base64"),
      sha: fileData.sha, branch: BRANCH,
    });

    return res.json({ ok: true, updated: updates.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
}
