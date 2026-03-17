import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// R2 Configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Generate Pre-signed URL for Upload
app.post("/api/upload/presigned", async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).json({ error: "Missing fileName or contentType" });
    }

    const key = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    res.json({ signedUrl, publicUrl, key });
  } catch (error: any) {
    console.error("R2 Presigned URL Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Object from R2
app.delete("/api/upload/delete", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Missing object key" });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    res.json({ success: true });
  } catch (error: any) {
    console.error("R2 Delete Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
