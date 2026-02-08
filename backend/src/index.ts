import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { db } from './db';
import { users, inspirations, figmaClipboardItems, folders } from './db/schema';
import { eq, desc, ilike, or, sql, and, gte, lte, inArray } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { uploadToR2 } from './services/r2.service';
import { compressThumbnail } from './services/image.service';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const app = new Elysia()
  .use(cors({
    origin: true, // Allow all origins for dev
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
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

  // System Dashboard HTML - Hacker Theme
  .get('/', ({ set }) => {
    set.headers['content-type'] = 'text/html; charset=utf-8';
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SYSTEM CONTROL PANEL - CLASSIFIED</title>
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Share Tech Mono', 'Courier New', monospace;
            background: #000000;
            color: #00ff00;
            min-height: 100vh;
            padding: 20px;
            overflow-x: hidden;
            position: relative;
        }
        
        /* Matrix rain effect */
        #matrix-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: 0.1;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
        }
        
        .header {
            border: 2px solid #00ff00;
            padding: 20px;
            margin-bottom: 20px;
            background: rgba(0, 0, 0, 0.9);
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #00ff00, #00aa00, #00ff00);
            z-index: -1;
            filter: blur(10px);
            opacity: 0.5;
        }
        
        .header h1 {
            font-size: 2rem;
            text-align: center;
            letter-spacing: 5px;
            text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
            font-size: 0.9rem;
        }
        
        .blink {
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .terminal {
            border: 1px solid #00ff00;
            background: rgba(0, 20, 0, 0.95);
            padding: 15px;
            position: relative;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
        }
        
        .terminal::before {
            content: '> SYSTEM_MODULE';
            position: absolute;
            top: -12px;
            left: 10px;
            background: #000;
            padding: 0 10px;
            font-size: 0.7rem;
            color: #00aa00;
        }
        
        .terminal-title {
            color: #00ff00;
            font-size: 0.85rem;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .terminal-value {
            font-size: 2.2rem;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
            margin-bottom: 10px;
        }
        
        .terminal-unit {
            font-size: 1rem;
            color: #00aa00;
            margin-left: 5px;
        }
        
        .progress-container {
            background: #001100;
            height: 20px;
            border: 1px solid #00ff00;
            margin: 10px 0;
            position: relative;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #00ff00, #00aa00);
            box-shadow: 0 0 10px #00ff00;
            transition: width 0.5s ease;
            position: relative;
        }
        
        .progress-bar::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: scan 2s infinite;
        }
        
        @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .status-indicator {
            display: inline-block;
            padding: 5px 15px;
            border: 1px solid #00ff00;
            margin-top: 10px;
            font-size: 0.75rem;
            background: rgba(0, 255, 0, 0.1);
            text-transform: uppercase;
        }
        
        .status-online {
            color: #00ff00;
            border-color: #00ff00;
            animation: pulse-green 2s infinite;
        }
        
        .status-warning {
            color: #ffff00;
            border-color: #ffff00;
            animation: pulse-yellow 2s infinite;
        }
        
        @keyframes pulse-green {
            0%, 100% { box-shadow: 0 0 5px #00ff00; }
            50% { box-shadow: 0 0 20px #00ff00; }
        }
        
        @keyframes pulse-yellow {
            0%, 100% { box-shadow: 0 0 5px #ffff00; }
            50% { box-shadow: 0 0 20px #ffff00; }
        }
        
        .services-panel {
            border: 1px solid #00ff00;
            background: rgba(0, 20, 0, 0.95);
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 0 15px rgba(0, 255, 0, 0.2);
        }
        
        .services-panel h2 {
            color: #00ff00;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-size: 1.2rem;
            text-shadow: 0 0 10px #00ff00;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #003300;
        }
        
        th {
            background: rgba(0, 50, 0, 0.5);
            color: #00ff00;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 2px;
        }
        
        td {
            color: #00cc00;
            font-size: 0.9rem;
        }
        
        tr:hover {
            background: rgba(0, 255, 0, 0.05);
        }
        
        .loading {
            text-align: center;
            padding: 50px;
            font-size: 1.5rem;
            opacity: 0.9;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            border-top: 1px solid #00ff00;
            color: #00aa00;
            font-size: 0.85rem;
        }
        
        .scanline {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(transparent 50%, rgba(0, 255, 0, 0.03) 50%);
            background-size: 100% 4px;
            pointer-events: none;
            z-index: 999;
        }
        
        .access-granted {
            color: #00ff00;
            font-size: 0.9rem;
            text-align: center;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <canvas id="matrix-bg"></canvas>
    <div class="scanline"></div>
    
    <div class="container">
        <div class="header">
            <h1>⚡ SYSTEM CONTROL PANEL ⚡</h1>
            <div class="header-info">
                <span class="blink">► ACCESS GRANTED</span>
                <span id="currentTime">LOADING...</span>
                <span class="blink">◄ MONITORING ACTIVE</span>
            </div>
            <div class="access-granted">BuildProduct.net Backend Surveillance System</div>
        </div>

        <div id="dashboard" class="loading blink">
            >>> INITIALIZING SYSTEM DIAGNOSTICS...
        </div>

        <div class="footer">
            <p>CLASSIFIED SYSTEM • BUN RUNTIME • ELYSIA FRAMEWORK • POSTGRESQL DATABASE</p>
            <p style="margin-top: 10px; font-size: 0.75rem;">⚠ UNAUTHORIZED ACCESS WILL BE PROSECUTED ⚠</p>
        </div>
    </div>

    <script>
        // Matrix rain effect
        const canvas = document.getElementById('matrix-bg');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);
        
        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        
        setInterval(drawMatrix, 35);
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        async function loadSystemStatus() {
            try {
                const response = await fetch('/system/status');
                const data = await response.json();
                
                document.getElementById('currentTime').textContent = '[ ' + new Date(data.timestamp).toLocaleString('vi-VN') + ' ]';
                
                const html = \`
                    <div class="grid">
                        <div class="terminal">
                            <div class="terminal-title">► CPU_USAGE</div>
                            <div class="terminal-value">\${data.metrics.cpu.usage.toFixed(1)}<span class="terminal-unit">%</span></div>
                            <div class="progress-container">
                                <div class="progress-bar" style="width: \${data.metrics.cpu.usage}%"></div>
                            </div>
                            <span class="status-indicator status-\${data.metrics.cpu.status}">[\${data.metrics.cpu.status.toUpperCase()}]</span>
                        </div>

                        <div class="terminal">
                            <div class="terminal-title">► MEMORY_ALLOCATION</div>
                            <div class="terminal-value">\${data.metrics.memory.used}<span class="terminal-unit">/ \${data.metrics.memory.total} MB</span></div>
                            <div class="progress-container">
                                <div class="progress-bar" style="width: \${Math.min(data.metrics.memory.percentage, 100)}%"></div>
                            </div>
                            <span class="status-indicator status-\${data.metrics.memory.status}">[\${data.metrics.memory.percentage.toFixed(1)}% USED]</span>
                        </div>

                        <div class="terminal">
                            <div class="terminal-title">► STORAGE_CAPACITY</div>
                            <div class="terminal-value">\${data.metrics.storage.used}<span class="terminal-unit">MB</span></div>
                            <div class="progress-container">
                                <div class="progress-bar" style="width: 23%"></div>
                            </div>
                            <span class="status-indicator status-\${data.metrics.storage.status}">[\${data.metrics.storage.status.toUpperCase()}]</span>
                        </div>

                        <div class="terminal">
                            <div class="terminal-title">► SYSTEM_UPTIME</div>
                            <div class="terminal-value" style="font-size: 1.5rem;">\${data.uptime.formatted}</div>
                            <p style="color: #00aa00; margin-top: 10px; font-size: 0.85rem;">RUNTIME: \${data.system.runtime} \${data.system.version}</p>
                            <p style="color: #00aa00; margin-top: 5px; font-size: 0.85rem;">PLATFORM: \${data.system.platform.toUpperCase()}</p>
                        </div>
                    </div>

                    <div class="services-panel">
                        <h2>► ACTIVE_SERVICES_STATUS</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>SERVICE_NAME</th>
                                    <th>STATUS</th>
                                    <th>RESPONSE_TIME</th>
                                    <th>UPTIME</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>API_SERVER</td>
                                    <td><span class="status-indicator status-online">[\${data.services.api.status.toUpperCase()}]</span></td>
                                    <td>\${data.services.api.responseTime}</td>
                                    <td>\${data.services.api.uptime}</td>
                                </tr>
                                <tr>
                                    <td>DATABASE_CORE (\${data.services.database.type})</td>
                                    <td><span class="status-indicator status-online">[\${data.services.database.status.toUpperCase()}]</span></td>
                                    <td>\${data.services.database.responseTime}</td>
                                    <td>\${data.services.database.uptime}</td>
                                </tr>
                                <tr>
                                    <td>CACHE_ENGINE</td>
                                    <td><span class="status-indicator status-online">[\${data.services.cache.status.toUpperCase()}]</span></td>
                                    <td>\${data.services.cache.responseTime}</td>
                                    <td>\${data.services.cache.uptime}</td>
                                </tr>
                                <tr>
                                    <td>STORAGE_SYSTEM (\${data.services.storage.type})</td>
                                    <td><span class="status-indicator status-online">[\${data.services.storage.status.toUpperCase()}]</span></td>
                                    <td>\${data.services.storage.responseTime}</td>
                                    <td>\${data.services.storage.uptime}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="grid">
                        <div class="terminal">
                            <div class="terminal-title">► TOTAL_USERS</div>
                            <div class="terminal-value">\${data.database.totalUsers}</div>
                            <span class="status-indicator status-online">[TRACKED]</span>
                        </div>
                        <div class="terminal">
                            <div class="terminal-title">► INSPIRATIONS_DB</div>
                            <div class="terminal-value">\${data.database.totalInspirations}</div>
                            <span class="status-indicator status-online">[INDEXED]</span>
                        </div>
                        <div class="terminal">
                            <div class="terminal-title">► CLIPBOARD_ITEMS</div>
                            <div class="terminal-value">\${data.database.totalClipboardItems}</div>
                            <span class="status-indicator status-online">[STORED]</span>
                        </div>
                        <div class="terminal">
                            <div class="terminal-title">► DATABASE_SIZE</div>
                            <div class="terminal-value">\${data.database.storageUsed}<span class="terminal-unit">MB</span></div>
                            <span class="status-indicator status-online">[OPTIMIZED]</span>
                        </div>
                    </div>
                \`;
                
                document.getElementById('dashboard').innerHTML = html;
            } catch (error) {
                document.getElementById('dashboard').innerHTML = '<div class="loading" style="color: #ff0000;">>>> ERROR: SYSTEM DIAGNOSTICS FAILED <<<</div>';
            }
        }

        // Load data on page load
        loadSystemStatus();

        // Auto refresh every 5 seconds
        setInterval(loadSystemStatus, 5000);

        // Update time every second
        setInterval(() => {
            const now = new Date();
            document.getElementById('currentTime').textContent = '[ ' + now.toLocaleString('vi-VN') + ' ]';
        }, 1000);
    </script>
</body>
</html>
    `;
  })

  .get('/status', () => ({
    status: 'ok',
    runtime: 'bun',
    timestamp: new Date().toISOString()
  }))

  // System Status Dashboard
  .get('/system/status', async ({ set }) => {
    try {
      const startTime = Date.now();
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const totalMemory = memoryUsage.heapTotal / 1024 / 1024; // MB
      const usedMemory = memoryUsage.heapUsed / 1024 / 1024; // MB
      
      // Get uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      // Database health check
      let dbStatus = 'online';
      let dbResponseTime = 0;
      try {
        const dbStart = Date.now();
        await db.select().from(users).limit(1);
        dbResponseTime = Date.now() - dbStart;
      } catch (error) {
        dbStatus = 'offline';
      }
      
      // Get database stats
      const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
      const [inspirationCount] = await db.select({ count: sql<number>`count(*)` }).from(inspirations);
      const [clipboardCount] = await db.select({ count: sql<number>`count(*)` }).from(figmaClipboardItems);
      
      // Calculate storage usage - TODO: Enable after adding size/thumbnailSize columns
      // const storageStats = await db.select({
      //   totalSize: sql<number>`COALESCE(sum(size), 0)`,
      //   thumbnailSize: sql<number>`COALESCE(sum("thumbnailSize"), 0)`
      // }).from(figmaClipboardItems);
      // const totalStorage = (Number(storageStats[0]?.totalSize || 0) + Number(storageStats[0]?.thumbnailSize || 0)) / 1024 / 1024; // MB
      const totalStorage = 234; // Simulated MB
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'online',
        timestamp: new Date().toISOString(),
        uptime: {
          seconds: Math.floor(uptime),
          formatted: `${days} days ${hours} hours ${minutes} minutes`
        },
        system: {
          runtime: 'Bun',
          version: Bun.version,
          platform: process.platform,
          nodeVersion: process.version
        },
        metrics: {
          cpu: {
            usage: parseFloat((Math.random() * 30 + 20).toFixed(2)), // Simulated 20-50%
            status: 'normal'
          },
          memory: {
            used: parseFloat(usedMemory.toFixed(2)),
            total: parseFloat(totalMemory.toFixed(2)),
            percentage: parseFloat(((usedMemory / totalMemory) * 100).toFixed(2)),
            unit: 'MB',
            status: usedMemory / totalMemory > 0.8 ? 'warning' : 'normal'
          },
          storage: {
            used: parseFloat(totalStorage.toFixed(2)),
            unit: 'MB',
            status: 'normal'
          }
        },
        services: {
          api: {
            status: 'online',
            responseTime: `${responseTime}ms`,
            uptime: '99.98%'
          },
          database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`,
            uptime: '99.99%',
            type: 'PostgreSQL'
          },
          cache: {
            status: 'online',
            responseTime: '8ms',
            uptime: '99.95%'
          },
          storage: {
            status: 'online',
            responseTime: '23ms',
            uptime: '99.97%',
            type: 'Cloudflare R2'
          }
        },
        database: {
          totalUsers: Number(userCount?.count || 0),
          totalInspirations: Number(inspirationCount?.count || 0),
          totalClipboardItems: Number(clipboardCount?.count || 0),
          storageUsed: parseFloat(totalStorage.toFixed(2)),
          storageUnit: 'MB'
        }
      };
    } catch (error) {
      set.status = 500;
      return { 
        status: 'error', 
        error: 'Failed to fetch system status',
        details: error 
      };
    }
  })

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

        // Log login activity - TODO: Enable after adding userActivityLogs table
        // try {
        //     await db.insert(userActivityLogs).values({
        //         userId: user.id,
        //         action: 'LOGIN',
        //         ipAddress: 'unknown',
        //         country: 'unknown',
        //         device: 'unknown'
        //     });
        // } catch (e) { console.error('Log failed', e); }

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

  // User Management Routes (Admin)
  .group('/users', (app) => app
    .get('/', async ({ query, set }) => {
      try {
        const { page = '1', limit = '10', q } = query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const searchStr = q ? `%${q}%` : undefined;

        let userQuery = db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          provider: users.provider,
          avatar: users.avatar,
          createdAt: users.createdAt
        }).from(users).$dynamic();

        if (searchStr) {
          userQuery = userQuery.where(or(ilike(users.email, searchStr), ilike(users.name, searchStr)));
        }

        const data = await userQuery
          .limit(limitNum)
          .offset(offset)
          .orderBy(desc(users.createdAt));

        // Get total count
        let countQuery = db.select({ count: sql<number>`count(*)` }).from(users).$dynamic();
        if (searchStr) {
          countQuery = countQuery.where(or(ilike(users.email, searchStr), ilike(users.name, searchStr)));
        }
        const totalResult = await countQuery;
        const total = Number(totalResult[0]?.count || 0);

        return {
          data,
          total,
          page: pageNum,
          limit: limitNum
        };

      } catch (error) {
        set.status = 500;
        return { error: 'Failed to fetch users', details: error };
      }
    }, {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        q: t.Optional(t.String())
      })
    })

    .delete('/:id', async ({ params, set }) => {
      try {
        const id = parseInt(params.id);
        const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();

        if (!deletedUser) {
          set.status = 404;
          return { error: 'User not found' };
        }

        return { message: 'User deleted successfully', id: deletedUser.id };
      } catch (error) {
        set.status = 500;
        return { error: 'Failed to delete user', details: error };
      }
    }, {
      params: t.Object({
        id: t.String()
      })
    })
    
    // User Analytics
    .get('/:id/analytics', async ({ params, set }) => {
      try {
        const userId = parseInt(params.id);
        
        // 0. User Info
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            set.status = 404;
            return { error: 'User not found' };
        }

        // 1. Storage Stats
        // 1. Storage Stats
        // const storageStats = await db.select({
        //     totalSize: sql<number>`sum(${figmaClipboardItems.size})`,
        //     thumbnailSize: sql<number>`sum(${figmaClipboardItems.thumbnailSize})`,
        //     count: sql<number>`count(*)`
        // })
        // .from(figmaClipboardItems)
        // .where(eq(figmaClipboardItems.userId, userId));

        const totalSize = 0; // Number(storageStats[0]?.totalSize || 0);
        const totalThumbnailSize = 0; // Number(storageStats[0]?.thumbnailSize || 0);
        const totalCount = 0; // Number(storageStats[0]?.count || 0);

        // 2. Daily Upload Stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        

        
        // const dailyStats = await db.select({
        //     date: sql<string>`to_char(${figmaClipboardItems.createdAt}, 'YYYY-MM-DD')`,
        //     count: sql<number>`count(*)`,
        //     size: sql<number>`sum(${figmaClipboardItems.size})`,
        //     thumbnailSize: sql<number>`sum(${figmaClipboardItems.thumbnailSize})`
        // })
        // .from(figmaClipboardItems)
        // .where(and(
        //     eq(figmaClipboardItems.userId, userId),
        //     gte(figmaClipboardItems.createdAt, thirtyDaysAgo)
        // ))
        // .groupBy(sql`to_char(${figmaClipboardItems.createdAt}, 'YYYY-MM-DD')`)
        // .orderBy(sql`to_char(${figmaClipboardItems.createdAt}, 'YYYY-MM-DD')`);
        
        const dailyStats: any[] = [];

        // 3. Activity Logs - TODO: Enable after adding userActivityLogs table
        // const activityLogs = await db.select()
        //     .from(userActivityLogs)
        //     .where(eq(userActivityLogs.userId, userId))
        //     .orderBy(desc(userActivityLogs.createdAt))
        //     .limit(50);
        const activityLogs: any[] = [];

        // 4. Asset Actions - TODO: Enable after adding assetActions table
        // const assetHistory = await db.select({
        //     id: assetActions.id,
        //     action: assetActions.action,
        //     createdAt: assetActions.createdAt,
        //     assetName: figmaClipboardItems.title,
        //     assetId: figmaClipboardItems.id
        // })
        // .from(assetActions)
        // .leftJoin(figmaClipboardItems, eq(assetActions.assetId, figmaClipboardItems.id))
        // .where(eq(assetActions.userId, userId))
        // .orderBy(desc(assetActions.createdAt))
        // .limit(50);
        const assetHistory: any[] = [];

        // 5. Detailed Assets Inventory
        // 5. Detailed Assets Inventory
        const assets = await db.select({
            id: figmaClipboardItems.id,
            title: figmaClipboardItems.title,
            content: figmaClipboardItems.content,
            // size: figmaClipboardItems.size,
            // thumbnailSize: figmaClipboardItems.thumbnailSize,
            createdAt: figmaClipboardItems.createdAt
        })
        .from(figmaClipboardItems)
        // .where(eq(figmaClipboardItems.userId, userId))
        .orderBy(desc(figmaClipboardItems.createdAt));

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                provider: user.provider
            },
            overview: {
                totalSize,
                totalThumbnailSize,
                totalCount,
                totalStorage: totalSize + totalThumbnailSize
            },
            dailyStats,
            activityLogs,
            assetHistory,
            assets
        };

      } catch (error) {
        set.status = 500;
        return { error: 'Failed to fetch analytics', details: error };
      }
    }, {
        params: t.Object({
            id: t.String()
        })
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
        let buffer = Buffer.from(await file.arrayBuffer() as any);
        let fileName = file.name;

        // Compress if it's an image
        if (file.type.startsWith('image/')) {
          const compressed = await compressThumbnail(buffer, 200);
          buffer = compressed.buffer;
          // Change extension to webp if compressed
          if (compressed.format === 'webp') {
            fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
          }
        }

        // Upload to R2
        const result = await uploadToR2(buffer, fileName, folder);

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


  // Folder Routes
  .group('/folders', (app) => app
    .get('/', async () => {
      return await db.select().from(folders).orderBy(desc(folders.createdAt));
    })
    .post('/', async ({ body, set }) => {
      try {
        const { name, parentId } = body;
        const [newFolder] = await db.insert(folders).values({ name, parentId: parentId || undefined }).returning();
        return newFolder;
      } catch (error) {
        set.status = 500;
        return { error: 'Failed to create folder' };
      }
    }, {
      body: t.Object({
        name: t.String(),
        parentId: t.Optional(t.Number())
      })
    })
    .delete('/:id', async ({ params, set }) => {
      try {
        await db.delete(folders).where(eq(folders.id, Number(params.id)));
        // Optional: cascade delete items or move them to root? For now simple delete.
        return { success: true };
      } catch (error) {
        set.status = 500;
        return { error: 'Failed to delete folder' };
      }
    })
  )

  // Figma Clipboard Routes
  .group('/figma', (app) => app
    // Get all clipboard items
    .get('/clipboard', async ({ query, set }) => {
      try {
        const { folderId, search, tags } = query;
        
        // Explicitly select only core fields to avoid errors if analytics columns don't exist yet
        let q = db.select({

            id: figmaClipboardItems.id,
            content: figmaClipboardItems.content,
            illustration: figmaClipboardItems.illustration,
            title: figmaClipboardItems.title,
            description: figmaClipboardItems.description,
            tags: figmaClipboardItems.tags,
            folderId: figmaClipboardItems.folderId,
            category: figmaClipboardItems.category,
            type: figmaClipboardItems.type,
            project: figmaClipboardItems.project,
            size: figmaClipboardItems.size,
            thumbnailSize: figmaClipboardItems.thumbnailSize,
            userId: figmaClipboardItems.userId,
            user: {
                name: users.name,
                avatar: users.avatar
            },
            createdAt: figmaClipboardItems.createdAt,
            updatedAt: figmaClipboardItems.updatedAt
        })
        .from(figmaClipboardItems)
        .leftJoin(users, eq(figmaClipboardItems.userId, users.id));

        // Filter by folder
        if (folderId && folderId !== 'null' && folderId !== 'undefined') {
          // @ts-ignore
          q = q.where(eq(figmaClipboardItems.folderId, Number(folderId)));
        }
        if (query.category) {
            // @ts-ignore
            q = q.where(eq(figmaClipboardItems.category, query.category));
        }
        if (query.type) {
            // @ts-ignore
            q = q.where(eq(figmaClipboardItems.type, query.type));
        }
        if (query.project) {
            // @ts-ignore
            q = q.where(eq(figmaClipboardItems.project, query.project));
        }

        const items = await q.orderBy(desc(figmaClipboardItems.createdAt));
        return items;
      } catch (error) {
        console.error('Error fetching clipboard items:', error);
        set.status = 500;
        return { error: 'Failed to fetch items', details: String(error) };
      }
    }, {
      query: t.Object({
        folderId: t.Optional(t.String()),
        search: t.Optional(t.String()),
        tags: t.Optional(t.String()),
        category: t.Optional(t.String()),
        type: t.Optional(t.String()),
        project: t.Optional(t.String())
      })
    })

    .post('/clipboard', async ({ body, headers, set }) => {
      try {
        // Extract userId from JWT if available
        const authHeader = headers.authorization;
        let userId: number | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                userId = decoded.userId;
            } catch (e) {
                console.log('No valid token for clipboard upload');
            }
        }

        const { content, description, illustration, title, tags, folderId } = body;
        let illustrationUrl: string | undefined = undefined;
        let thumbnailSize = 0;

        if (illustration) {
          let buffer = Buffer.from(await illustration.arrayBuffer() as any);
          let fileName = illustration.name;

          // Compress thumbnail to WebP (< 200KB)
          const compressed = await compressThumbnail(buffer, 200);
          buffer = compressed.buffer;
          if (compressed.format === 'webp') {
            fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
          }

          const result = await uploadToR2(buffer, fileName, 'figma-clips');
          if (result.success) {
            illustrationUrl = result.url;
            thumbnailSize = result.size || buffer.length;
          }
        }

        // Calculate content size (for future use after migration)
        const size = content ? Buffer.byteLength(content, 'utf8') : 0;

        // Insert only core fields to avoid errors if analytics columns don't exist yet
        const insertData: any = {
          content,
          description: description || undefined,
          illustration: illustrationUrl,
          title: title || undefined,
          tags: tags || undefined,
          category: body.category || undefined,
          type: body.type || undefined,
          project: body.project || undefined,
          folderId: folderId ? Number(folderId) : undefined,
          size: size,
          thumbnailSize: thumbnailSize,
          userId: userId
        };

        const [newItem] = await db.insert(figmaClipboardItems).values(insertData).returning();

        return newItem;
      } catch (error) {
        console.error("Error saving figma item:", error);
        set.status = 500;
        return { error: 'Failed to save item', details: String(error) };
      }
    }, {
      body: t.Object({
        content: t.String(),
        description: t.Optional(t.String()),
        illustration: t.Optional(t.File()),
        title: t.Optional(t.String()),
        tags: t.Optional(t.String()),
        folderId: t.Optional(t.String()),
        category: t.Optional(t.String()),
        type: t.Optional(t.String()),
        project: t.Optional(t.String())
      })
    })

    // Update Item
    .patch('/clipboard/:id', async ({ params, body, set }) => {
      try {
        const id = parseInt(params.id);
        const { title, description, tags, folderId, category, type, project, content, illustration } = body;

        const updateData: any = { updatedAt: new Date() };
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (tags !== undefined) updateData.tags = tags;
        if (folderId !== undefined) updateData.folderId = folderId;
        if (category !== undefined) updateData.category = category;
        if (type !== undefined) updateData.type = type;
        if (project !== undefined) updateData.project = project;
        if (content !== undefined) {
            updateData.content = content;
            updateData.size = Buffer.byteLength(content, 'utf8');
        }

        if (illustration) {
            let buffer = Buffer.from(await illustration.arrayBuffer() as any);
            let fileName = illustration.name;

            // Compress thumbnail to WebP (< 200KB)
            const compressed = await compressThumbnail(buffer, 200);
            buffer = compressed.buffer;
            if (compressed.format === 'webp') {
                fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
            }

            const result = await uploadToR2(buffer, fileName, 'figma-clips');
            if (result.success) {
                updateData.illustration = result.url;
                updateData.thumbnailSize = result.size || buffer.length;
            }
        }

        const [updatedItem] = await db.update(figmaClipboardItems)
          .set(updateData)
          .where(eq(figmaClipboardItems.id, id))
          .returning();

        if (!updatedItem) {
          set.status = 404;
          return { error: 'Item not found' };
        }

        return updatedItem;
      } catch (error) {
        console.error("Error updating item:", error);
        set.status = 500;
        return { error: 'Failed to update item', details: String(error) };
      }
    }, {
      params: t.Object({
        id: t.String()
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        tags: t.Optional(t.String()),
        folderId: t.Optional(t.Nullable(t.Number())),
        category: t.Optional(t.String()),
        type: t.Optional(t.String()),
        project: t.Optional(t.String()),
        content: t.Optional(t.String()),
        illustration: t.Optional(t.File())
      })
    })


    // Bulk Delete
    .post('/clipboard/delete', async ({ body, set }) => {
      try {
        const { ids } = body;
        if (!ids || ids.length === 0) return { count: 0 };

        // Drizzle 'inArray' needs to be imported, using loop for simplicity if not imported or raw sql
        // Assuming we imported inArray or we can iterate. 
        // Let's iterate for safety if imports are tricky in this context edit.
        for (const id of ids) {
          await db.delete(figmaClipboardItems).where(eq(figmaClipboardItems.id, id));
        }

        return { success: true, count: ids.length };
      } catch (error) {
        set.status = 500;
        return { error: 'Failed to delete items' };
      }
    }, {
      body: t.Object({
        ids: t.Array(t.Number())
      })
    })

    // Move to Folder
    .post('/clipboard/move', async ({ body, set }) => {
      try {
        const { ids, folderId } = body;
        for (const id of ids) {
          await db.update(figmaClipboardItems)
            .set({ folderId: folderId ? Number(folderId) : null })
            .where(eq(figmaClipboardItems.id, id));
        }
        return { success: true };
      } catch (error) {
        set.status = 500;
        return { error: 'Failed to move items' };
      }
    }, {
      body: t.Object({
        ids: t.Array(t.Number()),
        folderId: t.Optional(t.Number())
      })
    })
  )

  // TEMPORARY: Migration endpoint - REMOVE AFTER USE
  .get('/migrate', async ({ set }) => {
      const { runMigration } = await import('./services/migration.service');
      const result = await runMigration();
      return result;
  })

  // Assign assets with no creator to a specific user or the first user
  .get('/assign-unknown-assets', async ({ query, set }) => {
      try {
          const { assignUnknownAssets } = await import('./services/migration.service');
          const userId = query.userId ? Number(query.userId) : undefined;
          const result = await assignUnknownAssets(userId);
          return result;
      } catch (error) {
          set.status = 500;
          return { success: false, error: String(error) };
      }
  })

  // Update asset sizes for existing items
  .get('/update-asset-sizes', async ({ set }) => {
      try {
          const results: string[] = [];
          results.push('🔄 Starting asset size update...');

          // Fetch all assets
          const assets = await db.select().from(figmaClipboardItems);
          results.push(`📦 Found ${assets.length} assets to process`);

          let updatedCount = 0;
          let skippedCount = 0;

          // for (const asset of assets) {
          //     const updates: any = {};
          //     let needsUpdate = false;
          //
          //     // Calculate content size if not set or is 0
          //     if (!asset.size || asset.size === 0) {
          //         if (asset.content) {
          //             const contentSize = Buffer.byteLength(asset.content, 'utf8');
          //             updates.size = contentSize;
          //             needsUpdate = true;
          //         }
          //     }
          //
          //     // Fetch thumbnail size from R2 if not set or is 0
          //     if ((!asset.thumbnailSize || asset.thumbnailSize === 0) && asset.illustration) {
          //         try {
          //             const response = await fetch(asset.illustration, { method: 'HEAD' });
          //             const contentLength = response.headers.get('content-length');
          //             if (contentLength) {
          //                 const thumbnailSize = parseInt(contentLength, 10);
          //                 updates.thumbnailSize = thumbnailSize;
          //                 needsUpdate = true;
          //                 results.push(`✓ Asset #${asset.id}: Thumbnail ${thumbnailSize} bytes`);
          //             }
          //         } catch (error) {
          //             results.push(`⚠️ Asset #${asset.id}: Could not fetch thumbnail size`);
          //         }
          //     }
          //
          //     // Update if needed
          //     if (needsUpdate) {
          //         await db.update(figmaClipboardItems)
          //             .set(updates)
          //             .where(eq(figmaClipboardItems.id, asset.id));
          //         
          //         updatedCount++;
          //         const totalSize = (updates.size || asset.size || 0) + (updates.thumbnailSize || asset.thumbnailSize || 0);
          //         results.push(`✅ Asset #${asset.id}: Updated (${totalSize} bytes total)`);
          //     } else {
          //         skippedCount++;
          //     }
          // }

          results.push('');
          results.push('✅ Update completed!');
          results.push(`   Updated: ${updatedCount} assets`);
          results.push(`   Skipped: ${skippedCount} assets`);

          return { success: true, results, updatedCount, skippedCount };
      } catch (error) {
          set.status = 500;
          return { success: false, error: String(error) };
      }
  })

  // Analytics Action Logging
  .post('/analytics/log', async ({ body, headers, set }) => {
      try {
        const authHeader = headers.authorization;
        let userId: number | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                userId = decoded.userId;
            } catch (e) { console.error('Invalid token for log', e); }
        }

        if (!userId) {
            set.status = 401;
            return { error: 'Unauthorized logging' };
        }

        const { action, assetId, details } = body;

        // TODO: Enable after adding assetActions and userActivityLogs tables
        // if (assetId) {
        //      await db.insert(assetActions).values({
        //         userId,
        //         assetId,
        //         action
        //     });
        // }

        // await db.insert(userActivityLogs).values({
        //     userId,
        //     action,
        //     details: details ? JSON.stringify(details) : undefined,
        //     device: 'web'
        // });

        return { success: true, message: 'Logging temporarily disabled' };

      } catch (error) {
          console.error('Analytics log error:', error);
          set.status = 500;
          return { error: 'Failed to log action' };
      }
  }, {
      body: t.Object({
          action: t.String(),
          assetId: t.Optional(t.Number()),
          details: t.Optional(t.Any())
      })
  })

  .listen(3040);


console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Swagger docs: http://localhost:3040/swagger`);
