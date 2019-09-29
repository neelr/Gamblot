const tools = require("../tools");
module.exports = (req,res) => {
    if (req.body.key==process.env.REFUND) {
      tools.sendMoney(req.body.uuid,req.body.gp);
      res.send("Sent money") 
    } else {
      res.sendStatus(401);
    }
  }