export class Dispatcher{
	comps={}
	events={}
	constructor(){
		this.emitEvent=this.emitEvent.bind(this);
	}
	registerComp(name,comp,func=(comp)=>{}){
		if (!(name in this.comps)){
			this.comps[name]=comp;
			comp.dName=name;
			comp.emit=this.emitEvent;
			comp.subscribeEvent=this.subscribeEvent.bind(this);
			if (comp.componentWillUnmount !== undefined)
				comp.componentWillUnmount=this.removeComp(name,comp.componentWillUnmount.bind(comp))
			func(comp);
		}
		/*else{
			this.registerComp(name+"1",comp);
			console.log("такое имя компонента в диспетчере уже есть")
		}*/
		
	}
	createEvent(...args){
		for (var arg of args)
			this.events[arg]=[]
	}
	subscribeEvent(eventName,func,obj=null){
		if (eventName in this.events){
			if (obj)
				this.events[eventName].push([obj.dName,func.bind(obj)])
			else
				this.events[eventName].push([null,func])
		}
		else{
			this.events[eventName]=[]
			this.subscribeEvent(eventName,func,obj)
		}
	}
	unSubscribeAllEvents(objName){
		for (var eventName in this.events){
			this.unSubscribeEvent(objName,eventName)
		}
	}
	unSubscribeEvent(objName,eventName){
		this.events[eventName]=this.events[eventName].filter(ent=>ent[0]!=objName)
	}
	emitEvent(eventName,...args){
		if (eventName in this.events){
			this.eventWork(eventName,args)
		}
		else{
			console.log('нету такого события')
		}
	}
	eventWork(eventName,...args){
		this.events[eventName].forEach(ent=>ent[1](args))
	}
	removeComp(name,unmountFunc){
		function inner(){
			this.unSubscribeAllEvents(name);
			delete this.comps[name]
			return unmountFunc()
		}
		return inner
	}
	addComp(comp,mountFunc){
		function inner(){
			this.comps[comp.dName]=comp
			return mountFunc()
		}
		return inner
	}
	dec(f,f1,obj,...args){
		function inner(...args){
			f1()
			return f.call(obj,...args)
		}
		return inner
	}
}


export class MultiSizer{
	sizes={'xs':[0,576],'sm':[577,768],'xl':[1200,1000000]}
	currentSize;
	actions=[]
	constructor(sizesDict){
		//sizesDict={'xs':[...],'xl':[...]}
		//sizesArray.forEach(sizeName=>{if (!(sizeName in this.sizes)) {delete this.sizes[sizeName]}})
		this.sizesDict=sizesDict
	    this.sizesArray=Object.entries(sizesDict);
		for (var sizeName in this.sizes){
			if (!(sizeName in sizesDict)){
				delete this.sizes[sizeName]
			}
		}
		//console.log(this.sizesArray)
		this.onSizeChanged()
		//window.addEventListener('resize',this.onSizeChanged.bind(this));
	}
	onSizeChanged(){
		var size=document.documentElement.clientWidth;
		var next=false;
		var curSize=this.currentSize;
		/*this.sizesArray.forEach(sizeEnt=>{
			console.log(sizeEnt)
			if ((size>this.sizes[sizeEnt[0]][0] && size<this.sizes[sizeEnt[0]][1]) || next){
				curSize=sizeEnt[0]
				return;
			}
			else{
				if (this.sizes[sizeEnt[0]][0]>size)
					next=true;
				}
		})*/
		/*var length = this.sizesArray.length
		var found = false*/
		for (let sizeEnt of this.sizesArray){
			if ((size>=this.sizes[sizeEnt[0]][0] && size<=this.sizes[sizeEnt[0]][1])){
				curSize=sizeEnt[0]
				break;
			}
			else if (this.sizes[sizeEnt[0]][0]>size){
				curSize=sizeEnt[0]
				break;
			}
				
		}
		/*if (!found)
			curSize=this.sizesArray[length-1][0]*/
		if (curSize != this.currentSize){
			this.currentSize=curSize
			this.actions=this.sizesDict[curSize]
			this.actions.forEach(act=>act.bind(this))
		}
		//console.log(this.currentSize,this.actions)
	}
}


