const bcrypt = require('bcryptjs');

bcrypt.hash('Orantes2026', 10).then(hash => {
  console.log(hash);
}).catch(err => {
  console.error(err);
});
