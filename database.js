/**
 * Establece la conexion a MongoDB usando la variable de entorno MONGO_URL.
 * Si falla, reintenta cada 5 segundos.
 * @async
 * @function dbConnection
 * @returns {Promise<void>}
 */
import dns from "dns";
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

// Las cadenas "mongodb+srv://" hacen una consulta DNS especial (tipo SRV). En
// algunas redes el DNS local la rechaza (error "querySrv ECONNREFUSED") y la
// conexion nunca se logra, aunque en MongoDB Compass funcione. Forzar un DNS
// publico (Google y Cloudflare) resuelve ese caso y no afecta a otras redes.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("\x1b[32m\x1b[1m✔ Base de datos conectada\x1b[0m (MongoDB)");
  } catch(e) {
    console.log("\x1b[31m✖ Sin conexión a la base de datos, reintentando en 5s...\x1b[0m " + e.message);
    setTimeout(() => {
      dbConnection();
    }, 5000);
  }
};

export default dbConnection;
