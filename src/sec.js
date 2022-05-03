import React,{useEffect,useReducer} from 'react';
import Cookies from 'js-cookie';
export const backDomen = "https://chess-server-app.herokuapp.com/"
export const backDomenWSS="ws://chess-server-app.herokuapp.com/ws/"
//export const backDomen = "http://127.0.0.1:8000/"
//export const backDomenWSS="ws://localhost:8000/ws/"
export const frontDomen = "http://localhost:3000/"
var csrftoken=Cookies.get('csrftoken');;
if (!csrftoken)
	csrftoken='';
var odin=0;
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export const CSRFToken = () => { 
	const [, forceUpdate] = useReducer(x => x + 1, 0);
	//const [count, setCount] = React.useState(0);
	useEffect(() => {
        async function fetchData() {
            try {
					if (!csrftoken && odin===0){
						odin+=1;
						let json = {}
						var resp = await fetch(backDomen+"get_csrf/", { mode: 'cors',credentials: 'include'})
						if (resp.ok) {
							  json = await resp.json();
							  csrftoken=json.csrfToken							  
							  Cookies.set('csrftoken',csrftoken,{ expires: 7 });
							  forceUpdate();
							} else {
							  alert("Ошибка HTTP: " + resp.status);
							}
					}
					
					
					
            } catch (err) {
                console.log(err);
            }
        }
		//if (!csrftoken)
		//	csrftoken = Cookies.get('csrftoken');
		if (!csrftoken){
			fetchData();			
		}
	//	setCount(count+1)
    }, []);
    return (		
		<input type="hidden" name="csrfmiddlewaretoken" value={csrftoken ? csrftoken : ''} />
    )
};
export class UserInfoView{
	payload;
	token;
	comp;
	container;
	emit=(name)=>{}
	constructor(){
		this.create()
	}
	create(){
		this.token = Cookies.get('token');
		if (this.token)
			this.payload = JSON.parse(atob(this.token.split('.')[1]));
	}
	setComp(comp){
		comp.view=this;
		this.comp = comp;
	}
	getToken(token){
		try{
			token = token.token
			this.payload = JSON.parse(atob(token.split('.')[1]));
			this.token = token;			
			Cookies.set('token',token,{expires: 7})
			this.create()
			this.emit('login')
		}
		catch(e){
			if (e instanceof SyntaxError)
				alert("Неверный токен")
		}
	}
	compUpdate(){
		if (this.comp){
			this.comp.forceUpdate()
		}
	}
	isAnonim(){
		if (this.payload == undefined)
			return true
		else
			return false
	}
	logout(){
		Cookies.remove('token')
		this.token=undefined
		this.payload=undefined
		this.container.setState({'log':false})
		this.emit('logout')
	}
}
export class AjaxRequest{
    obj;
	errors={};
	constructor(smth=null){
		this.obj = smth;
		//this.sendReq(url,optionsObj)
	}
	async sendReq(url,optionsObj){
		var resp = await this.fetchReq(backDomen+url,optionsObj)
		var json={}
		if (resp.ok){
			json = await resp.json()
            this.onAplied.call(this,json)
		}
		else{
			var status=resp.status
			if (status in this.errors)
				this.errors[status](this,resp)
			this.onConnectionError.call(this,resp)
		}
		return json
	}
	fetchReq(url, optionsObj){
		return fetch(url,optionsObj)
	}
	onAplied(data){}
	onConnectionError(resp){}	
}
export class JWTRequiredRequest extends AjaxRequest{
	errors={401:(that,resp)=>{that.obj.logout();console.log(resp)}}
	fetchReq(url,optionsObj){
		var token = Cookies.get('token')
		optionsObj.headers={}
		optionsObj.headers['token']= token;
		optionsObj.mode='cors'
		optionsObj.credentials='include'
		return fetch(url,optionsObj)
	}	
}