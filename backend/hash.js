import bcrypt from "bcrypt"; // or use require if your project is CommonJS
const newPassword = "admin1234";
const hash = await bcrypt.hash(newPassword, 10);
console.log(hash);
