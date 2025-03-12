const nodemailer = require("nodemailer");

const { events } = require("../../system/notifications");

module.exports = (info, logger, init) => {
    return init([
        "store",
        "vault",
    ], async (scope, [
        C_STORE,
        C_VAULT
    ]) => {

        let store = await new Promise((resolve) => {
            C_STORE.found({
                labels: [
                    "smtp=true",
                ]
            }, (store) => {

                logger.info(`SMTP Server store found`, store);
                resolve(store);

            }, async (filter) => {

                let store = await C_STORE.add({
                    name: "SMTP Server",
                    config: [{
                        name: "Server",
                        key: "host",
                        type: "string",
                        description: "STMP Server host"
                    }, {
                        name: "Port",
                        key: "port",
                        type: "number",
                        value: 587,
                        description: "STMP Server port"
                    }, {
                        name: "Secure",
                        key: "secure",
                        type: "boolean",
                        description: "Secured connection"
                    }, {
                        name: "Receipts",
                        key: "receipts",
                        type: "string",
                        description: "E-Mail receipts of notifications, seperated with a comma"
                    }],
                    ...filter
                });

                logger.info(`SMTP Server store added`, store);

            });
        });


        let vault = await new Promise((resolve) => {
            C_VAULT.found({
                labels: [
                    "smtp=true",
                ],
                identifier: "stmp-notifications-server"
            }, (vault) => {

                logger.info(`SMTP Server vault found`, vault);
                resolve(vault);

            }, async (filter) => {

                let vault = await C_VAULT.add({
                    name: "SMTP Server Sender Credentials",
                    secrets: [{
                        name: "Username",
                        key: "username"
                    }, {
                        name: "Password",
                        key: "password"
                    }],
                    ...filter
                });

                logger.info(`SMTP Server store added`, vault);

            });
        });


        Promise.all([store, vault]).then(() => {
            try {

                let { host, port, secure, receipts } = store.lean();
                let [username, password] = vault.secrets.map((secret) => {
                    return secret.decrypt();
                });

                // create smtp transport
                const transporter = nodemailer.createTransport({                    
                    host,
                    port,
                    auth: {
                        user: username,
                        pass: password,
                    },
                    secure,
                });

                // verfiy smtp transport
                transporter.verify((err, success) => {
                    if (err || !success) {

                        logger.error(err || !success, "SMTP Server transport verfication failed!");

                    } else {

                        logger.info("SMTP server is ready to take our messages");

                    }
                });

                events.on("publish", ({ title, message, type }) => {

                    // feedback
                    logger.verbose(`Event "${title}" received, send email to "${receipts}"`, {
                        title,
                        message,
                        type
                    });

                    transporter.sendMail({
                        from: username,
                        to: receipts.split(",").map(v => v.trim()),
                        subject: `OpenHaus - Event Notification (${title})`,
                        text: message,
                    }, (err, info) => {
                        if (err) {

                            logger.error(err, "Could not send email to one or more receipts!");

                        } else {

                            logger.info(`E-Mail send to "${receipts}"`, info);

                        }
                    });

                });

            } catch (err) {

                logger.error(err, "Could not setup SMTP Notification server");

            }
        }).catch((err) => {

            // feedback
            logger.error(err, "Could not setup SMTP notifications");

        });


    });
};
