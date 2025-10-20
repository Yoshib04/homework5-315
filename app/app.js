import * as MODEL from "../model/model.js";

function changeRoute() {
   let hashTag = window.location.hash;
   let pageID = hashTag.replace("#", "");
   let pageIDArr = pageID.split('/');

   pageID = pageIDArr[0];
   let subPageID = pageIDArr[1];

   if (pageID === "") pageID = "home";

   if (pageID === 'cart' && !MODEL.isUserLoggedIn()) {
      alert("You must be logged in to view your cart.");
      window.location.hash = "login";
      return;
   }

   loadPageContent(pageID, subPageID);
   updateAccountLink();
}

function loadPageContent(pageName, subPageID) {
   $("#app").load(`pages/${pageName}.html`, (response, status) => {
      if (status === "error") { $("#app").html("<h1>Error: Page not found.</h1>"); return; }
      if (pageName === "home") populateHomePage();
      else if (pageName === "about") populateAboutPage();
      else if (pageName === "books") populateBooksPage();
      else if (pageName === "blog") populateBlogPage();
      else if (pageName === "blog-post") populateBlogPostPage(subPageID);
      else if (pageName === "cart") populateCartPage();
      else if (pageName === "login") attachLoginListeners();
   });
}

function populateHomePage() {
   const featuredBooks = MODEL.getBooks().filter(book => book.featured);
   $(".featured-books").html(generateBookItems(featuredBooks));
}

function populateAboutPage() {
   const sections = MODEL.getAboutInfo();
   let html = sections.map(section => `
      <div class="about-page-section">
        <div class="about-image"><img src="${section.image}" alt="${section.title}"></div>
        <div class="about-text">
         <h2>${section.title}</h2>
         <h3>${section.subtitle}</h3>
         <p>${section.text}</p>
        </div>
      </div>`).join('');
   $(".about-container").html(html);
}

function populateBooksPage() {
   const books = MODEL.getBooks();
   const orderedGenres = ["Boxsets", "Black History Books", "Horror Books", "Childrens Books"];

   let html = orderedGenres.map(genre => {
      const booksInGenre = books.filter(book => book.genre === genre).slice(0, 3);
      return `
         <div class="genre-section">
            <h2 class="genre-title">${genre}</h2>
            <div class="books-container">
               ${generateBookListItems(booksInGenre)}
            </div>
         </div>`;
   }).join('');
   $(".books-page-container").html(html);
}

function populateBlogPage() {
   const posts = MODEL.getBlogPosts();
   let html = posts.map(post => {
      const imageHTML = post.card_images.map(imageSrc => `<img src="${imageSrc}" alt="${post.title}">`).join('');
      return `
      <a href="#blog-post/${post.id}" class="blog-card">
         <div class="blog-images-container">${imageHTML}</div>
         <div class="blog-text">
            <h2>${post.title}</h2>
            <p>${post.card_text}</p>
            <span class="btn">Read More</span>
         </div>
      </a>`;
   }).join('');
   $(".blog-page-container").html(html);
}

function populateBlogPostPage(id) {
   const post = MODEL.getBlogPostById(parseInt(id));
   if (!post) { $("#app").html("<h1>Blog post not found.</h1>"); return; }
   $(".blog-post-hero").css("background-image", `url('${post.hero_image}')`);
   $("#blog-title").text(post.title);
   $("#blog-subtitle").text(post.subtitle);
   if (post.quote) { $("#blog-quote").text(post.quote); }
   let contentHTML = post.content.map(block => {
      if (block.type === 'split') {
         const headingHTML = block.heading ? `<h2 class="post-split-heading">${block.heading}</h2>` : '';
         return `
            <div class="post-split">
               <div class="post-split-image"><img src="${block.image}" alt=""></div>
               <div class="post-split-text">${headingHTML}<p>${block.text}</p></div>
            </div>`;
      }
      return '';
   }).join('');
   $(".blog-post-content-container").html(contentHTML);
}

function populateCartPage() {
   const cartItems = MODEL.getCart();
   if (cartItems.length === 0) {
      $(".cart-items-container").html("<p>Your cart is empty.</p>");
      return;
   }
   let html = cartItems.map(item => `
      <div class="cart-item">
         <div class="cart-item-image"><img src="${item.cover_image}" alt="${item.title}"></div>
         <div class="cart-item-details">
            <h3>${item.title}</h3>
            <p class="price">$${item.price.toFixed(2)}</p>
            <p>In Stock</p>
            <p class="qty">Qty: 1 <a href="#" class="change-link">change</a> | <a href="#" class="delete-link" data-id="${item.id}">delete</a></p>
         </div>
      </div>
   `).join('');
   $(".cart-items-container").html(html);
}

function generateBookItems(books) {
   return books.map(book => `
      <div class="book-item">
         <div class="book-cover"><img src="${book.cover_image}" alt="${book.title}"></div>
         <div class="book-info">
            <p>${book.author}</p>
            <p class="lorem-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</p>
            <p class="price">$${book.price.toFixed(2)}</p>
            <button class="btn add-to-cart-btn" data-id="${book.id}">Add to Cart</button>
         </div>
      </div>`).join('');
}

function generateBookListItems(books) {
   return books.map(book => `
      <div class="book-list-item">
         <div class="book-list-cover">
            <img src="${book.cover_image}" alt="${book.title}">
         </div>
         <div class="book-list-info">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p class="price">$${book.price.toFixed(2)}</p>
            <button class="btn add-to-cart-btn" data-id="${book.id}">Add to Cart</button>
         </div>
      </div>
   `).join('');
}

function attachLoginListeners() {
   $("#login-submit-btn").on("click", e => {
      e.preventDefault();
      const email = $("#login-email").val();
      const pass = $("#login-password").val();
      if (MODEL.loginUser(email, pass)) {
         alert("Login successful!");
         window.location.hash = "home";
      } else {
         alert("Login failed. Please enter both email and password.");
      }
   });

   $("#signup-submit-btn").on("click", e => {
      e.preventDefault();
      const email = $("#signup-email").val();
      const pass = $("#signup-password").val();
      if (MODEL.loginUser(email, pass)) {
         alert("Sign-up successful! You are now logged in.");
         window.location.hash = "home";
      } else {
         alert("Sign-up failed. Please complete all fields.");
      }
   });
}

function updateAccountLink() {
   if (MODEL.isUserLoggedIn()) {
      $("#account-text").text("LOGOUT");
      $("#account-link").off('click').on('click', e => {
         e.preventDefault();
         MODEL.logoutUser();
         alert("You have been logged out.");
         window.location.hash = "home";
         updateAccountLink();
      });
   } else {
      $("#account-text").text("Account");
      $("#account-link").off('click').attr("href", "#login");
   }
}

function initListeners() {
   $(window).on("hashchange", changeRoute);
   $("#app").on("click", ".add-to-cart-btn", e => {
      const bookId = parseInt($(e.currentTarget).data("id"));
      if (MODEL.addToCart(bookId)) { alert("Item added to cart!"); } 
      else { alert("Item is already in your cart."); }
   });
   $("#app").on("click", ".delete-link", e => {
      e.preventDefault();
      const bookId = parseInt($(e.currentTarget).data("id"));
      MODEL.removeFromCart(bookId);
      populateCartPage();
   });
}

$(document).ready(() => {
   MODEL.loadData().done(() => {
      initListeners();
      changeRoute();
   });
});