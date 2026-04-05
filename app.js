// ===================== SELECTORS =====================
const productsDOM = document.querySelector(".product");
const cartDOM = document.querySelector(".cart-sidebar");
const cartContent = document.querySelector(".cart-content");
const cartBtn = document.querySelector(".fa-shopping-cart");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart button");
const totalAmount = document.querySelector(".total-amount");
const cartItems = document.querySelector(".noi");

// ===================== GLOBAL =====================
let cart = [];

// ===================== PRODUCTS =====================
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();

      let products = data.items.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { id, title, price, image };
      });

      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// ===================== UI =====================
class UI {

  // DISPLAY PRODUCTS (GRID STYLE)
  displayProducts(products) {
    let result = "";

    products.forEach(product => {
      result += `
        <div class="product-item">
          <div class="img-container">
            <img src="${product.image}" alt="${product.title}">
            <button class="add-to-cart" data-id="${product.id}">
              <i class="fa fa-shopping-cart"></i> Add To Cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </div>
      `;
    });

    productsDOM.innerHTML = result;
  }

  // BUTTON LOGIC
  getCartButtons() {
    const buttons = [...document.querySelectorAll(".add-to-cart")];

    buttons.forEach(button => {
      let id = button.dataset.id;

      button.addEventListener("click", () => {
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        cart.push(cartItem);

        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }

  // TOTAL
  setCartValues(cart) {
    let total = 0;
    let itemsTotal = 0;

    cart.forEach(item => {
      total += item.price * item.amount;
      itemsTotal += item.amount;
    });

    totalAmount.innerText = total.toFixed(2);
    cartItems.innerText = itemsTotal;
  }

  // ADD ITEM TO SIDEBAR
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-product");

    div.innerHTML = `
      <div class="product-image">
        <img src="${item.image}">
      </div>
      <div class="cart-product-content">
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id="${item.id}">remove</span>
      </div>
      <div>
        <i class="fa fa-chevron-up" data-id="${item.id}"></i>
        <p>${item.amount}</p>
        <i class="fa fa-chevron-down" data-id="${item.id}"></i>
      </div>
    `;

    cartContent.appendChild(div);
  }

  // SHOW / HIDE CART
  showCart() {
    cartDOM.style.transform = "translateX(0)";
  }

  hideCart() {
    cartDOM.style.transform = "translateX(100%)";
  }

  // INITIAL SETUP
  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);

    cartBtn.addEventListener("click", () => this.showCart());
    closeCartBtn.addEventListener("click", () => this.hideCart());
  }

  // LOAD PREVIOUS CART
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  // CART LOGIC
  cartLogic() {

    // CLEAR CART
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    // EVENTS INSIDE CART
    cartContent.addEventListener("click", event => {

      // REMOVE
      if (event.target.classList.contains("remove-item")) {
        let id = event.target.dataset.id;
        this.removeItem(id);
        event.target.parentElement.parentElement.remove();
      }

      // INCREASE
      else if (event.target.classList.contains("fa-chevron-up")) {
        let id = event.target.dataset.id;
        let item = cart.find(i => i.id == id);

        item.amount++;
        Storage.saveCart(cart);
        this.setCartValues(cart);

        event.target.nextElementSibling.innerText = item.amount;
      }

      // DECREASE
      else if (event.target.classList.contains("fa-chevron-down")) {
        let id = event.target.dataset.id;
        let item = cart.find(i => i.id == id);

        item.amount--;

        if (item.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          event.target.previousElementSibling.innerText = item.amount;
        } else {
          this.removeItem(id);
          event.target.parentElement.parentElement.remove();
        }
      }

    });
  }

  clearCart() {
    cart = [];
    this.setCartValues(cart);
    Storage.saveCart(cart);

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter(item => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
  }
}

// ===================== STORAGE =====================
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(p => p.id == id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  ui.setupAPP();

  products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
  }).then(() => {
    ui.getCartButtons();
    ui.cartLogic();
  });

  // SHOP NOW SCROLL FIX
  document.querySelector(".banner a").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector("#products").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// NAVBAR SMOOTH SCROLL
document.querySelectorAll('.list-items').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const id = this.getAttribute('href');
    document.querySelector(id).scrollIntoView({
      behavior: 'smooth'
    });
  });
});


function addToCart(plan) {
    cart.push(plan);
    alert(plan + " added to cart");
}

function proceedToCheckout() {
  if (cart.length === 0) {
      alert("Your cart is empty!");
  } else {
      alert("Proceeding with: " + cart.join(", "));
      
      // You can redirect if needed
      // window.location.href = "checkout.html";
  }
}