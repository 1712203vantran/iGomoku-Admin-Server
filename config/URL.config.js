const DB_URL = "mongodb://127.0.0.1:27017" //process.env.MODE === "local"? process.env.DB_LOCAL : process.env.DB_CONNECTION;

const URL = {
    MONGO_DB: DB_URL,
}
module.exports = URL;