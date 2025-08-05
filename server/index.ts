import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { startNotificationCron } from "./notificationService";
import { cronJobService } from "./cronJobs";
import { initializeTrialCronJob } from "./trialManager";
import { startCalendarSyncCron } from "./calendarIntegrationService";
import { emailWorkflowService } from "./emailWorkflowService";
import { calendarWorkflowService } from "./calendarWorkflowService";
import { revolutionaryAdaptiveEngine } from "./revolutionaryAdaptiveEngine";

const app = express();

// CORS middleware para permitir requisições de nexus.toit.com.br
app.use((req, res, next) => {
  const origin = req.get('origin');
  const allowedOrigins = [
    'https://nexus.toit.com.br',
    'https://supnexus.toit.com.br',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000'
  ];
  
  console.log(`🔒 [CORS] Origin: ${origin} | Allowed: ${allowedOrigins.includes(origin || '')}`);
  
  // SEMPRE definir o header, mesmo que seja origem permitida ou localhost
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Para requisições sem origin (mesmo servidor)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para servir landing page estática apenas para nexus.toit.com.br (não supnexus)
app.use((req, res, next) => {
  const host = req.get('host');
  const isExactNexusDomain = host === 'nexus.toit.com.br';
  const isSupNexusDomain = host?.includes('supnexus.toit.com.br');
  
  console.log(`🌐 [MIDDLEWARE] Host: ${host} | Path: ${req.path} | isNexus: ${isExactNexusDomain} | isSupNexus: ${isSupNexusDomain}`);
  
  // Apenas para nexus.toit.com.br exato, NÃO para supnexus.toit.com.br
  if (isExactNexusDomain && !isSupNexusDomain) {
    console.log('🎯 Interceptando nexus.toit.com.br - servindo landing page');
    return res.sendFile(path.resolve(import.meta.dirname, '..', 'nexus-quantum-landing.html'));
  }
  
  // supnexus.toit.com.br continua normal para equipe TOIT
  next();
});

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key-toit-nexus-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
    // Inicializar sistema e módulos
    console.log('🚀 Inicializando sistema TOIT NEXUS...');
    await import('./initializeSystem');
    
    // Inicializar módulos padrão (desabilitado temporariamente)
    // const { initializeDefaultModules, createProductConfigurations } = await import('./initializeModules');
    // await initializeDefaultModules();
    // await createProductConfigurations();
    
    const server = await registerRoutes(app);

  // Railway usa a variável PORT automaticamente
  const port = process.env.PORT || 3000;
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Railway Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost'}`);
    
    // Inicializar sistema de notificações automáticas
    if (process.env.NODE_ENV === 'production') {
      startNotificationCron();
      startCalendarSyncCron();
      
      // ⚡ INICIALIZAR SISTEMAS CRÍTICOS DE EMAIL E CALENDAR TRIGGERS
      console.log('🚀 Iniciando sistemas de Email & Calendar Workflow Triggers...');
      emailWorkflowService.startAutoSync();
      calendarWorkflowService.startAutoSync();
      console.log('✅ Email & Calendar Workflow Triggers iniciados com sucesso!');
      
      // 🧠 INICIALIZAR MOTOR ADAPTATIVO REVOLUCIONÁRIO
      console.log('🧠 Iniciando Revolutionary Adaptive Engine...');
      await revolutionaryAdaptiveEngine.initializeRevolutionarySystem();
      console.log('✅ Revolutionary Adaptive Engine 100x mais poderoso iniciado!');
    } else {
      console.log(`🔔 Notification cron disabled in development`);
      console.log(`📅 Calendar sync cron disabled in development`);
      console.log(`📧 Email workflow triggers disabled in development`);
      console.log(`📅 Calendar workflow triggers disabled in development`);
    }
  });

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

  // System setup route - creates initial super admin (no auth required)
  app.post('/api/setup-system', async (req, res) => {
    try {
      const { storage } = await import('./storage');
      
      // Check if any super admin already exists
      const existingSuperAdmins = await storage.getAllUsers();
      const hasSuperAdmin = existingSuperAdmins.some(user => user.role === 'super_admin');
      
      if (hasSuperAdmin) {
        return res.status(400).json({ 
          error: 'Sistema já foi configurado. Super admin já existe.' 
        });
      }

      const { email, firstName, lastName, password } = req.body;
      
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ 
          error: 'Dados obrigatórios: email, firstName, lastName, password' 
        });
      }

      const superAdmin = await storage.upsertUser({
        cpf: `super_admin_${Date.now()}`,
        password,
        email,
        firstName,
        lastName,
        role: 'super_admin',
        tenantId: null,
        isActive: true,
      });
      
      res.json({ 
        success: true, 
        message: 'Sistema configurado com sucesso! Super admin criado.',
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role
        }
      });
    } catch (error) {
      console.error('Error setting up system:', error);
      res.status(500).json({ error: 'Falha ao configurar sistema' });
    }
  });

  // Check if system needs setup
  app.get('/api/setup-status', async (req, res) => {
    try {
      const { storage } = await import('./storage');
      const existingSuperAdmins = await storage.getAllUsers();
      const needsSetup = !existingSuperAdmins.some(user => user.role === 'super_admin');
      
      res.json({ needsSetup });
    } catch (error) {
      console.error('Error checking setup status:', error);
      res.status(500).json({ error: 'Falha ao verificar status do sistema' });
    }
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
      
      // Inicializar cron jobs automáticos
      console.log(`🤖 Sistema de cron jobs inicializado`);
      const jobStatus = cronJobService.getStatus();
      console.log(`📊 Jobs ativos: ${jobStatus.activeJobs}`);
      
      // Inicializar gestão automática de trials
      initializeTrialCronJob();
      console.log(`⏰ Trial Manager inicializado`);
      if (process.env.REPLIT_DOMAINS) {
        console.log(`  Replit: https://${process.env.REPLIT_DOMAINS}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
