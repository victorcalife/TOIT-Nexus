import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
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
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
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
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const clientPath = path.resolve(import.meta.dirname, "..", "client");
  const clientIndexPath = path.resolve(clientPath, "index.html");

  console.log(`📁 [STATIC] Client path: ${clientPath}`);
  console.log(`📄 [STATIC] Index path: ${clientIndexPath}`);

  if (!fs.existsSync(clientIndexPath)) {
    console.error(`❌ [STATIC] Client index.html não encontrado: ${clientIndexPath}`);
    // Fallback - servir apenas landing page
    app.use("*", (req, res) => {
      const landingPath = path.resolve(import.meta.dirname, '..', 'nexus-quantum-landing.html');
      console.log(`🔄 [FALLBACK] Servindo landing page: ${landingPath}`);
      res.sendFile(landingPath);
    });
    return;
  }

  // Servir arquivos estáticos do client
  app.use(express.static(clientPath));

  // Servir client React app para todas as rotas não-API
  app.use("*", (req, res) => {
    console.log(`📱 [REACT] Servindo React app para: ${req.originalUrl}`);
    res.sendFile(clientIndexPath);
  });
}
