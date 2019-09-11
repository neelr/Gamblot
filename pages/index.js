import Layout from "../components/Layout";

const Index = ()=> {
  return(
    <Layout>
      <h1>Gamblot.</h1>
      <img className="storyImage" src="https://cdn.glitch.com/4cf04a5a-1809-4711-9bfe-3594a1152bfd%2Fpoker_1332601.png?v=1568067192852"/>
      <p>Gamblot is a gambling slack bot in the <a href="https://hackclub.com/community/" style={{textDecoration:"none",color:"red"}}>Hack Club</a> Slack workspace. This will basically make you either lose the money given, give it back, or give it back with a 200% multiplier! Now it even has a 1% chance for a 4x multiplier! To activate it type <code className="code">@banker give @Gamblot [amount]gp for [reason... idk]</code></p>
    </Layout>
  )
}

export default Index;