const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendWellcomeEmail(email,name) {
    sgMail.send({
        to: email,
        from: 'zunairisgd@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Well come to the app ${name}. Let me know how you get along with app.`
    })
}

function sendCancelationEmail(email,name) {
    sgMail.send({
        to: email,
        from: 'zunairisgd@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Good Bye ${name}, I hope to see you back sometime soon`
    })
}

module.exports = { sendWellcomeEmail, sendCancelationEmail };