const request = require("request");
var Airtable = require('airtable');
var base = new Airtable({apiKey: process.env.AIRTABLE}).base('appuWtPdNy4VAOb0a');
function startRoulette(uuid,ts,channel,amount) {
    getRoulette((e,r)=> {
    var build = JSON.parse(r.body).result;
      if (build[parseFloat(ts)*1000000]) {
        if (build[parseFloat(ts)*1000000].players[uuid]) {
          sendText(channel,ts, "You have already given the money to the bot!");
          sendMoney(uuid,amount,"REFUND FOR ROULETTE!");
        } else if (Object.keys(build[parseFloat(ts)*1000000].players).length == 3) {
          build[parseFloat(ts)*1000000].players[uuid] = {};
          build[parseFloat(ts)*1000000].players[uuid].gp = amount;
          build[parseFloat(ts)*1000000].total+=amount;
          sendText(channel,ts, "Great! ALL PLAYERS ADDED! STARTING GAME! :roulette:");
          var buffer = null;
          var lowerID = "";
          var construct = "";
          Object.keys(build[parseFloat(ts)*1000000].players).map((val)=> {
            if ((build[parseFloat(ts)*1000000].players[val].gp < buffer) || buffer == null) {
              lowerID = val;
              buffer = build[parseFloat(ts)*1000000].players[val].gp;
            }
            construct+=" <@"+val+">";
          });
          var players = build[parseFloat(ts)*1000000].players;
          delete players[lowerID];
          var randomNum = rnd(0,2);
          var id = ID();
          if (randomNum == 0) {
            construct+=" The game is splitting across 3 highest people which are... ";
            Object.keys(players).map((val)=> {
              construct+=" <@"+val+">";
              sendMoney(val,Math.floor(build[parseFloat(ts)*1000000].total/3),"Split 3 roulette! Your id is "+id);
              log(val,build[parseFloat(ts)*1000000].total,"For roulette split 3",Math.floor(build[parseFloat(ts)*1000000].total/3),id)
            });
            sendText(channel,ts, construct);
          } else if (randomNum == 1) {
            construct+=" The game is splitting for";
            randomNum = rnd(0,2);
            players = Object.keys(players);
            delete players[randomNum];
            players.map((val)=> {
              construct+=" <@"+val+">";
              sendMoney(val,Math.floor(build[parseFloat(ts)*1000000].total/2),"Split 2 roulette! Your id is "+id);
              log(val,build[parseFloat(ts)*1000000].total,"For roulette split 2",Math.floor(build[parseFloat(ts)*1000000].total/2),id)
            });
            construct+="!!!";
             sendText(channel,ts, construct);
          } else if (randomNum == 2) {
            construct+=" The game is splitting for 1 person who is....";
            randomNum = rnd(0,2);
            players = Object.keys(players)[randomNum];
            construct+=" <@"+players+">!";
            sendMoney(players,Math.floor(build[parseFloat(ts)*1000000].total/2),"Split 2 roulette! Your id is "+id);
            log(players,build[parseFloat(ts)*1000000].total,"For roulette split 1",build[parseFloat(ts)*1000000].total,id)
            construct+="!!!";
            sendText(channel,ts, construct);
          }
          clearRoulette(parseFloat(ts)*1000000,build);
        } else {
          sendText(channel,ts, "Great :roulette:! Adding you to the game! We need "+(3-Object.keys(build[parseFloat(ts)*1000000].players).length)+" more people! :roulette:");
          build[parseFloat(ts)*1000000].players[uuid] = {};
          build[parseFloat(ts)*1000000].players[uuid].gp = amount;
          build[parseFloat(ts)*1000000].total+=amount;
          request({
              method: 'POST',
              url: process.env.ROULETTE,
              json: true,
              body:build
          });
        }
      } else {
        sendText(channel,ts, "You have started a new game :roulette: :roulette:! Please ask OTHER PEOPLE to give money bellow with the reason `roulette` \n The game works when all 4 people pitch in, the person who pitched the least drops, and the 3 left, either split 3 way, 2 way, or 1 way!");
        build[parseFloat(ts)*1000000]= {"channel":channel,"total":amount,"players":{}};
        build[parseFloat(ts)*1000000].players[uuid] = {};
        build[parseFloat(ts)*1000000].players[uuid].gp = amount;
        request({
            method: 'POST',
            url: process.env.ROULETTE,
            json: true,
            body:build
        });
      }
    })
  }
  function clearRoulette (ts,build) {
    delete build[ts];
    request({
        method: 'POST',
        url: process.env.ROULETTE,
        json: true,
        body:build
    });
  }
  function cleanupGame(uuid) {
    getGames((e,r)=> { 
    var build = JSON.parse(r.body).result;
    delete build[uuid];
    request({
        method: 'POST',
        url: process.env.GAME,
        json: true,
        body:build
    });
    })
  }
  function getGames(callback) {
    request({
        method: 'GET',
        url: process.env.GAME
    },callback)
  }
  function getRoulette(callback) {
    request({
        method: 'GET',
        url: process.env.ROULETTE
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
      request({
          method: 'POST',
          url: 'https://slack.com/api/chat.postMessage',
          form: {
              token: process.env.KEY,
              channel: "UH50T81A6",
              text: `<@UH50T81A6> give <@${uuid}> ${muns}gp for ${r}`,
              as_user: true
          },
      })
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
    var build = JSON.parse(r.body).result;
    build[uuid]= {"ts":ts,"channel":channel,"gp":amount,"add":add,"bot":bot};
    request({
        method: 'POST',
        url: process.env.GAME,
        json: true,
        body:build
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