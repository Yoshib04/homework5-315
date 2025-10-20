let _data = {};
let _cart = [];
let _userLoggedIn = false;

export function loadData() {
   return $.getJSON("data/data.json")
      .done(data => _data = data)
      .fail((jqxhr, textStatus, error) => console.error(`Error loading data: ${textStatus}, ${error}`));
}

export function getBooks() { return _data.Books || []; }

export function getBookById(id) { return _data.Books.find(book => book.id === id); }

export function getAboutInfo() { return _data.About || []; }

export function getBlogPosts() { return _data.BlogPosts || []; }

export function getBlogPostById(id) { return _data.BlogPosts.find(post => post.id === id); }

export function getCart() { return _cart; }

export function addToCart(bookId) {
   const book = getBookById(bookId);
   if (book) {
      const existingItem = _cart.find(item => item.id === bookId);
      if (!existingItem) {
         _cart.push(book);
         return true;
      }
   }
   return false;
}

export function removeFromCart(bookId) {
   _cart = _cart.filter(item => item.id !== bookId);
}

export function isUserLoggedIn() { return _userLoggedIn; }

export function loginUser(email, password) {
   if (email && password) {
      _userLoggedIn = true;
      return true;
   }
   return false;
}

export function logoutUser() {
   _userLoggedIn = false;
}
