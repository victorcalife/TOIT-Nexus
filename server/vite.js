import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config.js";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viteLogger = createLogger();

export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const host = req.get('host') || '';
    const isNexusDomain = host.includes('nexus.toit.com.br') || host.startsWith('nexus.');
    
    console.log(`🔍 [VITE DEV] Host: ${host} | Path: ${req.path} | NexusDomain: ${isNexusDomain}`);
    
    // Se for domínio nexus, o middleware anterior já deve ter tratado
    if (isNexusDomain) {
      console.log(`⚠️  [VITE DEV] Domínio nexus chegou ao catch-all - retornando 404`);
      return res.status(404).send('Página não encontrada no domínio Nexus');
    }
    
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html APENAS se NÃO for domínio nexus
  app.use("*", (req, res) => {
    const host = req.get('host') || '';
    const isNexusDomain = host.includes('nexus.toit.com.br') || host.startsWith('nexus.');
    
    console.log(`🔍 [SERVE STATIC] Host: ${host} | Path: ${req.path} | NexusDomain: ${isNexusDomain}`);
    
    // Se for domínio nexus, o middleware anterior já deve ter tratado
    // Se chegou aqui no nexus, algo deu errado - retornar 404
    if (isNexusDomain) {
      console.log(`⚠️  [SERVE STATIC] Domínio nexus chegou ao catch-all - retornando 404`);
      return res.status(404).send('Página não encontrada no domínio Nexus');
    }
    
    // Para outros domínios, servir React App normalmente
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}