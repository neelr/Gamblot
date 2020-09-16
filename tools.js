const request = require("request");
var Airtable = require('airtable');
const axios = require("axios")
var base = new Airtable({apiKey: process.env.AIRTABLE}).base('appuWtPdNy4VAOb0a');
function startRoulette(uuid,ts,channel,amount) {
    getRoulette((e,r)=> {
    var build = JSON.parse(r.body);
      if (build[`x${parseFloat(ts)*1000000}`]) {
        if (build[`x${parseFloat(ts)*1000000}`].players[uuid]) {
          sendText(channel,ts, "You have already given the money to the bot!");
          sendMoney(uuid,amount,"REFUND FOR ROULETTE!");
        } else if (Object.keys(build[`x${parseFloat(ts)*1000000}`].players).length == 3) {
          build[`x${parseFloat(ts)*1000000}`].players[uuid] = {};
          build[`x${parseFloat(ts)*1000000}`].players[uuid].gp = amount;
          build[`x${parseFloat(ts)*1000000}`].total+=amount;
          sendText(channel,ts, "Great! ALL PLAYERS ADDED! STARTING GAME! :roulette:");
          var buffer = null;
          var lowerID = "";
          var construct = "";
          Object.keys(build[`x${parseFloat(ts)*1000000}`].players).map((val)=> {
            if ((build[`x${parseFloat(ts)*1000000}`].players[val].gp < buffer) || buffer == null) {
              lowerID = val;
              buffer = build[`x${parseFloat(ts)*1000000}`].players[val].gp;
            }
            construct+=" <@"+val+">";
          });
          var players = build[`x${parseFloat(ts)*1000000}`].players;
          delete players[lowerID];
          var randomNum = rnd(0,2);
          var id = ID();
          if (randomNum == 0) {
            construct+=" The game is splitting across 3 highest people which are... ";
            Object.keys(players).map((val)=> {
              construct+=" <@"+val+">";
              sendMoney(val,Math.floor(build[`x${parseFloat(ts)*1000000}`].total/3),"Split 3 roulette! Your id is "+id);
              log(val,build[`x${parseFloat(ts)*1000000}`].total,"For roulette split 3",Math.floor(build[`x${parseFloat(ts)*1000000}`].total/3),id)
            });
            sendText(channel,ts, construct);
          } else if (randomNum == 1) {
            construct+=" The game is splitting for";
            randomNum = rnd(0,2);
            players = Object.keys(players);
            delete players[randomNum];
            players.map((val)=> {
              construct+=" <@"+val+">";
              sendMoney(val,Math.floor(build[`x${parseFloat(ts)*1000000}`].total/2),"Split 2 roulette! Your id is "+id);
              log(val,build[`x${parseFloat(ts)*1000000}`].total,"For roulette split 2",Math.floor(build[`x${parseFloat(ts)*1000000}`].total/2),id)
            });
            construct+="!!!";
             sendText(channel,ts, construct);
          } else if (randomNum == 2) {
            construct+=" The game is splitting for 1 person who is....";
            randomNum = rnd(0,2);
            players = Object.keys(players)[randomNum];
            construct+=" <@"+players+">!";
            sendMoney(players,Math.floor(build[`x${parseFloat(ts)*1000000}`].total/2),"Split 2 roulette! Your id is "+id);
            log(players,build[`x${parseFloat(ts)*1000000}`].total,"For roulette split 1",build[`x${parseFloat(ts)*1000000}`].total,id)
            construct+="!!!";
            sendText(channel,ts, construct);
          }
          clearRoulette(`x${parseFloat(ts)*1000000}`,build);
        } else {
          sendText(channel,ts, "Great :roulette:! Adding you to the game! We need "+(3-Object.keys(build[`x${parseFloat(ts)*1000000}`].players).length)+" more people! :roulette:");
          build[`x${parseFloat(ts)*1000000}`].players[uuid] = {};
          build[`x${parseFloat(ts)*1000000}`].players[uuid].gp = amount;
          build[`x${parseFloat(ts)*1000000}`].total+=amount;
          request({
              method: 'PUT',
              url: process.env.ROULETTE,
              json: true,
              body:build,
            headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
          });
        }
      } else {
        sendText(channel,ts, "You have started a new game :roulette: :roulette:! Please ask OTHER PEOPLE to give money bellow with the reason `roulette` \n The game works when all 4 people pitch in, the person who pitched the least drops, and the 3 left, either split 3 way, 2 way, or 1 way!");
        build[`x${parseFloat(ts)*1000000}`]= {"channel":channel,"total":amount,"players":{}};
        build[`x${parseFloat(ts)*1000000}`].players[uuid] = {};
        build[`x${parseFloat(ts)*1000000}`].players[uuid].gp = amount;
        request({
            method: 'PUT',
            url: process.env.ROULETTE,
            json: true,
            body:build,
          headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
        }, (e,r) => console.log(r.body))
      }
    })
  }
  function clearRoulette (ts,build) {
    delete build[ts];
    request({
        method: 'PUT',
        url: process.env.ROULETTE,
        json: true,
        body:build,
      headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
    });
  }
  function cleanupGame(uuid) {
    getGames((e,r)=> { 
    var build = JSON.parse(r.body);
    delete build[uuid];
    request({
        method: 'PUT',
        url: process.env.GAME,
        json: true,
        body:build,
      headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
    });
    })
  }
  function getGames(callback) {
    request({
        method: 'GET',
        url: process.env.GAME,
      headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
    },callback)
  }
  function getRoulette(callback) {
    request({
        method: 'GET',
        url: process.env.ROULETTE,
        headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
    },callback)
  }
  function addLottery (uuid,id) {
    base('Lottery').create([
      {
        "fields": {
          "ID":uuid,
          "Check ID":id
        }
      }
    ])
  }
  function log(uuid,gp,trans,after,id) {
    base('Transactions').create([
    {
      "fields": {
        "Name":uuid,
        "GP":gp,
        "Transaction":trans,
        "After":after,
        "_id":id
      }
    }
  ], function(err, records) {
    if (err) {
      console.error(err);
      return;
    }
  });
  }
  function ID () {
    return '_' + Math.random().toString(36).substr(2, 9);
  };
  function sendMoney(uuid, muns,r="refund!!!") {
    console.log("GIVING MANEY")
      axios.post("https://bankerapi.glitch.me/give",{
              token: process.env.BANKERAPI,
              send_id: uuid,
              bot_id:"UMTK90DD0",
              gp: muns,
              reason:r
          }).then(d => console.log(d.data))
  }
  function sendText (channel,ts,text) {
    if (ts == "undefined") {
      request({
          method: 'POST',
          url: 'https://slack.com/api/chat.postMessage',
          form: {
              token: process.env.KEY,
              channel: channel,
              text: text,
              as_user: true
          },
      })
    } else {
      request({
            method: 'POST',
            url: 'https://slack.com/api/chat.postMessage',
            form: {
                token: process.env.KEY,
                channel: channel,
                text: text,
                thread_ts:ts,
                as_user: true
            },
        })
    }
  }
  function rnd(min, max) {
      var min = Math.ceil(min);
      var max = Math.floor(max);
      var seed = Math.random();
      return Math.floor(seed * (max - min + 1)) + min;
  }
  function startGame(uuid,ts,channel,amount,add,bot) {
    getGames((e,r)=> { 
    var build = JSON.parse(r.body);
    build[uuid]= {"ts":ts,"channel":channel,"gp":amount,"add":add,"bot":bot};
    request({
        method: 'PUT',
        url: process.env.GAME,
        json: true,
        body:build,
      headers: {
          'Authorization': `API-KEY ${process.env.APIKEY}`
          }
    });
    })
  }
  
  module.exports = {
      "addLottery":addLottery,
      "cleanupGame":cleanupGame,
      "clearRoulette":clearRoulette,
      "getGames":getGames,
      "getRoulette":getRoulette,
      "ID":ID,
      "log":log,
      "rnd":rnd,
      "sendMoney":sendMoney,
      "sendText":sendText,
      "startRoulette":startRoulette,
      "startGame":startGame
  }