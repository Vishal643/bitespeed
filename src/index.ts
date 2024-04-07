import dotenv from "dotenv";
import fs from "fs";

dotenv.config();
const envConfig = dotenv.parse(fs.readFileSync(".env"));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}
import express from "express";
import session from "express-session";
import { createConnection, getConnection, Repository } from "typeorm";
import { SessionEntity, TypeormStore } from "typeorm-store";
import passport from "passport";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { User } from "./entity/User";
import { Session } from "./entity/Session";
import { mobileOtpAuth } from "./routes/contact";
var cookieParser = require("cookie-parser");

const app = express();

// // api rate limit: 10 req in 1 min
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});
app.set("trust proxy", 1);

// The request handler must be the first middleware on the app
app.use(limiter);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(
  cors({
    origin: ["http://localhost:4040"],
    credentials: true
  })
);
app.options("*", cors());
app.use(cookieParser());
const port = process.env.SERVER_PORT || 3000;
const secret = process.env.SESSION_SECRET || "keyboard cat";

async function startServer() {
  // session middleware
  const repository = getConnection("default").getRepository(Session);
  const store = new TypeormStore({ repository: repository as Repository<SessionEntity>, expirationInterval: 900 });

  app.use(
    session({
      secret: secret,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        domain: process.env.COOKIE_DOMAIN,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: process.env.SECURE_COOKIE ? true : false,
        secure: process.env.SECURE_COOKIE ? true : false
      }
    })
  );

  // passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // routes
  mobileOtpAuth(app);

  app.get("/health-check", (req, res) => {
    res.status(200).send(`Service is running on port ${port}, hostname: ${req.hostname}`);
  });

  app.listen(port, () => {
    console.log(`The application is listening on port ${port}`);
  });
}

createConnection({
  name: "default",
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true",
  entities: [User, Session]
})
  .then(startServer)
  .catch(error => console.log(error));
