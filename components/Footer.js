import {FaGithub,FaLink,FaEnvelope} from "react-icons/fa"
const Footer = ()=> {
    return(
        <div className="footer">
            <a href="https://github.com/hacker719/gamblot" className="item" style={{margin:"auto",textDecoration:"none",fontSize:"0.85em"}}>@Hacker719/Gamblot</a>
            <div style={{margin:"auto",display:"flex", color:"#2970f2"}}>
                <a href="https://github.com/hacker719"><FaGithub className="item" size="1.25em" style={{margin:"10px"}}/></a>
                <a href="mailto:neel.redkar@outlook.com"><FaEnvelope className="item" style={{margin:"10px"}} size="1.25em"/></a>
                <a href="https://neelr.dev/"><FaLink className="item" style={{margin:"10px"}} size="1.25em"/></a>
            </div>
        </div>
    )
}

export default Footer;