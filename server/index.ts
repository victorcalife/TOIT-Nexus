import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Server error:', err);
  });

  // Add a simple test route first
  app.get('/test', (req, res) => {
    res.sendFile(path.resolve(import.meta.dirname, '..', 'simple_test.html'));
  });

  // Debug route to check server status
  app.get('/debug', (req, res) => {
    res.json({
      status: 'Server is running',
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      replit_domain: process.env.REPLIT_DOMAINS,
      headers: req.headers,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  });

  // Add a simple health check route
  app.get('/health', (req, res) => {
    res.send('OK - InvestFlow Server Running');
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port} - accessible on 0.0.0.0:${port}`);
      console.log(`Server URLs:`);
      console.log(`  Local: http://localhost:${port}`);
      console.log(`  Network: http://0.0.0.0:${port}`);
      if (process.env.REPLIT_DOMAINS) {
        console.log(`  Replit: https://${process.env.REPLIT_DOMAINS}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
