"use strict";
var dotenv = require('dotenv');
var path = require('path');
dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});
module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || '127.0.0.1',
    PORT: process.env.PORT || 3500,
    PORT_ssl: process.env.PORT_ssl || 3501,
    USER_bd: process.env.USER_bd || "root",
    BD: process.env.BD || "oxford",
    PASS_bd: process.env.PASS_bd || "",
    key: process.env.key || "/home/administrador/certs/oxford.key",
    crt: process.env.crt || "/home/administrador/certs/21d7b736cee4c46e.crt",
    llave: "miclaveultrasecreta123*" // jwt
};
