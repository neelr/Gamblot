const express = require("express");
const bodyparse = require("body-parser")
const request = require("request");
const app = express();
app.use(bodyparse.urlencoded({
    extended: true
}));
app.use(bodyparse.json());
idar = []

function sendMoney(uuid, muns) {
    request({
        method: 'POST',
        url: 'https://slack.com/api/chat.postMessage',
        form: {
            token: process.env.KEY,
            channel: "UH50T81A6",
            text: `<@UH50T81A6> give <@${uuid}> ${muns}gp for playing with the pros`,
            as_user: true
        },
    }, (e, resp) => console.log(resp.body))
}

function rnd(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
app.get("/", (req, res) => {
    res.send("Hi! APP IS ON!")
});
app.post("/events", (req, res) => {
  console.log(req.body)
    if (typeof(req.body.event.text) == "string") {
        words = req.body.event.text.split(" ");
        if (words[0]=='I' && words[1]=='shall' && words[2]=='transfer' && words[4]=='to'&& words[5] == '<@UMTK90DD0>'& req.body.event.channel != "CGSEAP135" && req.body.event.bot_id == "BH6353LKZ") {
          console.log("got through")  
          request({
                method: "GET",
                url: process.env.STORE
            }, (e, resp) => {
                idar = JSON.parse(resp.body).result;
                if (!(idar.includes(req.body.event.client_msg_id))) {
                    gp = parseInt(words[3].split("gp"));
                    num = rnd(0, 2);
                    console.log("HERE", gp, num, req.body)
                    if (num == 0) {
                        request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: "You HAVE LOST ALL YOU MANEY.. L",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                    } else if (num == 1) {
                        request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: "You ... didnt get any money...",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                        sendMoney(req.body.event.parent_user_id, gp)
                    } else if (num == 2) {
                        request({
                            method: 'POST',
                            url: 'https://slack.com/api/chat.postMessage',
                            form: {
                                token: process.env.KEY,
                                channel: req.body.event.channel,
                                text: "You DOUBLED YER MANEY",
                                thread_ts: req.body.event.ts
                            },
                        }, (e, resp) => console.log(resp.body))
                        sendMoney(req.body.event.parent_user_id, gp * 2)
                    }
                    idar.push(req.body.event.client_msg_id);
                    request({
                        method: 'POST',
                        url: process.env.STORE,
                        json: true,
                        body: idar
                    }, (e, resp) => console.log(resp.body));
                }
            });
        }
    }
  res.send("yola");
});

app.listen(3000, (err) => console.log("Listening on port 3000"));