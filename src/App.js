import React,{Component} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button,Form,Row,Col,Toast,Container } from 'react-bootstrap';
import './App.css';
import './main.js'
const App = () => (
	<Container>
	  <Row>
		<Col md="8">
			<div id="canvasdiv" style={{width : "100%"}}>
				<canvas className="myCanvas" id="myCanvas" >				
				</canvas>
			</div>
		</Col>
		<Col md="4">
		    <div>	
			    <ChatBoard></ChatBoard>	
		    </div>
		</Col>
	  </Row>	  
	</Container>
);

var chatBoard;
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
		this.sender = this.props.user;
		this.message = this.props.msg;
		this.state={up:	this.props.up}
		this.ref=React.createRef();
		//this.randheight = String(parseInt(Math.random()*100+25))+'px';
	}
	componentDidMount(){
		if (this.state.up)
			setTimeout(()=>{		
				//wrapper.classList.add('mes-standed');},30);
		//console.log(getComputedStyle(this.ref.current).height)
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
						<strong className="me-auto">{this.sender}</strong>
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
	return (<div className='chat-box'>
					<div ref={this.wrapperRef} className='chat-wrapper'>
						<div ref={this.chatDeskRef} className='chat-desk' style={{marginTop: this.state.marginTop}}>						
						{this.state.commentList.map((el)=><MesWrapperComp key={el.id} user={el.sender} msg={el.msg}/>)}
						</div>
					</div>
					<MsgSenderComp/>
				</div>
		)
		}
}

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
		//console.log(ev);
		this.msg = ev.target.value;
		this.forceUpdate()
	}
	submitMsg(){
		chatBoard.addMessage({id:userid,sender: this.user, msg: this.msg});
		userid+=1;
		//this.setState({msg: ""})
		this.formRef.current.value="";
		this.msg="";
	}
	render(){
		return  <Form>
					<Row>
						<Col>
							<Form.Control style={{boxShadow: 'none',borderColor:"rgba(115, 77, 38, .4)"}} as="textarea" rows={2} ref={this.formRef} placeholder="enter your message" onChange={this.changeHandler}/>
						</Col>						
					</Row>
					<Row style={{margin:"4px 4px"}}>				
						<Col md={{offset: 7 }}>
							<Button className="shadow-none" variant="flat" onClick={this.submitMsg} disabled={this.msg != "" ? false : true}> Send	</Button>
						</Col>
					</Row>
				</Form>
	}
}
export default App;