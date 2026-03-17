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

// Generate Pre-signed URL or Handle Worker Upload
app.post("/api/upload/presigned", async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).json({ error: "Missing fileName or contentType" });
    }

    const key = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    // If Worker is configured, we'll return the Worker URL and use it as the "signedUrl"
    // The frontend will then PUT to this URL with the Auth Key handled by the server or passed through
    if (process.env.R2_WORKER_URL) {
      const workerUrl = `${process.env.R2_WORKER_URL}/${key}`;
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
      
      // We return the worker URL as the upload destination
      // Note: In this setup, the server will handle the actual PUT to the worker to keep the AUTH_KEY secret
      res.json({ 
        useWorker: true,
        uploadUrl: `/api/upload/worker-proxy?key=${encodeURIComponent(key)}&type=${encodeURIComponent(contentType)}`,
        publicUrl, 
        key 
      });
    } else {
      // Fallback to S3 Presigned URL
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
      const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

      res.json({ signedUrl, publicUrl, key });
    }
  } catch (error: any) {
    console.error("R2 Presigned URL Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy upload to Worker to keep AUTH_KEY hidden from frontend
app.put("/api/upload/worker-proxy", express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const { key, type } = req.query;
    if (!key || !process.env.R2_WORKER_URL) {
      return res.status(400).json({ error: "Missing configuration" });
    }

    const workerUrl = `${process.env.R2_WORKER_URL}/${key}`;
    const response = await fetch(workerUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.R2_WORKER_AUTH_KEY}`,
        'Content-Type': type as string
      },
      body: req.body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Worker upload failed: ${errorText}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Worker Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Object from R2 (via Worker or S3)
app.delete("/api/upload/delete", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: "Missing object key" });
    }

    if (process.env.R2_WORKER_URL) {
      const workerUrl = `${process.env.R2_WORKER_URL}/${key}`;
      const response = await fetch(workerUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.R2_WORKER_AUTH_KEY}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Worker delete failed: ${errorText}`);
      }
    } else {
      const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      });
      await r2Client.send(command);
    }
    
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
