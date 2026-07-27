require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/Db");
const { initSocket } = require("./src/socket");

connectDB();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
