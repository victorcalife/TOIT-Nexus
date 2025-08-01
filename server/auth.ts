import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      cpf: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      role: string;
      tenantId?: string;
      isActive: boolean;
    }
  }
}

const scryptAsync = promisify(scrypt);

// Função para gerar hash da senha
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Função para verificar senha
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Função para validar CPF
function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

export function setupAuth(app: Express) {
  // Configuração da sessão
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions"
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // true em produção com HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Estratégia de autenticação local com CPF
  passport.use(
    new LocalStrategy(
      { usernameField: 'cpf', passwordField: 'password' },
      async (cpf, password, done) => {
        try {
          // Remove formatação do CPF
          const cleanCpf = cpf.replace(/\D/g, '');
          
          // Valida CPF
          if (!isValidCPF(cleanCpf)) {
            return done(null, false, { message: 'CPF inválido' });
          }

          const user = await storage.getUserByCPF(cleanCpf);
          if (!user) {
            return done(null, false, { message: 'CPF não encontrado' });
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Usuário inativo' });
          }

          const isValidPassword = await comparePasswords(password, user.password!);
          if (!isValidPassword) {
            return done(null, false, { message: 'Senha incorreta' });
          }

          // Atualiza último login
          await storage.updateUserLastLogin(user.id);

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    // Handle both local auth users (with id) and OAuth users (object format)
    if (user && typeof user === 'object') {
      const userId = user.id || user.sub || user.claims?.sub;
      done(null, { userId, authType: user.claims ? 'oauth' : 'local' });
    } else {
      done(null, user);
    }
  });
  
  passport.deserializeUser(async (sessionData: any, done) => {
    try {
      if (!sessionData) {
        return done(null, false);
      }
      
      // Handle serialized object format
      if (typeof sessionData === 'object' && sessionData.userId) {
        if (sessionData.authType === 'oauth') {
          // For OAuth users, return minimal user data
          done(null, sessionData);
        } else {
          // For local users, fetch full user data
          const user = await storage.getUser(sessionData.userId);
          done(null, user);
        }
      } else if (typeof sessionData === 'string') {
        // Handle legacy string ID format
        const user = await storage.getUser(sessionData);
        done(null, user);
      } else {
        // Handle direct object (OAuth format)
        done(null, sessionData);
      }
    } catch (error) {
      console.error('Deserialization error:', error);
      done(null, false); // Return false instead of error to prevent crashes
    }
  });

  // Rota de registro
  app.post("/api/register", async (req, res, next) => {
    try {
      const { cpf, email, password, firstName, lastName, phone, tenantId } = req.body;

      // Remove formatação do CPF
      const cleanCpf = cpf.replace(/\D/g, '');

      // Valida CPF
      if (!isValidCPF(cleanCpf)) {
        return res.status(400).json({ message: "CPF inválido" });
      }

      // Verifica se CPF já existe
      const existingUser = await storage.getUserByCPF(cleanCpf);
      if (existingUser) {
        return res.status(400).json({ message: "CPF já cadastrado" });
      }

      // Cria o usuário
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        cpf: cleanCpf,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        tenantId,
        isActive: true,
      });

      // Remove senha do retorno
      const { password: _, ...userWithoutPassword } = user as any;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  // Rota de login
  app.post("/api/login", (req, res, next) => {
    try {
      // Extrair loginType do request body
      const { loginType } = req.body;
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        try {
          if (err) {
            console.error('Login authentication error:', err);
            return res.status(500).json({ 
              message: "Erro interno do servidor" 
            });
          }
          
          if (!user) {
            return res.status(401).json({ 
              message: info?.message || "Credenciais inválidas" 
            });
          }

          // Validar permissões baseado no loginType
          if (loginType === 'support') {
            // Para login de suporte, apenas super_admin e toit_admin podem acessar
            if (user.role !== 'super_admin' && user.role !== 'toit_admin') {
              return res.status(403).json({
                message: "Acesso negado. Apenas membros da equipe TOIT podem acessar esta área."
              });
            }
          }

          req.login(user, (err) => {
            if (err) {
              console.error('Login session error:', err);
              return res.status(500).json({
                message: "Erro ao criar sessão"
              });
            }
            
            // Remove senha do retorno e adiciona informações adicionais
            const { password: _, ...userWithoutPassword } = user as any;
            
            // Adicionar informações de permissões especiais
            const userResponse = {
              ...userWithoutPassword,
              hasFinancialAccess: user.role === 'super_admin',
              hasSupportAccess: user.role === 'super_admin' || user.role === 'toit_admin',
              loginType: loginType || 'client'
            };
            
            res.json(userResponse);
          });
        } catch (error) {
          console.error('Login callback error:', error);
          return res.status(500).json({
            message: "Erro interno do servidor"
          });
        }
      })(req, res, next);
    } catch (error) {
      console.error('Login endpoint error:', error);
      return res.status(500).json({
        message: "Erro interno do servidor"
      });
    }
  });

  // Rota de logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Rota para verificar usuário logado
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    // Remove senha do retorno  
    const { password: _, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Rota para trial signup - 7 dias grátis
  app.post("/api/auth/trial-signup", async (req, res, next) => {
    try {
      const { name, email, phone, cpf, password, plan, cycle, birthDate } = req.body;

      // Validações obrigatórias
      if (!name || !email || !phone || !cpf || !password || !plan || !birthDate) {
        return res.status(400).json({ 
          message: "Todos os campos são obrigatórios" 
        });
      }

      // Remove formatação do CPF
      const cleanCpf = cpf.replace(/\D/g, '');

      // Valida CPF (ÚNICO E SEMPRE OBRIGATÓRIO)
      if (!isValidCPF(cleanCpf)) {
        return res.status(400).json({ message: "CPF inválido" });
      }

      // Verifica se CPF já existe (ÚNICO)
      const existingUser = await storage.getUserByCPF(cleanCpf);
      if (existingUser) {
        return res.status(400).json({ 
          message: "CPF já cadastrado. Faça login ou use a opção 'Esqueci minha senha'" 
        });
      }

      // Valida email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email inválido" });
      }

      // Verifica se email já existe
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ 
          message: "Email já cadastrado. Faça login ou use a opção 'Esqueci minha senha'" 
        });
      }

      // Valida idade (18+ anos)
      const birthDateObj = new Date(birthDate);
      const now = new Date();
      const age = now.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = now.getMonth() - birthDateObj.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && now.getDate() < birthDateObj.getDate())) {
        return res.status(400).json({ 
          message: "É necessário ter pelo menos 18 anos para se cadastrar" 
        });
      }

      // Separa nome e sobrenome
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // Cria o usuário com status PENDENTE
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        cpf: cleanCpf,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        birthDate: birthDateObj, // Incluir data de nascimento
        role: 'employee', // Pessoa física = employee
        tenantId: null, // Individual user
        isActive: false, // CONTA INATIVA ATÉ VALIDAÇÃO
        planType: plan,
        planCycle: cycle,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        trialPlan: 'premium', // TRIAL SEMPRE NO PREMIUM - Estratégia para conversão
        isTrialActive: true,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date()
      });

      // Gerar tokens de verificação
      const emailToken = randomBytes(32).toString('hex');
      const phoneToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos

      // Salvar tokens de verificação
      await storage.createVerificationTokens({
        userId: user.id,
        emailToken,
        phoneToken,
        phone,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h para verificar
      });

      // TODO: Enviar email de verificação
      console.log(`📧 Email verification token para ${email}: ${emailToken}`);
      
      // TODO: Enviar SMS de verificação  
      console.log(`📱 Phone verification token para ${phone}: ${phoneToken}`);

      res.status(201).json({
        success: true,
        message: "Conta criada! Verifique seu email e telefone para ativar.",
        userId: user.id,
        trialEndsAt: user.trialEndsAt,
        nextSteps: {
          email: "Enviamos um link de verificação para seu email",
          phone: "Enviamos um código via SMS para seu telefone"
        }
      });

    } catch (error) {
      console.error('Trial signup error:', error);
      res.status(500).json({ 
        message: "Erro interno do servidor. Tente novamente." 
      });
    }
  });

  // Rota para verificação de email
  app.get("/api/auth/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      const verification = await storage.getVerificationToken(token, 'email');
      if (!verification) {
        return res.status(400).json({ 
          message: "Token de verificação inválido ou expirado" 
        });
      }

      // Marcar email como verificado
      await storage.verifyUserEmail(verification.userId);
      await storage.deleteVerificationToken(token, 'email');

      // Verificar se conta pode ser ativada (email + phone verificados)
      const user = await storage.getUser(verification.userId);
      if (user?.phoneVerified) {
        await storage.activateUser(verification.userId);
      }

      res.json({
        success: true,
        message: "Email verificado com sucesso!",
        accountActivated: user?.phoneVerified || false
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: "Erro ao verificar email" });
    }
  });

  // Rota para verificação de telefone
  app.post("/api/auth/verify-phone", async (req, res) => {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({ 
          message: "Telefone e código são obrigatórios" 
        });
      }

      const verification = await storage.getPhoneVerification(phone, code);
      if (!verification) {
        return res.status(400).json({ 
          message: "Código de verificação inválido ou expirado" 
        });
      }

      // Marcar telefone como verificado
      await storage.verifyUserPhone(verification.userId);
      await storage.deletePhoneVerification(phone, code);

      // Verificar se conta pode ser ativada (email + phone verificados)
      const user = await storage.getUser(verification.userId);
      if (user?.emailVerified) {
        await storage.activateUser(verification.userId);
      }

      res.json({
        success: true,
        message: "Telefone verificado com sucesso!",
        accountActivated: user?.emailVerified || false
      });

    } catch (error) {
      console.error('Phone verification error:', error);
      res.status(500).json({ message: "Erro ao verificar telefone" });
    }
  });

  // Rota para verificar status do trial
  app.get("/api/auth/trial-status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const user = req.user as any;
      const now = new Date();
      const trialEnded = user.trialEndsAt && new Date(user.trialEndsAt) < now;

      res.json({
        success: true,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          planType: user.planType,
          planCycle: user.planCycle,
          trialPlan: user.trialPlan,
          isTrialActive: user.isTrialActive && !trialEnded,
          trialEndsAt: user.trialEndsAt,
          trialDaysLeft: user.trialEndsAt ? Math.max(0, Math.ceil((new Date(user.trialEndsAt) - now) / (1000 * 60 * 60 * 24))) : 0,
          needsPayment: trialEnded && user.isTrialActive,
          currentAccess: user.isTrialActive && !trialEnded ? user.trialPlan : user.planType
        }
      });

    } catch (error) {
      console.error('Trial status error:', error);
      res.status(500).json({ message: "Erro ao verificar status do trial" });
    }
  });

  // Rota para cancelar trial (antes dos 7 dias)
  app.post("/api/auth/cancel-trial", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const user = req.user as any;
      
      // Desativar trial e conta
      await storage.cancelUserTrial(user.id);

      res.json({
        success: true,
        message: "Trial cancelado com sucesso. Sua conta será desativada em 7 dias."
      });

    } catch (error) {
      console.error('Cancel trial error:', error);
      res.status(500).json({ message: "Erro ao cancelar trial" });
    }
  });

  // Rota para campanhas promocionais durante trial
  app.get("/api/auth/trial-campaigns", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const user = req.user as any;
      
      if (!user.isTrialActive || !user.trialEndsAt) {
        return res.json({
          success: true,
          campaigns: [],
          message: "Usuário não está em trial ativo"
        });
      }

      const now = new Date();
      const trialStart = new Date(user.createdAt);
      const trialEnd = new Date(user.trialEndsAt);
      const daysInTrial = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
      const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

      const campaigns = [];

      // CAMPANHA DIA 3: Desconto no plano anual
      if (daysInTrial === 3) {
        campaigns.push({
          type: 'discount_annual',
          title: 'Oferta Especial: 1 Mês Grátis!',
          message: 'Assine o plano anual agora e ganhe 1 mês grátis. Apenas hoje!',
          discount: '1 mês grátis',
          urgency: 'Oferta válida apenas hoje',
          cta: 'Aproveitar Oferta',
          backgroundColor: 'bg-gradient-to-r from-green-500 to-emerald-600'
        });
      }

      // CAMPANHA DIA 4: Desconto adicional 
      if (daysInTrial === 4) {
        campaigns.push({
          type: 'discount_percentage',
          title: 'Última Chance: 20% OFF!',
          message: 'Assine agora e ganhe 20% de desconto permanente em qualquer plano.',
          discount: '20% OFF para sempre',
          urgency: 'Restam apenas 3 dias de trial',
          cta: 'Garantir Desconto',
          backgroundColor: 'bg-gradient-to-r from-purple-500 to-pink-600'
        });
      }

      // CAMPANHA DIA 6: Urgência final
      if (daysInTrial >= 6) {
        campaigns.push({
          type: 'urgency_final',
          title: 'Seu trial expira em breve!',
          message: `Restam apenas ${daysLeft} dia(s). Continue aproveitando todas as funcionalidades Premium.`,
          discount: 'Preço especial trial',
          urgency: `Expira em ${daysLeft} dia(s)`,
          cta: 'Continuar Premium',
          backgroundColor: 'bg-gradient-to-r from-red-500 to-orange-600'
        });
      }

      res.json({
        success: true,
        campaigns,
        trialInfo: {
          daysInTrial,
          daysLeft,
          trialPlan: user.trialPlan,
          selectedPlan: user.planType,
          selectedCycle: user.planCycle
        }
      });

    } catch (error) {
      console.error('Trial campaigns error:', error);
      res.status(500).json({ message: "Erro ao buscar campanhas" });
    }
  });
}

export { hashPassword, comparePasswords, isValidCPF };