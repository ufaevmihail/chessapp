import {Dispatcher} from './myTools.js'
import React,{Component} from 'react';
import { Button } from 'react-bootstrap';
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
	onClick(){
		this.hostRequest = new JWTRequiredRequest(userInfoView)
		this.hostRequest.sendReq('create_game/free/',{}).then((data)=>{window.location='http://'+document.location.host+'/livegame/'+data.game_id})		
	}
	getValue(){
		return 'Создать игру'
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
		return (<div>
			<h3> Ожидание игроков </h3>
			{this.state.games.notstarted.map((gameEnt,idx)=>{console.log(gameEnt[1])
				return <Button key = {idx}
						variant="flat"
						onClick={()=>window.location='http://'+document.location.host+'/livegame/'+gameEnt[0]}>
							белые : {Object.keys(gameEnt[1][0]).length !== 0 ? gameEnt[1][0]['username'] : 'никого'}  черные : {Object.keys(gameEnt[1][1]).length !== 0 ? gameEnt[1][1]['username'] : 'никого'} 
				</Button>})}
			<h3> Начавшийся игры </h3>
			{this.state.games.started.map((gameEnt,idx)=>{
				return <Button key = {idx}
						variant="flat"
						onClick={()=>window.location='http://'+document.location.host+'/livegame/'+gameEnt[0]}>
							белые : {Object.keys(gameEnt[1][0]).length !== 0 ? gameEnt[1][0]['username'] : 'никого'}  черные : {Object.keys(gameEnt[1][1]).length !== 0 ? gameEnt[1][1]['username'] : 'никого'}
			</Button>}
			
			
			)}
		</div>)
	}
}
export const MainMenu=()=>{
	return (<div>
	<HostGameButton/>
	<UserPanel/>
	<GamesListComp type='free'/>
	</div>)
	
}
//window.addEventListener("DOMContentLoaded",()=>console.log(dispatcher))