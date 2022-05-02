import {Dispatcher} from './myTools.js'
import {userInfoView, UserPanel,ErrorButton} from './myComps.js'
import {JWTRequiredRequest,UserInfoView} from './sec.js'


//var userInfoView=new UserInfoView()


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
export const MainMenu=()=>{
	return (<div>
	<HostGameButton/>
	<UserPanel/>
	</div>)
	
}
//window.addEventListener("DOMContentLoaded",()=>console.log(dispatcher))