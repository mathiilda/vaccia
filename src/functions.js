"use strict";

const mysql  = require("promise-mysql");
const config = require("../config/database.json");

const schedule = require('node-schedule');
const nodemailer = require("nodemailer");

var jobs = [];

var md5 = require('md5');
let db;

module.exports = {
    hashPassword: hashPassword,
    checkPassword: checkPassword,
    createAccount: createAccount,
    signIn: signIn,
    getUsername: getUsername,
    getUserInfo: getUserInfo,
    getVaccinations: getVaccinations,
    getPersonalVaccinations: getPersonalVaccinations,
    addVaccination: addVaccination,
    addFamilyMember: addFamilyMember,
    getFamilyMembers: getFamilyMembers,
    deleteFamilyMember: deleteFamilyMember,
    getAdmin: getAdmin,
    deleteVaccination: deleteVaccination,
    addAppointment: addAppointment,
    getAppointments: getAppointments,
    deleteAppointment: deleteAppointment,
    getAllAppointments: getAllAppointments,
    setReminderAppointment: setReminderAppointment
};

(async function() {
    db = await mysql.createConnection(config);

    process.on("exit", () => {
        db.end();
    });
})();

// Returns a random salt, used for passwords.
function generateSalt() {
    return Math.random().toString(30).substr(2, 10)
}

// Returns the hashed password.
function hashPassword(password) {
    return md5(password);
}

// Checks if the password given is the same
// as in the database.
//
// Returns true or false.
function checkPassword(res, unhashed) {
    let hashedPass = res[0].password;
    let salt = res[0].salt;

    let unhashedPass = unhashed + salt;

    if (md5(unhashedPass) == hashedPass) {
        return true;
    }

    return false;
}

// Checks if the input in the "password" and
// "confirm password" fields are the same.
//
// Creates an account:
// Adds the user into the "users"- and "family"-table.
//
// Hash and salts password.
//
// Returns redirect-path.
async function createAccount(name, date, email, pass, passConf) {
    if (pass != passConf) {
        return "/signUp?nonvalid=pass"
    }
    
    let salt = generateSalt();
    let saltedPass = pass+salt;
    let hashedPass = hashPassword(saltedPass);

    let sql = `
        INSERT INTO users
            (name, email, password, salt)
        VALUES
            (?, ?, ?, ?)
        ;
    `;
    let sqlId = `SELECT userId FROM users WHERE email = ?`;
    let sqlFamily = `
        INSERT INTO family
            (familyId, name, birthday, email, role)
        VALUES
            (?, ?, ?, ?, ?)
        ;
    `;

    try {
        await db.query(sql, [name, email, hashedPass, salt]);
        let id = await db.query(sqlId, [email]);
        await db.query(sqlFamily, [id[0].userId, name, date, email, "admin"]);
        return ("/start?first=true");
    } catch (error) {
        return "/signUp?nonvalid=email";
    }
}

// Check if input matches any of the users in the database.
// 
// Returns the redirect-path (and if there should be an error message).
async function signIn(email, password) {
    let sql = `SELECT password, salt FROM users WHERE email = ?`

    try {
        let res = await db.query(sql, [email]);

        if (checkPassword(res, password)) {
            return "/start";
        } else {
            return "/signIn?valid=false";
        }
    } catch (error) {
        return "/signIn?valid=false";
    }
}

// Returns the name of the family-admin.
async function getUsername(email) {
    let sql = `SELECT name FROM family WHERE email = ? AND role = ?`
    let res;

    try {
        res = await db.query(sql, [email, "admin"]);
        res = res[0].name;
    } catch (error) {
        res = null;
    }

    return res;
}

// Returns birthday and role from "family"-table.
async function getUserInfo(name, email) {
    let sql = `SELECT birthday, role FROM family WHERE name = ? AND email = ?`
    let res = await db.query(sql, [name, email]);

    return res;
}

// Returns vaccinations, depending on if the user is a cat, dog or human.
async function getVaccinations(name, email) {
    let info = await getUserInfo(name, email);
    let sql = "";

    if (info[0].role == "cat" || info[0].role == "dog") {
        sql = `SELECT name FROM animalVaccines WHERE animal = ?;`;
        return await db.query(sql, [info[0].role]);
    }

    sql = `SELECT name FROM vaccines;`;
    return await db.query(sql);
}

// Adds vaccination to "taken"-table.
async function addVaccination(name, date, username, email) {
    let sql = `
        INSERT INTO taken
            (familyId, userEmail, userName, vaccName, dateTaken)
        VALUES
            (?, ?, ?, ?, ?)
        ;
    `;
    let sqlId = `SELECT userId FROM users WHERE email = ?`;
    let id = await db.query(sqlId, [email]);

    await db.query(sql, [id[0].userId, email, username, name, date]);
}

// Returns vaccinations connected to a specific user.
async function getPersonalVaccinations(email, user) {
    let sql = 
    `SELECT vaccName,dateTaken
    FROM taken
    WHERE userEmail = ?
    AND userName = ?`
    return await db.query(sql, [email, user]);
}

// Add a new member to the "family"-table.
//
// Returns redirect-path.
async function addFamilyMember(name, date, email, role) {
    let sql = `
        INSERT INTO family
            (familyId, name, birthday, email, role)
        VALUES
            (?, ?, ?, ?, ?)
        ;
    `;
    let sqlId = `SELECT userId FROM users WHERE email = ?`;

    try {
        let id = await db.query(sqlId, [email]);
        await db.query(sql, [id[0].userId, name, date, email, role]);
        return "/user";
    } catch (error) {
        return "/user/AddFamilyMember?valid=false"
    }
}

// Returns all family members from a specific family.
async function getFamilyMembers(current, email) {
    let sql = `SELECT name FROM family WHERE email = ? AND name != ?`
    return await db.query(sql, [email, current]);
}

// Deletes family member from a specific family.
async function deleteFamilyMember(current, email) {
    let sql = `DELETE FROM family WHERE email = ? AND name = ?`;
    await db.query(sql, [email, current]);
}

// Returns the admin in a specific family.
async function getAdmin(email) {
    let sql = `SELECT name FROM family WHERE email = ? AND role = ?`;
    return await db.query(sql, [email, "admin"]);
}

// Deletes vaccination from "taken"-table.
async function deleteVaccination(email, name, vacc, date) {
    let sql = `
    DELETE FROM taken
    WHERE userEmail = ? AND userName = ?
    AND vaccName = ? AND dateTaken = ?`;

    date = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    await db.query(sql, [email, name, vacc, date]);
}

// Adds appointment in "appointment"-table.
//
// Returns redirect-path. 
async function addAppointment(name, date, email, user) {
    let sql = `
        INSERT INTO appointments
            (familyId, userEmail, userName, vaccName, dateTaken)
        VALUES
            (?, ?, ?, ?, ?)
        ;
    `;
    let sqlId = `SELECT userId FROM users WHERE email = ?`;

    try {
        let id = await db.query(sqlId, [email]);
        let res = await db.query(sql, [id[0].userId, email, user, name, date]);
        return "/user";
    } catch (error) {
        return "/user/addAppointment?valid=false"
    }
}

// Schedules a reminder for an appointment and sends it when it's time.
async function setReminderAppointment(email, name, vacc) {
    let sql = `
    SELECT dateTaken
    FROM appointments
    WHERE userEmail = ? AND userName = ?
    AND vaccName = ?
    ORDER BY dateTaken DESC`;

    let date = await db.query(sql, [email, name, vacc]);
    let modifyString = date[0].dateTaken.toLocaleString();
    let dateArr = modifyString.split(", ")
    let d = dateArr[0].split("/");
    let t = dateArr[1].split(":");
    let completeDate = new Date(d[2], (d[0]-1), (d[1]-3), t[0], t[1], t[2]);
    let prettyDate = `${d[2]}/${d[1]}/${d[0]} - ${t[0]}:${t[1]}:${t[2]}`;

    jobs.push(
        schedule.scheduleJob(completeDate, async function() {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                user: `${process.env.NM_MAIL}`,
                pass: `${process.env.NM_PASS}`,
                },
            });
    
            let info = await transporter.sendMail({
                from: `"Vaccia" <${process.env.NM_MAIL}>`,
                to: email,
                subject: "Reminder | Vaccia",
                text: `Hello ${name}! \n\nDon't forget about your vaccination appointment for ${vacc}.\nThe appointment is at ${prettyDate}.\n\nBest regards,\nThe Vaccia Team`
            });
        })
    )
}

// Returns all appointments for a specific user.
async function getAppointments(email, user) {
    let sql = `
    SELECT vaccName, dateTaken
    FROM appointments
    WHERE userEmail = ? AND userName = ?
    ORDER BY dateTaken DESC`
    return await db.query(sql, [email, user]);
}
 
// Returns appointments for specific family.
async function getAllAppointments(email) {
    let sql = `
    SELECT vaccName, dateTaken, userName
    FROM appointments
    WHERE userEmail = ?
    ORDER BY dateTaken ASC
    LIMIT 4;
    `;
    return await db.query(sql, [email]);
}

// Deletes appointment for specific user.
async function deleteAppointment(email, user, vacc, date) {
    let sql = `
    DELETE FROM appointments
    WHERE userEmail = ? AND userName = ?
    AND vaccName = ? AND dateTaken = ?`;
    date = new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    await db.query(sql, [email, user, vacc, date]);
}