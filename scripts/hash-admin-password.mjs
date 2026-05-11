import bcrypt from "bcryptjs";

const plain = process.argv[2];
if (!plain) {
  console.error('Usage: node scripts/hash-admin-password.mjs "your-password"');
  process.exit(1);
}

const hash = await bcrypt.hash(plain, 12);
console.log(hash);
