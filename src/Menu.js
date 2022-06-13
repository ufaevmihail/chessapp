import {Dispatcher} from './myTools.js'
import React,{Component,useState} from 'react';
import { Button,Toast,Offcanvas } from 'react-bootstrap';
import {userInfoView, UserPanel,ErrorButton} from './myComps.js'
import {JWTRequiredRequest,UserInfoView,backDomenWSS} from './sec.js'


//var userInfoView=new UserInfoView()
//window.addEventListener("DOMContentLoaded",()=>{
	
//})

var dispatcher=new Dispatcher()
/*function log(userView){
	userView.logout=dispatcher.dec(userView.logout,()=>userView.emit('logout'),userView)
	userView.getToken=dispatcher.dec(userView.getToken,()=>userView.emit('login'),userView)
}
dispatcher.registerComp('userView',userInfoView,log);*/
dispatcher.registerComp('userView',userInfoView)
dispatcher.createEvent('login','logout')
//dispatcher.subscribeEvent('logout',()=>console.log('ya razloginilsya'))
//window.addEventListener('mousedown',()=>{userInfoView.logout()})

class HostGameButton extends ErrorButton{
	errors=[['вы не авторизованы',()=>userInfoView.isAnonim()]]
	constructor(props){
		super(props)
		this.hostReq()
		this.update()
		dispatcher.registerComp('hostButton',this)
		dispatcher.subscribeEvent('logout',this.update,this)
		dispatcher.subscribeEvent('login',this.update,this)
	}
	componentDidMount(){
		
		//comp.setState({'games':event})
	}
	hostReq(){
		this.hostRequest = new JWTRequiredRequest(userInfoView)
		/*this.hostRequest.onAplied=function(data){
			//setTimeout(()=>window.location='http://localhost:3000/livegame/'+data.game_id,400)
			window.location='http://localhost:3000/livegame/'+data.game_id
		}*/
	}
	disabled(){
		return this.noErrors
	}
	options(){
		return {}
	}
	onClick(){
		this.hostRequest = new JWTRequiredRequest(userInfoView)
		this.hostRequest.sendReq('create_game/free/',this.options()).then((data)=>{window.location='http://'+document.location.host+'/livegame/'+data.game_id})		
	}
	getValue(){
		return 'Неограничено'
	}
}
class TridvaButton extends HostGameButton{
	options(){
		var formData = new FormData()
		formData.append('time1base', '180');
		formData.append('time1add', '2');
		formData.append('time2base', '180');
		formData.append('time2add', '2');
		return {
			method:'POST',
			body: formData
		}
	}
	getValue(){
		return ' 3+2 '
	}
}
class TriNolButton extends HostGameButton{
	options(){
		var formData = new FormData()
		formData.append('time1base', '180');
		formData.append('time1add', '0');
		formData.append('time2base', '180');
		formData.append('time2add', '0');
		return {
			method:'POST',
			body: formData
		}
	}
	getValue(){
		return ' 3+0 '
	}
}
class PyatDvaButton extends HostGameButton{
	options(){
		var formData = new FormData()
		formData.append('time1base', '300');
		formData.append('time1add', '2');
		formData.append('time2base', '300');
		formData.append('time2add', '2');
		return {
			method:'POST',
			body: formData
		}
	}
	getValue(){
		return ' 5+2 '
	}
}
class PyatnadcatDvaButton extends HostGameButton{
	options(){
		var formData = new FormData()
		formData.append('time1base', '900');
		formData.append('time1add', '2');
		formData.append('time2base', '900');
		formData.append('time2add', '2');
		return {
			method:'POST',
			body: formData
		}
	}
	getValue(){
		return ' 15+2 '
	}
}

class GamesListComp extends Component{
	constructor(props){
		super(props)
		this.type = props.type
		this.state = {'games':{'started':[],'notstarted':[]}}
	}
	componentDidMount(){
		var websocket = new WebSocket(backDomenWSS)
		websocket.onmessage=({data})=>{
		const event = JSON.parse(data);
		if ('games' in event){
			this.setState({'games':event.games[this.type]})
			}
		}
	}
	render(){
		return (<Toast className='border-0' style={{width:'300px', backgroundColor:'rgba(255, 222, 173,.5)'}}>
				<Toast.Body>
			<h6> Ожидание игроков </h6>
			{this.state.games.notstarted.map((gameEnt,idx)=>{
				return <Button key = {idx}
						variant="flat"
						onClick={()=>window.location='http://'+document.location.host+'/livegame/'+gameEnt[0]}>
							белые : {Object.keys(gameEnt[1][0]).length !== 0 ? gameEnt[1][0]['username'] : 'никого'}  черные : {Object.keys(gameEnt[1][1]).length !== 0 ? gameEnt[1][1]['username'] : 'никого'} 
				</Button>})}
			<h6> Начавшиеся игры </h6>
			{this.state.games.started.map((gameEnt,idx)=>{
				return <Button key = {idx}
						variant="flat"
						onClick={()=>window.location='http://'+document.location.host+'/livegame/'+gameEnt[0]}>
							белые : {Object.keys(gameEnt[1][0]).length !== 0 ? gameEnt[1][0]['username'] : 'никого'}  черные : {Object.keys(gameEnt[1][1]).length !== 0 ? gameEnt[1][1]['username'] : 'никого'}
			</Button>}			
			)}
		</Toast.Body>
		</Toast>)
	}
}
/*var test1;
const ButtonTest=()=>{
	var show=false
	return <Button variant="primary" onClick={()=>{test1(!show);show=!show}}>
        Launch
      </Button>
}*/
var test1;
class HostGameMenuButton extends HostGameButton{
	onClick(){
		test1()
	}
	getValue(){
		return 'Создать игру'
	}
}
function OffCanvas() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  test1 = handleShow
  return (
    <>
		<HostGameMenuButton/>
		
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Создать игру</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <HostGameButton/>
		  <TriNolButton/>
		  <TridvaButton/>
		  <PyatDvaButton/>
		  <PyatnadcatDvaButton/>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
/*<Button variant="primary" onClick={handleShow}>
        Launch
      </Button>*/
export const MainMenu=()=>{
	return (<div>
	<OffCanvas/>
	
	<UserPanel/>
	<GamesListComp type='free'/>
	</div>)
	
}
//window.addEventListener("DOMContentLoaded",()=>console.log(dispatcher))