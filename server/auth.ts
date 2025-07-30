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
    interface User extends User {}
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

          const isValidPassword = await comparePasswords(password, user.password);
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

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
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
      const { password: _, ...userWithoutPassword } = user;

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
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Credenciais inválidas" 
        });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove senha do retorno
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
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
    const { password: _, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

export { hashPassword, comparePasswords, isValidCPF };