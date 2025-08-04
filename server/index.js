import 'dotenv/config';
import express from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import paymentRoutes from "./paymentRoutes.js";
import webhookRoutes from "./webhookRoutes.js";

const app = express();

// Configure raw body processing for Stripe webhooks BEFORE other middleware
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Standard JSON middleware for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  let capturedJsonResponse = undefined;

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
    
    // Executar migrations automaticamente
    console.log('🗄️  Executando database migrations...');
    try {
      const { execSync } = await import('child_process');
      execSync('npm run db:push', { stdio: 'inherit' });
      console.log('✅ Migrations executadas com sucesso');
    } catch (error) {
      console.warn('⚠️  Erro ao executar migrations:', error.message);
      console.log('Continuando sem migrations - assumindo tabelas já existem');
    }
    
    await import('./initializeSystem.js');

    // MIDDLEWARE CRÍTICO: Servir nexus-quantum-landing.html para nexus.toit.com.br
    // DEVE ser a PRIMEIRA coisa após middlewares básicos, ANTES de qualquer route
    app.use((req, res, next) => {
      const host = req.get('host') || '';
      const isNexusDomain = host.includes('nexus.toit.com.br') || host.startsWith('nexus.');
      
      console.log(`🌐 [DEBUG] Host: ${host} | Path: ${req.path} | NexusDomain: ${isNexusDomain}`);
      
      // Se for domínio nexus e requisição GET (exceto APIs)
      if (isNexusDomain && req.method === 'GET' && !req.path.startsWith('/api')) {
        const filePath = path.resolve(process.cwd(), 'nexus-quantum-landing.html');
        console.log(`🚀 [NEXUS LANDING] Servindo nexus-quantum-landing.html para ${host}${req.path}`);
        return res.sendFile(filePath, (err) => {
          if (err) {
            console.error('❌ Erro ao servir nexus-quantum-landing.html:', err);
            res.status(500).send('Erro ao carregar página');
          }
        });
      }
      
      next();
    });

    // Inicializar sistema de autenticação
    console.log('🔐 Inicializando sistema de autenticação...');
    const { initializeAuth } = await import('./initializeAuth.js');
    await initializeAuth();

    // Register authentication routes FIRST (highest priority)
    const authRoutes = await import('./authRoutes.js');
    app.use('/api/auth', authRoutes.default);

    // Register payment and webhook routes
    app.use('/api/payment', paymentRoutes);
    app.use('/api/webhooks', webhookRoutes);
    
    // Register other routes after
    const server = await registerRoutes(app);

    // Railway usa a variável PORT automaticamente
    const port = process.env.PORT || 3001;
  
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Railway Domain: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost'}`);
    });

    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error('Server error:', err);
    });

    // Add a simple test route first
    app.get('/test', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'simple_test.html'));
    });

    // Debug route to check server status
    app.get('/debug', (req, res) => {
      res.json({
        status: 'Server is running',
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
        railway_domain: process.env.RAILWAY_PUBLIC_DOMAIN,
        headers: req.headers,
        url: req.url,
        timestamp: new Date().toISOString()
      });
    });

    // Add a simple health check route
    app.get('/health', (req, res) => {
      res.send('OK - TOIT NEXUS Server Running');
    });

    // Payment system health check
    app.get('/api/payment/health', (req, res) => {
      const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
      res.json({
        status: 'Payment system ready',
        stripe_configured: stripeConfigured,
        timestamp: new Date().toISOString()
      });
    });

    // System setup route - creates initial super admin (no auth required)
    app.post('/api/setup-system', async (req, res) => {
      try {
        const { storage } = await import('./storage.js');
        
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

        // Initialize default payment plans
        try {
          const { paymentService } = await import('./paymentService.js');
          const plans = await paymentService.createDefaultPlans();
          console.log(`✅ ${plans.length} planos de pagamento padrão criados`);
        } catch (error) {
          console.warn('⚠️  Erro ao criar planos padrão:', error.message);
          // Continue without failing the setup
        }
        
        res.json({ 
          success: true, 
          message: 'Sistema configurado com sucesso! Super admin criado e planos de pagamento inicializados.',
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
        const { storage } = await import('./storage.js');
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

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();