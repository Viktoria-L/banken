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
    res.status(401).send({ error: "Du behöver vara inloggad för att se detta" });
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
app.get("/api/users", restrict, async (req, res) => {
  const users = await usersCollection.find().toArray();
  res.json(users);
});

// --------------- HÄMTA KONTOLISTA --------------- //
app.get('/accounts', restrict, async (req, res) => {
  const accounts = await accountCollection.find().toArray();
  res.send(accounts);

})

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

// ---------- HÄMTA BANKKONTON --------- //
app.get('/api/accounts', restrict, async (req, res) => {
    const allAccounts = await accountCollection.find({}).toArray();
      res.send(allAccounts);

})

// ---------- SKAPA BANKKONTO --------- //
app.post('/api/accounts', async (req, res) => {
  const newAccount = await accountCollection.insertOne({
    name: req.body.name,
    balance: Number(req.body.balance)
  });
  res.json(newAccount);
})

// ---------- SÄTTA IN ELLER TA UT PENGAR --------- //
app.put('/api/accounts/:id', restrict, async (req, res) => {
  try {
  const accountId = new ObjectId(req.params.id);
  let update;
  if(req.body.type === 'deposit'){
    update = {
        $inc: {
        balance: Number(req.body.balance), 
      }}
  } else {
    update = {
           $inc: {
             balance: -Number(req.body.balance), 
         }}
  }
  const result = await accountCollection.findOneAndUpdate({_id: accountId}, update);
  res.json(result);
  } catch (error){
    res.status(500).json({error: error.message})
  }
})

// ---------- TA BORT BANKKONTO --------- //
app.delete("/api/accounts/:id", async (req, res) => {
  try {
  const response = await accountCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.json(response);
} catch (error) {
  res.status(500).json({error: error.message})
}
});

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
