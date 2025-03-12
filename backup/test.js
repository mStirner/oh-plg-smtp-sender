const util = require("util");

function arrayToObject(labels) {

    let result = {};

    labels.forEach((label, i) => {

        let [path, value] = label.split("=");
        let parts = path.split('.');
        let current = result;

        for (let i = 0; i < parts.length; i++) {

            let key = parts[i];
            //let isLast = (i === parts.length - 1);
            let isArray = key.endsWith('[]');

            if (isArray) {
                key = key.slice(0, -2);
            }

            //if (isLast) {
            if (i === parts.length - 1) {
                if (isArray) {

                    if (!current[key]) {
                        current[key] = [];
                    }

                    current[key].push(value);

                } else {

                    current[key] = value;

                }
            } else {

                if (!current[key]) {
                    current[key] = {};
                }

                current = current[key];

            }

        }

    });

    return result;

}


function objectToArray(obj, prefix = "") {

    let result = [];

    for (let key in obj) {
        let value = obj[key];
        let newKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && !Array.isArray(value)) {
            result = result.concat(objectToArray(value, newKey));
        } else if (Array.isArray(value)) {
            value.forEach(val => {
                result.push(`${newKey}[]=${val}`);
            });
        } else {
            result.push(`${newKey}=${value}`);
        }
    }

    return result;

}

const json = {
    timemstamp: Date.now(),
    bool: true,
    zero: null,
    obj: {
        str: "Hello from json"
    }
}

// Beispielaufruf
let labels = [
    "oh.notifications.smtp.enabled=true",
    "oh.notifications.smtp.topic=Hello World",
    "oh.notifications.smtp.sender=foo@example.com", // wrong - gerts converted to object instead of string
    "oh.notifications.enabled=true",
    "oh.notifications.states[]=foo",
    "oh.notifications.states[]=bar",
    "oh.history.states[]=*",
    "oh.history.duration=3600",
    "private=true",
    "my-super-label=value",
    `oh.json=${JSON.stringify(json)}`
];


console.log("labels", labels)

/*
const ohLabels = labels.filter((label) => {
    return !label.startsWith("oh.");
});
*/

const parsedObj = arrayToObject(labels);
const arrayFromObj = objectToArray(parsedObj);

console.log("parsedObj", util.inspect(parsedObj, false, 100, true));
console.log("arrayFromObj", arrayFromObj);


const same = (() => {

    let valid = labels.every((label) => {
        return arrayFromObj.includes(label);
    });

    valid &= arrayFromObj.length === labels.length;

    return Boolean(valid);

})();

console.log("Array same", same);