import React,{Component,useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button,Form,Collapse,FloatingLabel,Alert,Toast,Tabs,Tab,Fade} from 'react-bootstrap';
import { CSRFToken,sleep,backDomen,UserInfoView,JWTRequiredRequest,AjaxRequest } from './sec.js';
/*function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/
export var userInfoView=new UserInfoView()
export class ErrorComp extends Component{
	errors=[]
	noErrors=false;
	constructor(props){
		super(props)
		this.elBody=this.elBody.bind(this)
		this.update=this.update.bind(this)
	}
	update(){
		//this.errorState=this.errors.map(errorEnt=>[errorEnt[0],errorEnt[1]()])
		this.noErrors=this.errors.every(el=>el[1]())
		this.forceUpdate()
	}
	elBody(){}
	render(){
		return (<div>
					<div>
					{this.elBody()}
					</div>
					<div className="errors">					
							{this.errors.map((error,idx)=>{return <Collapse key={idx} in={error[1]()}><div className='base-error'><Alert  variant='danger' >{error[0]}</Alert></div></Collapse>})}
						</div>
		</div>)
	}
}
export class ErrorButton extends ErrorComp{
	constructor(props){
		super(props)
		this.disabled=this.disabled.bind(this)
		this.onClick=this.onClick.bind(this)
		this.getValue = this.getValue.bind(this)
	}
	elBody(){
		return (<Button
						variant="flat"
						disabled={this.disabled()}
						onClick={this.onClick} >
								{this.getValue()}
				</Button>)
	}
}
export class MyForm extends Component{
	constructor(props){
		super(props);
		this.formView=props.view
		this.formView.setForm(this);
		this.textChanged=this.textChanged.bind(this);
		this.update=this.update.bind(this);
		this.inputValue=""
	}
	textChanged(e){
		this.formView.onTextChanged(e)
		this.inputValue=e.target.value;		
		this.formView.handler(e,this)
		if (this.formView.container)
			this.formView.container.fieldTextChanged();
		//this.forceUpdate();		
	}
	update(res=()=>{}){
		if (this.inputValue=="")
			this.formView.handler(null,this,res);
		//this.forceUpdate();
	}
	render(){
		return (<div>
					<FloatingLabel label={this.formView.placeholder} className="mb-3">
						<Form.Control name={this.formView.name} spellCheck="false" className='shadow-none base-form' placeholder={this.formView.placeholder} onChange={this.textChanged} onFocus={(e)=>this.update()}/>
					</FloatingLabel>
						<div className="errors">
							{this.formView.errorsState.map((errorState,idx)=>{return <Collapse key={idx} timeout={500} in={errorState[1]}><div className='base-error'><Alert variant='danger'>{errorState[0]}</Alert></div></Collapse>})}
							{this.formView.asyncErrorsState.map((errorState,idx)=>{return <Collapse key={idx} in={errorState[1]}><div className='base-error'><Alert  variant='danger' >{errorState[0]}</Alert></div></Collapse>})}
						</div>
		</div>)
	}
}

export class FormView{
	errors=[]
	errorsState=[]
	placeholder=""
	noErrors=false;
	inputValue;
	req=false;
	constructor(errors=[],asyncErrors=[],ph="test_label",req=false,name='test'){
		this.name=name;
		this.errors=errors;
		this.asyncErrors=asyncErrors;
		this.placeholder=ph;
		this.errorsState=this.errors.map(error=>[error[0],false])
		this.asyncErrorsState=this.asyncErrors.map(error=>[error[0],false])
		if (req){
			var name = req===true ? 'обязательное поле' : req;
			
			this.errors.unshift([name,formText=>formText == 0])
			this.errorsState.unshift([name,false])
			this.req=req
		}
	}
	setForm(form){
		this.form=form
	}
	async handler(e,form,res=()=>{}){
		if (this.req && this.errors[0][1](form.inputValue)){
			this.errors.forEach((error,idx)=>{this.errorsState[idx]=[error[0],false]})
			this.errorsState[0]=[this.errors[0][0],true]
			this.noErrors=false
			this.form.forceUpdate()
			return;
		}
		var formText=form.inputValue;
		this.errors.forEach((error,idx)=>{this.errorsState[idx]=[error[0],error[1](formText)]})
		this.asyncErrorsState=this.asyncErrors.map(error=>[error[0],false])
		this.form.forceUpdate()
		var checkAsyncEr=true;
		this.errorsState.forEach(error=>{if (error[1]) checkAsyncEr=false;})	
		this.noErrors=checkAsyncEr;
		if (checkAsyncEr&&this.asyncErrors){			
			this.noErrors=false;
			this.container.submitButtonCommand.setLoading()
			await sleep(500)
			if (formText != form.inputValue){
				this.container.submitButtonCommand.setReady()
				res();
				return;
			}
			await Promise.all(this.asyncErrors.map((error,idx)=>this.asyncError(error,formText,idx)))
			if (formText != form.inputValue){
				this.container.submitButtonCommand.setReady()
				res()
				return;
			}
			this.asyncErrorsState.forEach(error=>{if (error[1]) checkAsyncEr=false;})
			this.noErrors=checkAsyncEr;
			this.container.submitButtonCommand.setReady()
			this.form.forceUpdate();
		}
		res();	
		
	}
	onTextChanged(e){
		
	}
	setContainer(cont){
		this.container=cont;
	}
	asyncError(error,formText,idx){
		return new Promise(async resolve=>{
			var result = await error[1](formText,resolve)
			this.asyncErrorsState[idx]=[error[0],result]
		}
	)}
}

export class FormContainer extends Component{
	viewList=[]
	submitButtonCommand;
	checkSubmit=true;
	getHeader;
	constructor(props){
		super(props);
		this.formRef=React.createRef();
		this.innerJSX=this.innerJSX.bind(this);
		this.onSubmit=this.onSubmit.bind(this);
		this.formBody = this.formBody.bind(this);
		this.okBody = this.okBody.bind(this);
		//this.innerJSX=this.innerJSX.bind(this);
		//this.getHeader=this.getHeader.bind(this);
		this.url=props.url
		this.submitButtonCommand=new SubmitButtonCommand()
		this.submitButtonCommand.setComp('formContainer',this);
		this.state={body:this.formBody}
	}
	componentDidMount(){	
		this.viewList.forEach(view=>{view.setContainer(this)})
		this.viewList.forEach(view=>{view.form.update()})
	}
	fieldTextChanged(){
		
		this.submitButtonCommand.update()
	}
	noCurrentMistakes(){
		this.checkSubmit=true;
		this.viewList.forEach(view=>{if (!view.noErrors) {this.checkSubmit=false;}})
		if (this.checkSubmit)
			return true
	}
	innerJSX(){}
		
	async onSubmit(e){
		e.preventDefault();
		if (!this.noCurrentMistakes()){
			this.submitButtonCommand.update()
			return;
		}
		/*await Promise.all(this.viewList.map(view=>new Promise(resolve=>{
			view.form.update(resolve)
		}
		)))*/
		if (this.noCurrentMistakes())
			this.sendForm()
			//this.formRef.current.submit();
			
		this.submitButtonCommand.update()
	}
	async sendForm(){
		var response = await fetch(backDomen+this.url, {
			method: 'POST',
			body: new FormData(this.formRef.current),
			mode: 'cors',
			credentials: 'include',
		});
		if (response.ok){
			var json = await response.json();
			if (json.applied === true)
				this.setState({body:this.okBody})
			this.handleData(json)
		}
		 else {
			 this.onError(response)
				//alert("Ошибка HTTP: " + response.status);
		}
	}
	handleData(data){}
	onError(response){
		alert("Ошибка HTTP: " + response.status);
	}
	formBody(){
		return <div className='form-container'>
					   <Form ref={this.formRef}>
						   <CSRFToken/>
						   {this.innerJSX()} 
						   <MyButton variant='flat' as="input" type="button" value='отправить' command={this.submitButtonCommand}/>
					   </Form>
				</div>
	}
	okBody(){
		return <div><strong> Успешно!</strong></div>
	}
	render(){
		//var body = this.state.body()
		return <Toast>
				   <Toast.Header closeButton={false}> {this.getHeader()} </Toast.Header>
				   <Toast.Body>
					{this.state.body()}
				   </Toast.Body>
			   </Toast>
	}
}
export class MyButton extends Component{
	constructor(props){
		super(props);
		var {command,...buttonProps} = props;
		this.buttonProps=buttonProps
		//this.command=new Command(this);
		this.command=command;
		this.command.setMainComp(this);
		this.command.canExecute=this.command.canExecute.bind(this.command);
		this.buttonProps['onClick']=this.command.execute.bind(this.command);
		
	}
	render(){
		this.buttonProps['disabled']=!this.command.canExecute();
		if (this.buttonProps['disabled']&&this.buttonProps['value']!='...Loading')
			this.buttonProps['value']='есть ошибки'
		return React.createElement(Button,this.buttonProps,null)
	}
}

class Command{
	setMainComp(obj){
		this.obj=obj
		
	}
	setComp(name,obj){
		if (!(name in this))
			this[name]=obj;
		else
			console.log('такое имя уже занято');
	}
	update(name=null){
		if (name!==null)
			this[name].forceUpdate()
		else
			this.obj.forceUpdate();
	}
	canExecute(){
		return true
	}
	execute(){
		//this.updateComp();
		//console.log("ya rabotau", this,this.setComp);
		//this.obj.forceUpdate();
	}
}
class SubmitButtonCommand extends Command{
	setMainComp(obj){
		this.obj=obj
		this.baseValue=this.obj.buttonProps.value;
		this.obj.state={value:this.baseValue}
		//this.states=['отправить','есть ошибки']
	}
	canExecute(){
        //var f=this.formContainer.noCurrentMistakes()
		//this.baseValue = f ? 'отправить' : 'есть ошибки'
		return this.formContainer.noCurrentMistakes()
	}
	execute(){
		this.formContainer.onSubmit({preventDefault:()=>{}})
	}
	setLoading(){
		this.obj.buttonProps.value='...Loading';
		this.obj.forceUpdate()
	}
	setReady(){
		this.obj.buttonProps.value='Отправить';
		this.obj.forceUpdate()
	}
}
var passwordReg='';
class RegistrationForm extends FormContainer{
	viewList=[new FormView([['только латинские буквы',formText=>formText.match('[а-яА-ЯёЁ]')],['логин должен быть не менее 5 символов',formText=>formText.length < 5]],
				[['логин уже существует',async (formText,resolve)=>{var ajReq=new AjaxRequest();var js = await ajReq.sendReq('exist_login/'+'?' + new URLSearchParams({
    login: formText,
})); resolve(); return !js.exists}]]
				,'Придумайте логин',true,'user_name'),
				new FormView([['должны быть большая и малая буквы',formText=>!formText.match('[A-Z]') || !formText.match('[a-z]')],['должно быть число',formText=>!formText.match('[0-9]')],
				['пароль должен быть не менее 8 символов',formText=>{passwordReg = formText; this.viewList[2].handler(null,this.viewList[2].form,()=>{});return formText.length < 8}],['только латинские буквы',formText=>formText.match('[а-яА-ЯёЁ]')]],
				[],'Придумайте пароль',true,'password'),
				new FormView([['пароли должны совпадать',formText=>formText!=passwordReg]],[],"Повторите пароль",true),
				new FormView([['введите валидный емейл',formText=>{var m=formText.match(new RegExp(/\S+@\w+\.\w+[^.]$/)); if (m) {return m[0]!=formText} else {return true}}]],
				[['емеил уже существует',async (formText,resolve)=>{var ajReq=new AjaxRequest();var js = await ajReq.sendReq('exist_email/'+'?' + new URLSearchParams({
    email: formText,
})); resolve(); return !js.exists}]],'Укажите емеил',true,'email'),
				]
	getHeader(){
		return <strong> Регистрация </strong>
	}
	innerJSX(){
		return <div>
				<MyForm view={this.viewList[0]}></MyForm>
				<MyForm view={this.viewList[1]}></MyForm>
				<MyForm view={this.viewList[2]}></MyForm>
				<MyForm view={this.viewList[3]}></MyForm>
			   </div>
	}
}
class LoginForm extends FormContainer{
	error=false
	viewList=[new FormView([],
				[],'Логин','Введите логин','user_name'),
				new FormView([],
				[],'Пароль','Введите пароль','password')]
	constructor(props){
		super(props)
		this.viewList.forEach(formView=>{formView.onTextChanged=(e)=>{if (this.error){this.error=false; this.forceUpdate()}}})
	}
	getHeader(){
		return <strong> Авторизация </strong>
	}
	innerJSX(){
		return <div>				
				<MyForm view={this.viewList[0]}></MyForm>
				<MyForm view={this.viewList[1]}></MyForm>
				<Collapse in={this.error}><div><Alert variant='danger'>Неверный логин/пароль</Alert></div></Collapse>
				
			   </div>
	}
	handleData(data){
		userInfoView.getToken(data);
		userInfoView.container.setState({log:true});
	}
	onError(response){
		if (response.status==401){
			this.error=true;
			this.forceUpdate();
		}
	}
}
class UserInfo extends Component{
	payload = userInfoView.payload	
	render(){
		if (userInfoView.payload == undefined)
			return null;
		else{
			//Object.keys(this.payload).map(propName => (<div key={propName}> {this.payload[propName]} </div>))
			return (<div>
				<Toast className='border-0' style={{width:'200px', backgroundColor:'rgba(255, 222, 173,.5)'}} onClose={() => userInfoView.logout()}>
					<Toast.Header>
						<strong className="me-auto">{this.payload.username}</strong>
						<small className="text-muted">logout</small>
					</Toast.Header>
					<Toast.Body>
						<p>rating : {this.payload.account.rating}</p>
						<p>email : {this.payload.email}</p>
						
					</Toast.Body>
				</Toast>
			</div>)
		}
	}	
}
/*<Button onClick={testReqFunc}> TEST </Button>
function testReqFunc(){
	var testRequest = new JWTRequiredRequest(userInfoView)
    testRequest.sendReq('ping/',new Object()).then((json)=>console.log(json))
}*/

export class UserPanel extends Component{
	constructor(props){
		super(props)
		var logged = userInfoView.payload != undefined
		userInfoView.container = this;
		this.state={'log':logged}
	}
	body(){
		if (!this.state.log)
			return (<div>
				<AuthorisationPanel />
		</div>)
		else{
			return (<div>
				<UserInfo />
			</div>)
		}
	}
	render()
	{
		return <div className="user-panel">
				{this.body()}
		</div>
	}
}

export function AuthorisationPanel() {
  const [key, setKey] = useState('Авторизация');
  return (
    <Tabs
      activeKey={key}
      onSelect={(k) => setKey(k)}
      className="mb-3"
	  transition={Fade}
    >
      <Tab eventKey="Авторизация" title="Авторизация">
        <LoginForm url='auth/'/>
      </Tab>
      <Tab eventKey="Регистрация" title="Регистрация">
        <RegistrationForm url='registration/'/>	
      </Tab>
    </Tabs>
  );
}


