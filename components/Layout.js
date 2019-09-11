import Header from "../components/Header";
import Head from "next/head";
import Footer from "../components/Footer";
class Layout extends React.Component {
    render() {
        return (
            <div style={{ position: "relative", minHeight: "100vh" }}>
                <Head>
                    <title>Gamblot</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </Head>
                <div style={{ paddingBottom: "6rem" }}>
                    <Header />
                    <div style={{ padding: "5vw" }}>
                        {this.props.children}
                    </div>
                </div>
                <Footer />
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css?family=Nunito:400,700&display=swap');
                    body,html {
                        margin:0px;
                        font-weight:700;
                        background-color:white;
                        color:black;
                        font-size:1.15em;
                        width:100%;
                        height:100%;
                        font-family: 'Nunito', sans-serif;
                    }
                    .para {
                        text-indent:2rem;
                        font-weight:400;
                    }
                    ul,ol {
                        font-weight:400;
                    }
                    .storyImage {
                        height:auto;
                        width:20vw;
                        border-radius:30px;
                    }
                    @media screen and (max-width:881px) {
                        .storyImage {
                            width:256px;
                        }
                    }
                    .code {
                        background-color:#f3f3f3 !important; 
                        color:black;
                    }
                    .title {
                        color:#ec3750;
                    }
                    .item:hover {
                        color:#9cbfff;
                        cursor:pointer;
                    }
                    @media screen and (max-width:750px) {
                        .cardContainer {
                            width:75vw !important;
                            margin-bottom:20px !important;
                            margin-left:auto  !important;
                            margin-right:auto !important;
                        }
                        .mobileCenter {
                            display: flex;
                        }
                        .container {
                            display: block !important;
                        }
                    }
                    .cardContainer {
                        -webkit-transition: -webkit-transform .3s ease-in-out;
                        -ms-transition: -ms-transform .3s ease-in-out;
                        transition: transform .3s ease-in-out;
                        box-shadow:5px 5px 5px 5px;
                    }
                    .cardContainer:hover {
                        transform: rotate(5deg) scale(1.1);
                        -ms-transform: rotate(5deg) scale(1.1);
                        -webkit-transform: rotate(5deg) scale(1.1);
                    }
                    .footer {
                        width:100vw;
                        display:flex;
                        bottom: 0;
                        position: absolute;
                        height: 6rem;
                        flex-direction:column;
                    }
                    .item {
                        color:#2970f2;
                    }
                    .child {
                        width:50vw;
                        margin:auto;
                    }
                    @media screen and (max-width:674px) {
                        .child {
                            width:100vw;
                            margin:auto;
                        }
                    }
                `}</style>
            </div>
        )
    }
}

export default Layout;
