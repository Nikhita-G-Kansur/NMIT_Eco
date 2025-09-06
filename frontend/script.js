const API = "http://localhost:5000";
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------------- LOGIN ----------------
function registerUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("loginMessage");

  fetch(`${API}/register`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => msg.innerText = data.message)
  .catch(err => console.error(err));
}

function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("loginMessage");

  fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.userId) {
      localStorage.setItem("userId", data.userId);
      window.location.href = "dashboard.html";
    } else {
      msg.innerText = data.message;
    }
  })
  .catch(err => console.error(err));
}

// ---------------- PRODUCTS ----------------
function loadProducts() {
  const userId = parseInt(localStorage.getItem("userId"));
  if (!userId) return;

  fetch(`${API}/products`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("products");
      if (!container) return;
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#555; font-size:18px;">
          No products available. Please add some first.
        </p>`;
        return;
      }

      data.forEach(p => {
        container.innerHTML += `
          <div class="product">
            ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>
          </div>
        `;
      });
    });
}

// ---------------- SELL ----------------
function sellProduct() {
  const userId = parseInt(localStorage.getItem("userId"));
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const image = document.getElementById("image").value;

  fetch(`${API}/sell`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, price, image, userId })
  })
  .then(res => res.json())
  .then(data => {
    alert("Product listed! +10 Eco Points");
    loadProducts();
    updateEcoPoints(data.ecoPoints);
  });
}

// ---------------- CART ----------------
function toggleCart() {
  const cartElem = document.getElementById("cart");
  if (!cartElem) return;
  cartElem.style.display = cartElem.style.display === "none" ? "block" : "none";
}

function addToCart(product) {
  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${product.name} added to cart!`);
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach((p, i) => {
    container.innerHTML += `
      <div class="product">
        ${p.image ? `<img src="${p.image}" alt="${p.name}">` : ""}
        <div>
          <h4>${p.name}</h4>
          <p>₹${p.price}</p>
        </div>
        <button onclick="buyCartItem(${i})">Buy</button>
      </div>
    `;
  });
}

function buyCartItem(index) {
  const userId = parseInt(localStorage.getItem("userId"));
  const product = cart[index];

  fetch(`${API}/buy/${product.id}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ userId })
  })
  .then(res => res.json())
  .then(data => {
    alert(`Purchased ${product.name}! +5 Eco Points`);
    updateEcoPoints(data.ecoPoints);
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    loadProducts();
  });
}

// ---------------- ECO POINTS ----------------
function updateEcoPoints(points) {
  const elem = document.getElementById("ecoPoints");
  if (elem) elem.innerText = `Eco Points: ${points}`;
}

document.addEventListener("DOMContentLoaded", renderCart);
