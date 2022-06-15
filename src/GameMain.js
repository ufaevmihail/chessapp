import React,{Component,useState,useEffect} from 'react';
import { useParams,Navigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button,Form,Row,Col,Toast,Container,Collapse } from 'react-bootstrap';
import './App.css';
import { MyForm,FormView,AuthorisationPanel,MyButton,UserPanel } from './myComps.js';
import {backDomen,backDomenWSS} from './sec.js'
export var websocket
var chatBoard;
/*function f(){
	console.log('ffff')
}
export var ffff=f()*/
//export var websocket = new WebSocket("wss://chessproject1.herokuapp.com/");
//require('./main.js');
//var chessTimer;
var flipperObj;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
class ChessTimer{
	chessCompChangers=[null,null]
	timers={0:null,1:null}
	running=[false,false]
	addCounts=[0,0]
	constructor(time1=null,time2=null){
		this.timers[0]=time1
		this.timers[1]=time2
	}
	stopTicking(team){
		this.running[team]=false
	}
	startTickinggg(team){
		this.addCounts[team]+= 1
		this.running[team] = true
		this.ticking(team)
	}
	startTicking(team){
		this.stopTicking((team+1)%2)
		if (this.timers[team]){
			this.timers[(team+1)%2].base += this.timers[(team+1)%2].add
			this.startTickinggg(team)
		}
	}
	async ticking(team){
		while (this.running[team]){
			await sleep(100)
			this.timers[team]['base']-=0.1
			if (this.timers[team]['base'] <= 0){
				var t = (team+1)%2 == 0 ? 'белые' : 'черные'
				require('./main.js').connect(false)
				this.stopTicking(team)
				alert(`${t} победили по времени`)
			}
			if (require('./main.js').game.endGame){
				console.log('ffff')
				this.stopTicking(team)
				this.stopTicking((team+1)%2)
			}				
		}
	}
}

export var chessTimer;
/*const TimerComp = ({team})=>{
	const [timeLeft,timeChanger] = useState(chessTimer.timers[team]?.base)
	//baseTime = Date.now()
	//chessTimer.chessCompChangers[team]=timeChanger
	var show;
	useEffect(()=>{
		//if (chessTimer.timers[team])
			setInterval(()=>{timeChanger(chessTimer.timers[team]?.base)
			show = chessTimer.timers[team] ? true : false
		},1000)			
	},[])
	if (chessTimer.timers[team])
		return (<Collapse in={show}><h1> {Math.round(timeLeft)} </h1> </Collapse>)
	else
		return null
}*/
function addNol(chislo){
	if (chislo>=0 && chislo <10)
		return '0'+chislo
	else
		return ''+chislo
}
const TimerComp = ({team})=>{
	const [timeLeft,timeChanger] = useState(chessTimer.timers[team]?.base)	
	useEffect(()=>{
		//if (chessTimer.timers[team])
			setInterval(()=>{timeChanger(chessTimer.timers[team]?.base)
			//show = chessTimer.timers[team] ? true : false
			//show = isNaN(Math.round(timeLeft)) ? true : false
		},1000)			
	},[])
	
	return (<Collapse in={!isNaN(Math.round(timeLeft))}>
		<div>
			<h1> {addNol(parseInt(timeLeft/60))+' : ' + addNol(parseInt(timeLeft % 60))}</h1>
		</div>
	</Collapse>)
}
//setInterval(()=>console.log(chessTimer.timers[0],' у белого', chessTimer.timers[1],' у черного'),1000)
export function on_ws_message(event){
	if (event.type=='chat_mess'){
		chatBoard.addMessage({id:event.usersender.account.user, sender: event.usersender, msg: event.content})
	}
	if (event.type=='connection'){
		if (event.content=='player_connected'){			
			playersObj[0].update(event.data)
			playersObj[1].update(event.data)
			if (0 in event.data && 1 in event.data)
				require('./main.js').connect();
		}
	}
	if (event.type=='timers'){
		chessTimer.timers=event.data.timers
		if (event.data.turn !== 0 && !chessTimer.running[event.data.turn%2] && require('./main.js').connected && require('./main.js').game.turn !== 1 && !require('./main.js').game.endGame)
			chessTimer.startTickinggg(event.data.turn%2)
	}
}
var firstff = true
export function ws(id=null){
		if (!websocket)
			return new WebSocket(backDomenWSS+"livegame/"+id)
		else
			return websocket
	}
var req;
export function re(){
		if (!req){
			var r=require('./main.js')
			flipperObj = r.flipper
			return r
		}
		else
			return req
	}
/*export function chatBoardF(){
	if (!chatBoard)
		return 
}*/
//var req = new AjaxRequest()
//command={{canExecute:()=>{console.log('ya rabotau');return false},execute:function(){this.forceUpdate()}}}
//<MyButton as="input" type="button" value="Input" />
/*var testView=new FormView([['test',formText=>formText.length == 0],['test1',formText=>formText.length == 1]],
[['test3',async (formText,resolve)=>{await setTimeout(()=>{},1200); resolve(); return formText.length==3}],
['test4',async (formText,resolve)=>{await setTimeout(resolve,1200);return formText.length==4}]])*/
export const GameMain = () => {
	const params = useParams();
	if(Object.keys(params).length>1 || !/\d+/.test(params.id))
		return <Navigate to={'/error404'} />
	/*req.sendReq("join_game/"+params.id,{}).then(data=>{
		console.log(data);
	})*/
	//console.log(params);
	//websocket = new WebSocket("wss://chessproject1.herokuapp.com/");
	websocket=ws(params.id)
	chessTimer = new ChessTimer()
	//chessTimer =new ChessTimer({'base':100,'add':5},{'base':100,'add':5})
	//websocket = new WebSocket("ws://localhost:8000/ws/livegame/"+params.id)
	req=re()
	//websocket.ffff=2;
	//console.log(flipperObj.flipped)
	return(
	<Container>
	  <Row>
		<Col md="8">
			<div id="canvasdiv" style={{width : "100%"}}>
				<PlayerComp team={1}/>
				<canvas className="myCanvas" id="myCanvas" style={{margin: require('./main.js').adapter.currentSize != 'sm' ? '0 5% 0 5%' : '0'}} >				
				</canvas>
				<PlayerComp team={0}/>
			</div>
		</Col>
		<Col md="4">
		    <div>	
			    <ChatBoard></ChatBoard>	
		    </div>
			
		</Col>
	  </Row>
	  <Row>
		<Col md='4'>
				<UserPanel />
		</Col>
	  </Row>

	</Container>
	
)};
var userid=0;
var user = "какой то юзер";
class MesWrapperComp extends Component{
	lambda=(chatDOM)=>{
			var delta = parseFloat(getComputedStyle(chatDOM).height)/25;
			var k = 0;
			var thread = setInterval(()=>{
				 chatBoard.setState(function(prevState,props){
					 return {marginTop:String(parseFloat(prevState.marginTop)-delta)+"px"}
				 });
				 k+=1
				 if (k==25)
					 clearInterval(thread);
			},40)			
		}
	constructor(props){
		super(props);
		this.senderName = this.props.user.username;
		this.message = this.props.msg;
		this.state={up:	this.props.up}
		this.ref=React.createRef();
		//console.log(this.constructor.name)
		//this.randheight = String(parseInt(Math.random()*100+25))+'px';
	}
	componentDidMount(){
		if (this.state.up)
			setTimeout(()=>{		
				//wrapper.classList.add('mes-standed');},30);
		//console.log(getComputedStyle(this.ref.current).height)
		//this.ref.current.addEventListener('click',()=>{console.log('ff')})
		//console.log(typeof(this.ref.current))
		this.scrollBoard();
		this.setState({up:false})},30)
	}
	scrollBoard(){
		var boardDOM=chatBoard.chatDeskRef.current;
		var chatDOM = this.ref.current;
		this.lambda(chatDOM);       
	}
	render(){
		return (<div ref={this.ref} className={'mes-wrapper '+(this.state.up==true ? '' : 'mes-standed')}>						
				<Toast className='border-0' style={{ width: '100%', backgroundColor:'rgba(255, 222, 173,.5)'}}>
					<Toast.Header closeButton={false}>
						<strong className="me-auto">{this.senderName}</strong>
					</Toast.Header>
				  <Toast.Body>{this.message}</Toast.Body>
				</Toast>
		</div>)
	}	
	
}
MesWrapperComp.defaultProps={up:true}

/*<Card className='border-0' style={{ width: '100%', backgroundColor:'transparent'}}>
				  <Card.Body >
					<Card.Title>{this.sender}</Card.Title>
					<Card.Text>
						{this.message}
					</Card.Text>
				  </Card.Body>
				</Card>*/

class ChatBoard extends Component{
	didMount=false;
	constructor(props){
		super(props);
		this.state={commentList:[],counter:0,marginTop: '350px'}
		chatBoard=this;
		this.chatDeskRef = React.createRef();
		this.wrapperRef = React.createRef();
		//this.threadManager = new ThreadManager(chatUpdater,chatanimateEnd);
	}
	 componentDidMount() {
		 this.didMount=true;
		 //console.log(this.wrapperRef.current.offsetHeight)
		 //document.addEventListener('click',()=>{if (this.didMount){
		 //this.addMessage({id:userid,sender: 'какой-то юзер', msg: 'какое-то сообщение'});userid+=1;		 
		 //}});
	}
	
	componentWillUnmount() {
		this.didMount = false;
	}
	addMessage(message){
		if (this.didMount){
		this.state.commentList.push(message)
		this.setState({counter:0})
		}
	}
		
	/*addMessage(message){
		this.setState(function(prevState,props){
			prevState.commentList.push(message)
			return {counter:0}
		})
	}*/
	render(){
	return (
				<div className='chat-box'>
					<div ref={this.wrapperRef} className='chat-wrapper'>
						<div ref={this.chatDeskRef} className='chat-desk' style={{marginTop: this.state.marginTop}}>						
						{this.state.commentList.map((el,key)=><MesWrapperComp key={key} user={el.sender} msg={el.msg}/>)}
						</div>
					</div>
					<MsgSenderComp/>
				</div>
		)
		}
}
/*(<div className='chat-box'>
					<div ref={this.wrapperRef} className='chat-wrapper'>
						<div ref={this.chatDeskRef} className='chat-desk' style={{marginTop: this.state.marginTop}}>						
						{this.state.commentList.map((el)=><MesWrapperComp key={el.id} user={el.sender} msg={el.msg}/>)}
						</div>
					</div>
					<MsgSenderComp/>
				</div>
		)*/

class MsgSenderComp extends Component{
	constructor(props){
		super(props);
		//this.state = {msg: ""}
		this.user = user;
		this.msg="";
		this.changeHandler = this.changeHandler.bind(this);
		this.submitMsg = this.submitMsg.bind(this);
		this.formRef=React.createRef();
	}
	changeHandler(ev){
		this.msg = ev.target.value;
		this.forceUpdate()
	}
	submitMsg(){
		//chatBoard.addMessage({id:userid,sender: this.user, msg: this.msg});
		//userid+=1;
		websocket.send(JSON.stringify({type:'chat_mess',content:this.msg}))
		this.formRef.current.value="";
		this.msg="";
	}
	render(){
		return  <Form>
					<Row>
						<Col>
							<Form.Control spellCheck="false" className='shadow-none base-form' as="textarea" rows={2} ref={this.formRef} placeholder="enter your message" onChange={this.changeHandler}/>
						</Col>						
					</Row>
					<Row style={{margin:"4px 4px"}}>				
						<Col md={{offset: 7 }}>
							<Button variant="flat" onClick={this.submitMsg} disabled={this.msg != "" ? false : true}> Send	</Button>
						</Col>
					</Row>
				</Form>
	}
}
var playersObj={0:null,1:null}
class PlayerComp extends Component{
	waitClosed;
	closed=true;
	payload;
	exists;
	closeTime=300;
	constructor(props){
		super(props)
		this.realTeam=props.team;			
		this.team = props.team
		playersObj[this.team]=this;
		//console.log(this.realTeam)
	}
	update(payloads){
		//this.team = flipperObj.flipped ? (this.realTeam+1)%2 : this.realTeam
		//playersObj[this.team]=this;
		if (firstff)
			if (flipperObj.flipped){
			//var po1=playersObj[0]
			//playersObj[0]=playersObj[1]
			//playersObj[1]=po1
			   var po2 = playersObj[(this.team+1)%2]
			   var po2team = po2.team
			   playersObj[(this.team+1)%2] = this
			   po2.team=this.team
			   this.team=po2team
			   playersObj[this.team]=po2
			   firstff=false			   
			}
		if (this.team in payloads){
			this.payload=payloads[this.team]
			this.exists=true;
		}
		else{
			this.exists=false
		}
		this.forceUpdate()
		/*if (this.exists){
			if (closed)
				this.forceUpdate()
			else
				this.waitClosed.then(value=>{this.closed = false; this.forceUpdate()})
		}
		else{
			//if (!closed)
			this.waitClosed = new Promise((res,rej)=>{this.closed=true; setTimeout(resolve,this.closeTime)})
			this.forceUpdate()
		}*/
	}
	render(){
		//console.log(flipperObj.flipped)
		//var t=this.team ? 'черные' : 'белые'
		var f = this.team==0 ? '-reverse' : ''
		var t;
		if (this.payload){
			t=<div style={{display:'flex',justifyContent:'space-between',flexDirection: 'row'+f, alignItems:'center'}}>
				<Toast className='border-0' style={{width:'200px', backgroundColor:'rgba(255, 222, 173,.5)'}} >
					<Toast.Header closeButton={false}>
						<strong className="me-auto">{this.payload.username}</strong>
					</Toast.Header>
					<Toast.Body>
						<p>rating : {this.payload.account.rating}</p>
						
					</Toast.Body>
				</Toast>
				<TimerComp team={this.team}/>
			</div>
		}
		else
			t=null
			return <Collapse in={this.exists} timeout = {this.closeTime}>
			<div>
				{t}
			</div>
		</Collapse>

	}



}
/*const Card = ({ children }) => {
    let subComponentList = Object.keys(Card);

    let subComponents = subComponentList.map((key) => {
        return React.Children.map(children, (child) =>
            child.type.name === key ? child : null
        );
    });

    return (
        <>
            <div className='card'>
                {subComponents.map((component) => component)}
            </div>
        </>
    );
};

const Header = (props) => <div className='card-header'>{props.children}</div>;
Card.Header = Header;

const Body = (props) => <div className='card-body'>{props.children}</div>;
Card.Body = Body;

const Footer = (props) => <div className='card-footer'>{props.children}</div>;
Card.Footer = Footer;

export default Card;

*/
/*	  <Card>
  <Card.Header>header</Card.Header>
  <Card.Body>body</Card.Body>
</Card>*/