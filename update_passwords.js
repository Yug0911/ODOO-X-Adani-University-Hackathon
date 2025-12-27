const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

async function updatePassword(email, plainPassword) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    if (result.rowCount > 0) {
      console.log(`Password updated for ${email}`);
    } else {
      console.log(`User ${email} not found`);
    }
  } catch (err) {
    console.error('Error updating password:', err);
  } finally {
    await pool.end();
  }
}

// Usage: node update_passwords.js <email> <password>
if (require.main === module) {
  const [,, email, password] = process.argv;
  if (!email || !password) {
    console.log('Usage: node update_passwords.js <email> <password>');
    process.exit(1);
  }
  updatePassword(email, password);
}

module.exports = updatePassword;