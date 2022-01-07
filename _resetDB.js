const db = require("./db")

module.exports = async () => {
    await db.query("DELETE FROM books")
}