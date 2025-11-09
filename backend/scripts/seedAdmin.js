import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

(async () => {
  await connectDB();
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com';
  const pwd = process.env.DEFAULT_ADMIN_PASSWORD || 'admin1234';
  const existing = await User.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash(pwd, 10);
    await User.create({ name: 'Super Admin', email, password: hashed, role: 'Admin' });
    console.log('Admin seeded.');
  } else {
    console.log('Admin exists, skipping.');
  }
  process.exit(0);
})();
