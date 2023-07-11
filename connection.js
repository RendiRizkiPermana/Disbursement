const mysql = require('mysql')

const db = mysql.createConnection({
    host: "localhost" ,
    user: "root", 
    password: "", 
    database: "gas_diajar"
})

module.exports = db 