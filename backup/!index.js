const nodemailer = require("nodemailer");


const { URLSearchParams } = require("url");
const querystring = require("querystring");

const labels = [
    "states[]=foo",
    "states[]=bar",
    "string=value",
    "number=123"
].join("&");

console.log(new URLSearchParams(labels))
console.log(querystring.parse(labels))




module.exports = (info, logger, init) => {
    return init([
        "endpoints",
        "store"
    ], (scope, [
        C_ENDPOINTS,
        C_STORE
    ]) => {

        const WANTED_STATES = new Set();


        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: '<...@ethereal.email>',
                pass: '<pass>'
            }
        });


        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });


        C_ENDPOINTS.events.on("state", async (state) => {

            console.log("State event reeicevd", state, WANTED_STATES)

            if (WANTED_STATES.has(state._id)) {
                try {

                    // send mail with defined transport object
                    const info = await transporter.sendMail({
                        from: '"Foo Koch 👻" <...@ethereal.email', // sender address
                        to: "bar@example.com, baz@example.com", // list of receivers
                        subject: "OpenHaus Endpoint state value changed", // Subject line
                        text: `Endpoint state ${state.name}=${state.value}`, // plain text body
                        headers: {
                            'x-openhaus-instace': process.env.UUID
                        }
                    });

                    console.log("Message sent: %s", info.messageId);
                    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>

                } catch (err) {

                    logger.error(err, "Could not send mail")

                }
            }
        });

        C_ENDPOINTS.found({
            labels: [
                "oh.notifications.smtp.enabled=true",
                "oh.notifications.enabled=true",
                `oh.notifications.states[]={"_id": "...", "operator": ">=", "threshold": "35"}`,
                "oh.notifications.states[]=bar"
            ]
        }, (endpoint) => {

            console.log("Found endpoint with notification states:", endpoint.states)

            let id = endpoint.labels.value("state")


            let state = endpoint.states.find(({ _id }) => {
                return _id === id;
            });


            if (state) {
                WANTED_STATES.add(state._id);
            }

        });


    });
};
