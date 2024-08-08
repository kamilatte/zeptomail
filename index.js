const { SendMailClient } = require("zeptomail");
const dotenv = require('dotenv');
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const url = "api.zeptomail.com/";
const token = process.env.TOKEN;
console.log(process.env.TEST || 'test');

let client = new SendMailClient({ url, token });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML form for sending emails
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});

// Handle form submission and send email
app.post("/", (req, res) => {
    const { senderName, senderUsername, senderDomain, receiverEmail, subject, emailBody } = req.body;
    const senderEmail = senderUsername + '@' + senderDomain;
    const recipients = receiverEmail.split(',').map(email => email.trim());

    Promise.all(recipients.map(receiverEmail => {
        return client.sendMail({
            from: {
                address: senderEmail,
                name: senderName, // Use the sender's name
            },
            to: [
                {
                    email_address: {
                        address: receiverEmail,
                    },
                },
            ],
            subject: subject,
            htmlbody: `<div>${emailBody}</div>`,
        });
    }))
    .then((responses) => {
        console.log("Emails sent successfully:", responses);
        res.redirect('/');
    })
    .catch((error) => {
        console.log("Error sending email:", error);
        return res.status(500).send("Error sending email");
    });
});

app.listen(23456, () => {
    console.log("Server started on port 3000");
});
