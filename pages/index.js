import Layout from "../components/Layout";

const Index = ()=> {
  return(
    <Layout>
      <h1>Gamblot.</h1>
      <img className="storyImage" src="https://cdn.glitch.com/4cf04a5a-1809-4711-9bfe-3594a1152bfd%2Fpoker_1332601.png?v=1568067192852"/>
      <p>Gamblot is a gambling slack bot in the <a href="https://hackclub.com/community/" style={{textDecoration:"none",color:"red"}}>Hack Club</a> Slack workspace. This will basically make you either lose the money given, give it back, or give it back with a 200% multiplier! Now it even has a 1% chance for a 4x multiplier! To activate it type <code className="code">@banker give @Gamblot [amount]gp for [reason... idk]</code></p>
      <p>You can also play using blackjack with <code className="code">@banker give @Gamblot Xgp for blackjack</code></p>
      <p>Another game to play is roulette! To start a game, give money in NOT A THREAD with the reason roulette! Then after 3 more people give money in the thread, the person who gives the least gets dropped, and the 3 left split 1 way, 2 way, or 3 way randomly!</p>
      <p>Now you can even do the lottery where you store in teh jackpot, and on Saturdays at 12:00 PST it will be drawn and announced in #gamble! Opt in with <code className="code">@banker give @Gamblot 20gp for lottery</code>! Also you can try <code className="code">/lotterycheck</code> to get the stats of the current lottery!</p>
    </Layout>
  )
}

export default Index;