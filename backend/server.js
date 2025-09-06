const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory users and products
let users = []; // { id, username, password, ecoPoints }
let products = []; // start empty

// ------------------- AUTH ----------------
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const newUser = { id: Date.now(), username, password, ecoPoints: 0 };
  users.push(newUser);
  res.json({ message: "Registered successfully", userId: newUser.id });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ message: "Invalid credentials" });
  res.json({ message: "Login successful", userId: user.id, ecoPoints: user.ecoPoints });
});

// ------------------- PRODUCTS ----------------
app.get("/products", (req, res) => res.json(products));

app.post("/sell", (req, res) => {
  const { name, price, image, userId } = req.body;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ message: "User not found" });

  const newProduct = { id: Date.now(), name, price, image, sellerId: userId };
  products.push(newProduct);
  user.ecoPoints += 10;
  res.json({ message: "Product listed!", product: newProduct, ecoPoints: user.ecoPoints });
});

app.post("/buy/:id", (req, res) => {
  const { userId } = req.body;
  const buyer = users.find(u => u.id === userId);
  if (!buyer) return res.status(400).json({ message: "User not found" });

  const productId = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === productId);
  if (index === -1) return res.status(404).json({ message: "Product not found" });

  const bought = products.splice(index, 1)[0];
  buyer.ecoPoints += 5;
  res.json({ message: "Product purchased!", product: bought, ecoPoints: buyer.ecoPoints });
});

app.get("/eco-points/:userId", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.userId));
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ ecoPoints: user.ecoPoints });
});

// ------------------- START ----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
