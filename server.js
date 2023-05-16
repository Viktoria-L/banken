import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import session from "express-session";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

//Express setup
const port = 3000;
const app = express();
const saltRounds = 10;

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "shhhh, very secret",
    // cookie: {
    //  maxAge: 5 * 60 * 1000
    // }
  })
);

//MongoDB setup
const client = new MongoClient("mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db("Banken");
const usersCollection = db.collection("users");
const accountCollection = db.collection("accounts");

// Middleware
const restrict = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).send({ error: "Ej behörig" });
  }
};

//Routes

// -------- INLOGGAD-PAGELOAD ------------- //
app.get("/api/loggedin", async (req, res) => {
  if (req.session.user) {
    res.json({
      user: req.session.user,
    });
  } else {
    res.status(401).json({ error: "Användare ej inloggad" });
  }
});

// --------------- HÄMTA ALLA ANVÄNDARE --------------- //
app.get("/api/users", async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.json(users);
});

//--------- REGISTRERA ANVÄNDARE ------------- //
app.post("/api/register", async (req, res) => {
  const hash = await bcrypt.hash(req.body.pass, saltRounds);

  await usersCollection.insertOne({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    user: req.body.user,
    pass: hash,
  });
  res.json({
    user: req.body.user,
  });
});

// ------------- LOGGA IN ----------------- //
app.post("/api/login", async (req, res) => {
  const user = await usersCollection.findOne({
    user: req.body.user,
  });
  const passwordsMatch = await bcrypt.compare(req.body.pass, user.pass);
  if (user && passwordsMatch) {
    req.session.user = user.user;
    res.json({
      id: user._id,
      user: user.user,
    });
  } else {
    res
      .status(401)
      .json({ error: "Fel användarnamn eller lösenord! Försök igen." });
  }
});

// -------- LOGGA UT ---------- //
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      loggedin: false,
    });
  });
});

// ---------- HÄMTA KONTO --------- //
app.get('/api/users/:id', async (req, res) => {
    const user = await usersCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(user);

})


//TA BORT DENNA SEN?
app.get("/api/cookie", (req, res) => {
     res.send(req.session);
    
});


//----------- 404 --------------- //
app.use((req, res) => {
  res.status(404).send("Sidan du sökte efter finns inte");
});

// -------- LISTENING ---------- //
app.listen(port, () => console.log(`Listening to port ${port}`));
