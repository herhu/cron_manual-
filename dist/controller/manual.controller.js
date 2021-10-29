"use strict";
var express = require('express');
var router = express.Router();
var manualService = require('../services/manual.service');
var manual = require('../schema/index.schema').manual;
// routes
router.post('/send_email', sendEmail);
router.post('/get_checkOut', getCheckOut);
router.post('/get_users', getUsers);
router.post('/send_email_reminder', sendEmailReminder);
router.post('/send_email_checkIn', sendEmailCheckIn);
function sendEmailCheckIn(req, res, next) {
    res.contentType('application/json').status(200);
    manualService.sendEmail(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
function sendEmailReminder(req, res, next) {
    res.contentType('application/json').status(200);
    manualService.sendEmailReminder(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
function getUsers(req, res, next) {
    res.contentType('application/json').status(200);
    manualService.getFromArrival(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
function sendEmail(req, res, next) {
    res.contentType('application/json').status(200);
    manualService.replaceExtras(req.body.replaceStr, req.body.text)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
function getCheckOut(req, res, next) {
    res.contentType('application/json').status(200);
    manualService.getUsersCheckOutManualList(req.body)
        .then(function (resp) {
        console.log("response:", resp);
        res.json({ resp: resp });
    })
        .catch(function (err) {
        console.log("error:", err);
        res.contentType('application/json').status(500);
        res.json({ err: err });
    });
}
module.exports = router;
