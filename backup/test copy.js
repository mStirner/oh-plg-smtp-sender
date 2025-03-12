function arrayToObject(labels) {
    let result = {};

    labels.forEach((label, i) => {

        let parts = label.split('.');
        let current = result;

        console.log("Label index", i, parts)

        for (let i = 0; i < parts.length; i++) {

            let part = parts[i];
            let isLast = (i === parts.length - 1);
            let [key, value] = part.split('=');
            let isArray = key.endsWith('[]');

            console.log("key, value", key, value)

            if (isArray) {
                key = key.slice(0, -2);
            }

            if (isLast) {

                value = (value === "true") ? true : (value === "false") ? false : value;

                if (isArray) {

                    if (!current[key]) {
                        current[key] = [];
                    }

                    current[key].push(value);

                } else {

                    current[key] = value;

                }
            } else {

                //let [key] = part.split('=');

                console.log("key", key)

                if (!current[key]) {
                    current[key] = {};
                }

                current = current[key];

            }
        }
    });

    return result;
}

// Beispielaufruf
let labels = [
    "oh.notifications.smtp.enabled=true",
    "oh.notifications.smtp.topic=Hello World",
    "oh.notifications.smtp.sender=foo.example.com", // wrong - gerts converted to object instead of string
    //"oh.notifications.enabled=true",
    //"oh.notifications.states[]=foo",
    //"oh.notifications.states[]=bar",
    //"oh.history.states[]=*",
    //"oh.history.duration=3600",
    //"private=true",
    //"my-super-label=value"
];

console.log(arrayToObject(labels).oh.notifications.smtp);
