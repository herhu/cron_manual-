"use strict";
var jwt = require('jsonwebtoken');
var config = require('../config');
var mysqlCn = require("../mysqlConnection");
var oracleCn = require("../connection");
var objoracle = require("oracledb");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'check-in@hscp.cl',
        pass: 'hscp286!.,'
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: false,
    debug: false // include SMTP traffic in the logs
});
var Cryptr = require('cryptr');
var cryptr = new Cryptr('Qn8zjsPJfrenon');
module.exports = {
    getUsersCheckOutManualList: function () {
        return new Promise(function (resolve, reject) {
            var toDay = new Date();
            var pin_resort = "HTSCR";
            console.log("toDay getUsersCheckOutManualList:", toDay.toString());
            var hotel = "";
            var sql = "SELECT\n\t\t\tn.guest_name as NAMETITULAR,\n\t\t\tn.first,\n\t\t\tEMAIL email, \n\t\t\tresv_status,\n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id ,\n\t\t\trg_udfc39\n\t\t\tFROM name_reservation n\n\t\t\tWHERE email IS NOT NULL\n\t\t\tAND resort = :pin_resort\n\t\t\tAND resv_status IN ('CHECKED IN')";
            oracleCn.open(sql, [pin_resort], false)
                .then(function (data) {
                console.log("getUsersCheckOutManualList:", data);
                resolve(data);
            })
                .catch(function (err) {
                console.log("error getUsersCheckOutManualList:", err);
                reject(err);
            });
        });
    },
    getFromArrival: function (data) {
        return new Promise(function (resolve, reject) {
            var dateCheck = data.dateCheck;
            var hotel = data.hotel;
            var sql = `SELECT
            CONFIRMATION_NO confirmation_no,
            RESV_NAME_ID resv_name_id ,
            NAME_ID name_id,
            EMAIL email,
            GUEST_FIRST_NAME nameTitular,
            block_code,
            GUEST_NAME lastNameTitular
            from name_reservation
            where arrival = TO_DATE(:dateCheck, 'dd-mm-yy')
            and Resv_status = 'RESERVED'
            and EMAIL IS NOT NULL
            and block_code IS NULL`
            
            oracleCn.open(sql, [dateCheck], false)
                .then(function (data) {
                resolve(data);
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    sendEmailReminder: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("sendEmailReminder:", data);
            var email = data.email;
            var name = data.name;
            var resort = data.resort;
            var hotel = "";
            var logo = "";
            var bgHotel = "";
            if (resort == "HTSCR") {
                hotel = "HOTEL SANTA CRUZ";
            }
            // var messageHtml = `<!doctype html><html lang="es"><head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"> <title></title></head><body> <table style="width: 750px; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 20px;border-spacing: inherit;"> <tbody> <tr> <td style="height: 160px; background-color: #231c1d;text-align: center"> <img src="https://checkin.hscp.cl/api/logosanta.png" class="mx-auto d-block"> </td></tr><tr> <td style="color:#fff;text-align:center;width: 100%;height: 500px; background-image: url('https://checkin.hscp.cl/api/fondosanta.png');padding-left: 20px; padding-right: 20px;"> <h2>Estimado `+name+`</h2> <p style="font-size: 15px;">Bienvenido a la plataforma de check in express del hotel `+hotel+` aca te indicamos los pasos seguir:</p><p style="font-size: 15px;">el día de tu llegada al hotel te enviaremos un correo electrónico con el formulario a completar, te recordamos siempre tener en consideración.</p><p style="font-size: 15px;text-align: left">- tu documento de identidad a mano</p><p style="font-size: 15px;text-align: left">- puedes usar tu celular o tu computadora personal.</p><p style="font-size: 15px;text-align: left">- el proceso demora solo unos minutos</p><p style="font-size: 15px;text-align: left">- una vez terminado el proceso solo pasa por la recepción del hotel a retirar tu llave de habitación.</p><img src="https://checkin.hscp.cl/api/line_santa.png"> </td></tr><tr> <td style="background-color: #fff;height: 400px"> <table style="width:100%" > <tbody> <tr> <td style="text-align: center; width: 50%"> <img src="https://checkin.hscp.cl/api/grupoimagensanta.png"> </td><td style="text-align: left; width: 50%"> <img src="https://checkin.hscp.cl/api/line_santa.png"> <h2>HOTEL<br>SANTA CRUZ</h2> <p>Contacto: <span style="color:#cf7c23">+56 72 220 9600</span><br>Ubicación: <span style="color:#cf7c23">Plaza De Armas 286, Santa Cruz. Chile.</span><br>Correo: <span style="color:#cf7c23">reservas@hscp.cl</span></p><p>→ VISITA NUESTRO <span style="color:#cf7c23"><a href="https://www.hotelsantacruzplaza.cl">SITIO WEB</a></span></p></td></tr></tbody> </table> </td></tr><tr> <td style="font-size:12px;background-color: #000000;color:#fff;height: 250px;text-align: center;"> <img src="https://checkin.hscp.cl/api/fb.png" style="width: 45px;"><img src="https://checkin.hscp.cl/api/in.png" style="width: 45px;"><img src="https://checkin.hscp.cl/api/hoo.png" style="width: 45px;"><img src="https://checkin.hscp.cl/api/pin.png" style="width: 45px;"> <p>2020 © Hotel Santa Cruz, Hotel y Centro de Convenciones.</p></td></tr></tbody> </table></body></html>`;
            var messageHtml = "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\"><title></title></head><body><table style=\"width: 800px; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 16px;border-spacing: inherit;\"><tbody><tr><td style=\"height: 160px; background-color: #231c1d;text-align: center\"> <img src=\"https://checkin.hscp.cl/api/reminder/logosanta.png\"></td></tr><tr><td style=\"color:#fff;text-align:center;height: 450px; background-image: url('https://checkin.hscp.cl/api/reminder/fondosanta.jpg');background-position: center; font-family:'sans-serif'\"> <br></td></tr><tr><td style=\"background-color: #fff;height: 350px\"><table style=\"width:100%\" ><tbody><tr><td style=\"text-align: left; width: 50%\"> <img src=\"https://checkin.hscp.cl/api/reminder/line_santa.png\"><h2>HOTEL<br>SANTA CRUZ</h2><p>Contacto: <span style=\"color:#cf7c23\">+56 72 220 9600</span><br>Ubicaci\u00F3n: <span style=\"color:#cf7c23\">Plaza de Armas 286, Santa Cruz. Chile.</span><br>Correo: <span style=\"color:#cf7c23\">reservas@hscp.cl</span></p><p>VISITA NUESTRO <span style=\"color:#cf7c23\"><a href=\"https://www.hotelsantacruzplaza.cl\">SITIO WEB</a></span></p></td><td style=\"text-align: center; width: 100%\"> <img src=\"https://checkin.hscp.cl/api/reminder/grupoimagensanta.png\"></td></tr></tbody></table></td></tr><tr><td style=\"font-size:12px;background-color: #000000;color:#fff;height: 120px;text-align: center;\"> <img src=\"https://checkin.hscp.cl/api/reminder/fb.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/reminder/in.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/reminder/hoo.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/reminder/pin.png\" style=\"width: 45px;\"><p>2020 \u00A9 Hotel SantaCruz, Hotel y Centro de Convenciones.</p></td></tr></tbody></table></body></html>";
            var mailOptions = {
                from: 'checkin@hscp.cl',
                to: email,
                subject: "Ahora tu Check in es On-Line",
                html: messageHtml
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    console.log('mailOptions' + mailOptions);
                    reject({ status: error, mailOptions: mailOptions });
                }
                else {
                    console.log('Email sent: ' + info.response);
                    resolve({ status: info.response });
                }
            });
        });
    },
    sendEmail: function (data) {
        return new Promise(function (resolve, reject) {
            console.log("datas:", data);
            var dateSearch = data.dateSearch;
            var resv_name_id = data.resv_name_id;
            var hotel = data.hotel;
            var sql = "SELECT \n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id,\n\t\t\tNAME_ID name_id,\n\t\t\tEMAIL email,\n\t\t\tGUEST_FIRST_NAME nameTitular,\n\t\t\tGUEST_NAME lastNameTitular\n\t\t\tfrom name_reservation\n\t\t\twhere arrival = TO_DATE(:dateSearch, 'dd-mm-yy')\n\t\t\tAND RESV_NAME_ID = :resv_name_id";
            oracleCn.open(sql, [dateSearch, resv_name_id], false)
                .then(function (data) {
                console.log("sendEmail:", data);
                var dataToSend = {
                    data: data,
                    hotel: hotel
                };
                module.exports.sendCheckIn(dataToSend)
                    .then(function (resp) {
                    resolve(resp);
                })
                    .catch(function (error) {
                    reject(error);
                });
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    sendCheckIn: function (data) {
        console.log("sendCheckIn testing ");
        return new Promise(function (resolve, reject) {
            var dateNow = data.data;
            var hotel = data.hotel;
            var email = data.email;
            var resv_name_id = data.resv_name_id;
            var arrayConstruct = [];
            var array = [];
            for (var i = 0; i < dateNow.length; ++i) {
                var personalData = { "NAME_ID": dateNow[i].NAME_ID,
                    "NAMETITULAR": dateNow[i].NAMETITULAR,
                    LASTNAMETITULAR: dateNow[i].LASTNAMETITULAR,
                    EMAIL: dateNow[i].EMAIL,
                    RESV_NAME_ID: dateNow[i].RESV_NAME_ID, hotel: hotel };
                module.exports.sendEmailSending(dateNow[i].NAME_ID, dateNow[i].NAMETITULAR, dateNow[i].LASTNAMETITULAR, dateNow[i].EMAIL, dateNow[i].RESV_NAME_ID, hotel)
                    .then(function (resp) {
                    console.log("resp:", i, (dateNow.length - 1));
                    array = {
                        "resultEmail": resp,
                        personalData: personalData
                    };
                    arrayConstruct.push(array);
                    if (i >= (dateNow.length - 1)) {
                        resolve(arrayConstruct);
                    }
                })
                    .catch(function (error) {
                    array = {
                        "resultEmail": error,
                        personalData: personalData
                    };
                    arrayConstruct.push(array);
                    console.log("catch:", i, (dateNow.length - 1));
                    if (i >= (dateNow.length - 1)) {
                        reject(arrayConstruct);
                    }
                });
            }
        });
    },
    sendEmailSending: function (name_id, name, lastName, email, resv_name_id, hotel) {
        if (name_id === void 0) {
            name_id = '';
        }
        if (name === void 0) {
            name = '';
        }
        if (lastName === void 0) {
            lastName = '';
        }
        if (email === void 0) {
            email = '';
        }
        if (resv_name_id === void 0) {
            resv_name_id = '';
        }
        if (hotel === void 0) {
            hotel = "";
        }
        return new Promise(function (resolve, reject) {
            var encryptedData = "";
            module.exports.encrypt({ encryptData: resv_name_id + "/" + hotel })
                .then(function (respEncryt) {
                console.log("respEncryt:", respEncryt);
                encryptedData = respEncryt.data;
                var urlBtn = "https://checkin.hscp.cl/step1/" + encryptedData;
                // var hotel = "HTGLR";
                var title = "Hotel Santa Cruz";
                var logo = "https://checkin.hscp.cl/logosanta.png";
                if (hotel == "HTGLR") {
                    title = "Hotel Santa Cruz";
                }
                else {
                    title = "Hotel Santa Cruz";
                }
                var messageHtml = "<!doctype html><html lang='es'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no'><title></title><style type='text/css'>table{width:750px;font-family:'HelveticaNeue-Light','Helvetica Neue Light','Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;font-size:20px;border-spacing:inherit}.td1{height:160px;background-color:#231c1d;text-align:center}.td2{color:#fff;text-align:center;width:100%;height:500px;background-image:url('https://checkin.hscp.cl/api/fondosanta.png')}.p1{color:#fff;font-size:32px;line-height:7px}.p2{color:#fff;line-height:0px;font-size:32px}.p3{font-size:32px}.myButton{background:linear-gradient(to bottom, #cf7c23 5%, #cf7c23 100%);background-color:#cf7c23;border-radius:15px;border:1px solid #cf7c23;display:inline-block;cursor:pointer;color:#fff;font-family:'HelveticaNeue-Light','Helvetica Neue Light','Helvetica Neue',Helvetica,Arial,'Lucida Grande',sans-serif;font-size:32px!important;padding:16px 31px;text-decoration:none;text-shadow:0px 1px 0px #2f6627}.myButton:hover{color:white!important;background:linear-gradient(to bottom, #000 5%, #000 100%);background-color:#000;border-color:#000}.myButton:active{color:white!important;position:relative;top:1px}.td3{background-color:#fff;height:400px}.p2{}.p2{}</style></head><body><table><tbody><tr><td class='td1'> <img src='https://checkin.hscp.cl/api/logosanta.png' class='mx-auto d-block'></td></tr><tr><td class='td2'><p class='p1'>Hola " + name + " " + lastName + "</p><p class='p2'>Bienvenido a " + title + "</p> <img src='https://checkin.hscp.cl/api/line_santa.png'> <br><br><p class='p3'> Realiza tu <a href='" + urlBtn + "' class='myButton'> Check In</a></p></td></tr><tr><td class='td3'><table style='width:100%' ><tbody><tr><td style='text-align: center; width: 50%'> <img src='https://checkin.hscp.cl/api/grupoimagensanta.png'></td><td style='text-align: left; width: 50%'> <img src='https://checkin.hscp.cl/api/line_santa.png'><h2>HOTEL<br>SANTA CRUZ</h2><p>Contacto: <span style='color:#cf7c23'>+56 72 220 9600</span><br>Ubicaci&oacute;n: <span style='color:#cf7c23'>Plaza de Armas 286, Santa Cruz. Chile.</span><br>Correo: <span style='color:#cf7c23'>reservas@hscp.cl</span></p><p>&rarr; VISITA NUESTRO <span style='color:#cf7c23'><a href='https://www.hotelsantacruzplaza.cl'>SITIO WEB</a></span></p></td></tr></tbody></table></td></tr><tr><td style='font-size:12px;background-color: #000000;color:#fff;height: 250px;text-align: center;'> <img src='https://checkin.hscp.cl/api/fb.png' style='width: 45px;'><img src='https://checkin.hscp.cl/api/in.png' style='width: 45px;'><img src='https://checkin.hscp.cl/api/hoo.png' style='width: 45px;'><img src='https://checkin.hscp.cl/api/pin.png' style='width: 45px;'><p>2020 &copy; Hotel Santa Cruz, Hotel y Centro de Convenciones.</p></td></tr></tbody></table></body></html> ";
                var mailOptions = {
                    from: 'admin@frenon.com',
                    to: email,
                    subject: "Bienvenido/a",
                    html: messageHtml
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        console.log('mailOptions' + mailOptions);
                        reject({ status: error, mailOptions: mailOptions });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        resolve({ status: info.response });
                    }
                });
            })
                .catch(function (error) {
                reject(error);
            });
        });
    },
    encrypt: function (data) {
        return new Promise(function (resolve, reject) {
            var dataToEncryp = data.encryptData;
            var encryptedString = cryptr.encrypt(dataToEncryp);
            resolve({
                // iv: iv.toString('hex'),
                data: encryptedString
            });
        });
    },
};
