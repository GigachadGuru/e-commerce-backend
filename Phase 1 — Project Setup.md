

![](/home/guru/Pictures/Screenshots/screenshot-2026-06-17_12-39-22.png)





### Phase 1 — Project Setup

#### Step 1 — Check prerequisites

Run these in your terminal. Both must work before continuing:

bash

```bash
node -v
```

bash

```bash
psql --version
```

If either fails, install Node.js from nodejs.org and PostgreSQL from postgresql.org first. Come back when both print a version number.

------

#### Step 2 — Create the project folder

bash

```bash
mkdir ecommerce-backend
cd ecommerce-backend
```

------

#### Step 3 — Initialize npm

bash

```bash
npm init -y
```

This creates `package.json`. The `-y` just skips all the questions.

------

#### Step 4 — Install dependencies

**Production packages:**

bash

```bash
npm install express dotenv cors helmet morgan @prisma/client
```

**Dev-only packages:**

bash

```bash
npm install -D prisma nodemon
```

What each one does:

| Package          | Purpose                                |
| ---------------- | -------------------------------------- |
| `express`        | The web framework                      |
| `dotenv`         | Loads `.env` into `process.env`        |
| `cors`           | Allows frontend to call your API       |
| `helmet`         | Sets secure HTTP headers               |
| `morgan`         | Logs every request in terminal         |
| `@prisma/client` | The DB query client                    |
| `prisma`         | CLI tool to manage schema + migrations |
| `nodemon`        | Auto-restarts server on file save      |

------

#### Step 5 — Create the full folder structure

Run this block exactly:

bash

```bash
mkdir -p src/config
mkdir -p src/routes
mkdir -p src/controllers
mkdir -p src/middleware
mkdir -p src/utils
```

Your final structure should look like this:

```
ecommerce-backend/
├── prisma/
│   └── schema.prisma        ← DB schema (Prisma creates this)
├── src/
│   ├── config/
│   │   └── db.js            ← Prisma client singleton
│   ├── controllers/         ← Business logic (Phase 2+)
│   ├── middleware/          ← Auth guard, error handler (Phase 2+)
│   ├── routes/              ← URL definitions (Phase 2+)
│   ├── utils/               ← Reusable helpers (Phase 2+)
│   ├── app.js               ← Express setup
│   └── index.js             ← Server entry point
├── .env                     ← Secrets (never commit this)
├── .env.example             ← Template for teammates
├── .gitignore
└── package.json
```

------

#### Step 6 — Initialize Prisma

bash

```bash
npx prisma init --datasource-provider postgresql
```

This creates the `prisma/` folder with `schema.prisma` and adds `DATABASE_URL` to a new `.env` file.

------

#### Step 7 — Set up your `.env` file

Open the `.env` file Prisma just created. Replace everything in it with:

env

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ecommerce_db"
JWT_SECRET="make_this_a_long_random_string_at_least_32_chars"
PORT=5000
NODE_ENV=development
```

Replace `yourpassword` with your actual PostgreSQL password.

Then create `.env.example` (same content, but blank values — this is safe to commit):

env

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
JWT_SECRET=""
PORT=5000
NODE_ENV=development
```

------

#### Step 8 — Create the PostgreSQL database

Open a new terminal and run:

bash

```bash
psql -U postgres
```

Then inside the psql shell:

sql

```sql
CREATE DATABASE ecommerce_db;
\q
```

------

#### Step 9 — Write the Prisma schema

Open `prisma/schema.prisma`. Delete everything and write this:

prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int        @id @default(autoincrement())
  name      String
  email     String     @unique
  password  String
  role      Role       @default(CUSTOMER)
  createdAt DateTime   @default(now())

  cart      CartItem[]
  orders    Order[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int         @default(0)
  imageUrl    String?
  createdAt   DateTime    @default(now())

  cartItems   CartItem[]
  orderItems  OrderItem[]
}

model CartItem {
  id        Int     @id @default(autoincrement())
  userId    Int
  productId Int
  quantity  Int     @default(1)

  user      User    @relation(fields: [userId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

model Order {
  id        Int         @id @default(autoincrement())
  userId    Int
  total     Float
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())

  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Float

  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

enum Role {
  CUSTOMER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

------

#### Step 10 — Run the migration

This pushes your schema to the actual PostgreSQL database:

bash

```bash
npx prisma migrate dev --name init
```

Then generate the Prisma client:

bash

```bash
npx prisma generate
```

------

#### Step 11 — Create `src/config/db.js`

This is the Prisma client singleton. Create the file and write:

js

```js
const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

module.exports = prisma;
```

Why a singleton? Nodemon restarts the file on save — without this, you'd create hundreds of DB connections and crash.

------

#### Step 12 — Create `src/app.js`

This is where Express is configured. Separate from the server so it's testable later:

js

```js
const express = require("express");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API running", status: "ok" });
});

// Routes will be mounted here in Phase 2+
// app.use("/api/auth",     require("./routes/auth.routes"));
// app.use("/api/products", require("./routes/product.routes"));
// app.use("/api/cart",     require("./routes/cart.routes"));
// app.use("/api/orders",   require("./routes/order.routes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
```

------

#### Step 13 — Create `src/index.js`

This is the actual server start. It imports app.js and listens on a port:

js

```js
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

------

#### Step 14 — Update `package.json` scripts

Open `package.json`, find the `"scripts"` section, and replace it with:

json

```json
"scripts": {
  "start":       "node src/index.js",
  "dev":         "nodemon src/index.js",
  "db:migrate":  "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:studio":   "prisma studio",
  "db:reset":    "prisma migrate reset"
}
```

------

#### Step 15 — Create `.gitignore`

Create `.gitignore` in the root and write:

```
node_modules/
.env
prisma/migrations/
```

------

#### Step 16 — Test the server

bash

```bash
npm run dev
```

You should see:

```
Server running on http://localhost:5000
```

Open your browser or Thunder Client and hit `GET http://localhost:5000` — you should get:

json

```json
{ "message": "E-commerce API running", "status": "ok" }
```

------

Phase 1 is done. Tell me when Step 16 works and we'll move to **Phase 2 — User Auth** (register, login, JWT middleware).