"use strict";

var express = require('express');
var router  = express.Router();
require('dotenv').config()
var session;

const functions = require("./src/functions.js");
const sess = require('express-session');
const bodyParser = require("body-parser");
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(sess({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Checks if the user is signed in.
function checkSignedIn() {
    if (session == undefined || session.user == undefined) {
        return true
    }

    return false
}

router.get('/', (req, res) => {
    let data = {};

    if (checkSignedIn()) {
        session=req.session;
        res.render("index", data);
    } else {
        res.redirect("/start");
    }
});

// SIGN IN
router.get('/signIn', (req, res) => {
    if (checkSignedIn()) {
        let data = {};

        if (session == undefined) {
            session=req.session;
        }

        if (req.query.valid) {
            data.error = true;
        } else {
            data.error = false;
        }

        res.render("signIn", data);
    } else {
        res.redirect("/start?first=false");
    }
});

router.post('/signIn', urlencodedParser, async (req, res) => {
    let result = await functions.signIn(req.body.email,
        req.body.pass);

    if (result == "/start") {
        session.user = entities.decode(await functions.getUsername(req.body.email));
        session.email = entities.decode(req.body.email);
    }

    res.redirect(result);
});


// SIGN UP
router.get('/signUp', (req, res) => {
    if (checkSignedIn()) {
        let data = {};

        if (session == undefined) {
            session=req.session;
        }

        if (req.query.nonvalid) {
            data.error = req.query.nonvalid;
        } else {
            data.error = false;
        }

        res.render("signUp", data);
    } else {
        res.redirect("/start");
    }

});

router.post('/signUp', urlencodedParser, async (req, res) => {
    let result = await functions.createAccount(req.body.name,
        req.body.date,
        req.body.email,
        req.body.pass,
        req.body.passConf);

    if (result != "/start?first=true") {
        res.redirect(result);
    } else {
        session.user = entities.decode(req.body.name);
        session.email = entities.decode(req.body.email);
        res.redirect(result);
    }
});

// START
router.get('/start', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let appoint = await functions.getAllAppointments(session.email);
        let data = {
            username: session.user,
            appointments: appoint,
            first: entities.decode((typeof req.query.first === 'undefined') ? false : req.query.first),
        };
        res.render("firstpage", data);
    }
});

// BLOG
router.get('/blog/:post', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let data = {
            username: session.user,
        };
        res.render(req.params.post, data);
    }
});


// USER
router.get('/user', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let info = await functions.getUserInfo(session.user, session.email);
        let family = await functions.getFamilyMembers(session.user, session.email);
        let admin = await functions.getAdmin(session.email)
        let vacc = await functions.getPersonalVaccinations(session.email, session.user)
        let appoint = await functions.getAppointments(session.email, session.user);

        let data = {
            username: session.user,
            email: session.email,
            admin: entities.decode(admin[0].name),
            birthday: entities.decode(info[0].birthday.toLocaleString().slice(0, -10)),
            role: entities.decode(info[0].role),
            family: family,
            myVaccinations: vacc,
            myAppointments: appoint
        };

        res.render("userOverview", data);
    }
});

// ADD VACCINE
router.get('/user/addVaccine', async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let vacc = await functions.getVaccinations(session.user, session.email)
        let data = {
            username: session.user,
            vaccinations: vacc
        };

        res.render("addVaccination", data);
    }
});

router.post('/user/addVaccine', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        await functions.addVaccination( entities.decode(req.body.vaccine),
            entities.decode(req.body.date),
            session.user,
            session.email);

        res.redirect("/user");
    }
});

// DELETE VACCINATION
router.get('/user/deleteVaccination', async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let data = {
            username: session.user,
            vaccine: entities.decode(req.query.vacc),
            date: entities.decode(req.query.date)
        };

        res.render("deleteVaccination", data);
    }
});

router.post('/user/deleteVaccination', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        await functions.deleteVaccination(session.email,
            session.user,
            entities.decode(req.body.vacc),
            entities.decode(req.body.date))

        res.redirect("/user");
    }
});

// ADD FAMILY-MEMBER
router.get('/user/addFamilyMember', async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let data = {
            username: session.user
        };

        if (req.query.valid) {
            data.error = true;
        } else {
            data.error = false;
        }

        res.render("addFamilyMember", data);
    }
});

router.post('/user/addFamilyMember', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let path = await functions.addFamilyMember(entities.decode(req.body.name),
            entities.decode(req.body.date),
            session.email,
            entities.decode(req.body.role));

        res.redirect(path);
    }
});

// DELETE FAMILY MEMBER
router.get('/user/deleteFamilyMember', async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let data = {
            username: session.user,
        };

        res.render("deleteFamilyMember", data);
    }
});

router.post('/user/deleteFamilyMember', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        await functions.deleteFamilyMember(session.user, session.email);
        let admin = await functions.getAdmin(session.email);
        session.user = entities.decode(admin[0].name);

        res.redirect("/user");
    }
});

// CHANGE USER
router.post('/user/changeUser', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        session.user = entities.decode(req.body.selectedUser);
        res.redirect("/user");
    }
});

// ADD APPOINTMENT
router.get('/user/addAppointment', async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let vacc = await functions.getVaccinations(session.user, session.email);
        let data = {
            username: session.user,
            vaccinations: vacc
        };

        if (req.query.valid) {
            data.error = true;
        } else {
            data.error = false;
        }

        res.render("addAppointment", data);
    }
});

router.post('/user/addAppointment', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let path = await functions.addAppointment(entities.decode(req.body.name),
            entities.decode(req.body.date),
            session.email,
            session.user);
        await functions.setReminderAppointment(session.email,
            session.user,
            entities.decode(req.body.name));

        res.redirect(path);
    }
});

// DELETE APPOINTMENT
router.get('/user/deleteAppointment', async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        let data = {
            username: session.user,
            vaccine: entities.decode(req.query.vacc),
            date: entities.decode(req.query.date)
        };

        res.render("deleteAppointment", data);
    }
});

router.post('/user/deleteAppointment', urlencodedParser, async (req, res) => {
    if (checkSignedIn()) {
        res.redirect("/");
    } else {
        await functions.deleteAppointment(session.email,
            session.user,
            entities.decode(req.body.vacc),
            entities.decode(req.body.date)
        );

        res.redirect("/user");
    }
});


// SIGN OUT
router.get('/user/signOut', (req, res) => {
    session.user = undefined;
    session.email = undefined;
    res.redirect("/");
});


module.exports = router;