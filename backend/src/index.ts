import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from './db';
import { users, inspirations } from './db/schema';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { uploadToR2 } from './services/r2.service';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const app = new Elysia()
  .use(cors({
    origin: true, // Allow all origins for dev
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'BuildProduct.net API',
        version: '1.0.0',
        description: 'High-performance API built with Bun + Elysia + PostgreSQL'
      }
    }
  }))

  // Health check
  .get('/', () => ({
    message: 'BuildProduct.net API ⚡️',
    runtime: 'Bun',
    framework: 'Elysia',
    database: 'PostgreSQL (Neon)',
    status: 'running'
  }))

  .get('/status', () => ({
    status: 'ok',
    runtime: 'bun',
    timestamp: new Date().toISOString()
  }))

  // Auth Routes
  .group('/auth', (app) => app
    // Register
    .post('/register', async ({ body, set }) => {
      try {
        const { email, password, name } = body;

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
          set.status = 400;
          return { error: 'Email already registered' };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const [newUser] = await db.insert(users).values({
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          provider: 'email'
        }).returning();

        // Generate JWT
        const token = jwt.sign(
          { userId: newUser.id, email: newUser.email, role: newUser.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          message: 'Registration successful',
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        };
      } catch (error) {
        set.status = 500;
        return { error: 'Registration failed', details: error };
      }
    }, {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
        name: t.String()
      })
    })

    // Login
    .post('/login', async ({ body, set }) => {
      try {
        const { email, password } = body;

        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user || !user.password) {
          set.status = 401;
          return { error: 'Invalid credentials' };
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          set.status = 401;
          return { error: 'Invalid credentials' };
        }

        // Generate JWT
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        return {
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        };
      } catch (error) {
        set.status = 500;
        return { error: 'Login failed', details: error };
      }
    }, {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String()
      })
    })

    // Get current user (protected route example)
    .get('/me', async ({ headers, set }) => {
      try {
        const authHeader = headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          set.status = 401;
          return { error: 'Unauthorized' };
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
        if (!user) {
          set.status = 404;
          return { error: 'User not found' };
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        };
      } catch (error) {
        set.status = 401;
        return { error: 'Invalid token' };
      }
    })
  )

  // Media Upload Routes
  .group('/media', (app) => app
    .post('/upload', async ({ body, set }) => {
      try {
        const { file, folder } = body;

        if (!file) {
          set.status = 400;
          return { error: 'No file provided' };
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2
        const result = await uploadToR2(buffer, file.name, folder);

        if (!result.success) {
          set.status = 500;
          return { error: result.error };
        }

        return {
          message: 'File uploaded successfully',
          url: result.url,
          key: result.key
        };
      } catch (error) {
        set.status = 500;
        return { error: 'Upload failed', details: error };
      }
    }, {
      body: t.Object({
        file: t.File(),
        folder: t.Optional(t.String())
      })
    })
  )

  // Inspirations Routes
  .group('/inspirations', (app) => app
    // Get all inspirations
    .get('/', async ({ query, set }) => {
      try {
        const { category, type } = query;
        let q = db.select().from(inspirations).orderBy(desc(inspirations.createdAt));

        if (category) {
          // @ts-ignore
          q = q.where(eq(inspirations.category, category));
        }

        const data = await q;
        return data;
      } catch (error) {
        console.error('Error fetching inspirations:', error);
        set.status = 500;
        return { error: 'Internal Server Error' };
      }
    }, {
      query: t.Object({
        category: t.Optional(t.String()),
        type: t.Optional(t.String()) // For further filters if needed
      })
    })

    // Create new inspiration (Protected)
    .post('/', async ({ body, headers, set }) => {
      try {
        // Simple auth check (expand this later with centralized middleware)
        const authHeader = headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          set.status = 401;
          return { error: 'Unauthorized' };
        }

        // Add item
        const [newItem] = await db.insert(inspirations).values(body).returning();
        return newItem;
      } catch (error) {
        set.status = 500;
        return { error: 'Failed to create inspiration', details: error };
      }
    }, {
      body: t.Object({
        name: t.String(),
        website: t.String(),
        category: t.Optional(t.String()),
        tags: t.Optional(t.String()),
        style: t.Optional(t.String()),
        field: t.Optional(t.String()),
        rating: t.Optional(t.String()),
        country: t.Optional(t.String()),
        description: t.Optional(t.String()),
        thumbnail: t.Optional(t.String())
      })
    })
  )

  .listen(3040);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger docs: http://localhost:3040/swagger`);
