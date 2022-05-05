//var websocket = require('./GameMain.js').websocket
import {MultiSizer} from './myTools.js'
import Cookies from 'js-cookie';
var websocket=require('./GameMain.js').ws()
var chatBoard;
var canvas;
var ctx;           
var images = {};
var image_names = ["wferz.png","wkonb.png","wroof.png","wslon.png","wking.png","wpeshka.png",
"bferz.png","bkonb.png","broof.png","bslon.png","bking.png","bpeshka.png",'strelkab.png','strelkas.png'];
var canevent = null;
var fieldwidth = 40;
var id;
var board;
var game;
var connected=false;
export function connect(){
	connected=true
}
/*for (let e of ["mousemove","mousedown","mouseup"]){
canvas.addEventListener(e, function(event){
	//if (e=="mouseup"){return;}
	canevent = event;
	
})}*/
var moveaplier = true;
var makeMoveFunc=(e,spr)=>{if (spr.canMoveHere()){game.player.selectedfigure.makeMove(spr);game.switchTurn();}
	else{if (game.player.selectedfigure != null){game.player.selectedfigure.figReturn()}};game.player.selectedfigure=null;
	if (spr.fillcolor =="green")spr.fillcolor=null;;}
var adapter = new MultiSizer({'sm':[(e,spr)=>{},makeMoveFunc,(spr,e)=>spr.mousecollide(e.offsetX,e.offsetY)],'xl':[makeMoveFunc,(e,spr)=>{},(spr,e)=>false]})
class Flipper{
	angle_in_rad = 0
	angle_delta = Math.PI/1000*25
	delta=0
	flipped = false
	flip(){
		this.flipped=this.flipped == false ? true : false
		var k=0;
		var timer = setInterval(()=>{
		if (this.flipped)
			this.angle_in_rad+=this.angle_delta;
		else
			this.angle_in_rad-=this.angle_delta;
		k+=1
		if (k==40)
			clearInterval(timer)
		},25)
		
		this.flip_desk()
		//setTimeout(()=>{clearInterval(timer)},1000)
	}
	flip_desk(){
		const container = document.querySelector(".myCanvas");
		container.classList.toggle("flipping");
	}
}
export var flipper= new Flipper()
function canvasevent(e){canevent=e}


function arrayRemove(arr, value) { 
   return arr.filter(function(geeks){
       return geeks != value;
   });
 
}
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
function isFlipped(x){
    x = board.flipped==1 ? x : 7-x
    return x
}
function Surface(ctx,makebackgroundfunc,posx=0,posy=0){
	this.px=posx;
	this.py = posy;
	this.context = ctx;
	this.makebackground = makebackgroundfunc;
	this.subsurfaces = [];
	this.blit = function(surface){
		this.subsurfaces.push(surface);
	};
	this.draw = function(){
		this.context.save();
		this.context.translate(this.px,this.py);
		this.makebackground(this);
		this.subsurfaces.forEach(surf => surf.draw());
		this.context.restore();
	};
};

function loadImage(name){
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
            resolve(img);
        }
        img.onerror = (err) => {
            reject(err)
			console.log(img.src)
        }
        img.src = 'images/' +name;
 
    })
}

class Sprite{
	onmousedown=[]
	onmouseup=[]
	onmouseover=[]
	onmouseout=[]
	onmousemove=[]
	behaviours=[]
	width;
	height;
	posx;
	posy;
	mouseintersect=false;
	fillcolor=null;
	interfunc=(spr,e)=>{adapter.actions[2](spr,e)}
	handleEvent(e){
		if (e.type == "mousemove") this.onmousemove.forEach(func=>func(e,this));
		if (this.mouseintersect == true || this.interfunc(this,e)){
			//console.log(e.type);
			if (e.type == "mousedown"){
				this.onmousedown.forEach(func=>func(e,this));
				
			}
			if (e.type == "mouseup"){
				this.onmouseup.forEach(func=>func(e,this));
				
			}
			
			if (this.mousecollide(e.offsetX,e.offsetY)==false){
				this.onmouseout.forEach(func=>func(e,this));
				this.mouseintersect = false;
			}
		}
		if (this.mouseintersect==false)
		{
			if (this.mousecollide(e.offsetX,e.offsetY)==true){
				this.onmouseover.forEach(func=>func(e,this));
				this.mouseintersect = true;}
		}
	}
	mousecollide(x,y){		
		if (x>=this.posx && x<=this.posx+this.width && y>=this.posy && y<=this.posy+this.height){
			this.mouseintersect = true;			
			return true;
		}
		else return false;
	}
	update(){
		ctx.save()
		this.behaviours.forEach(b=>b(this));
		ctx.restore()
	}
}
class Arrow extends Sprite{
	behaviours=[(spr)=>{ctx.save()
						ctx.globalAlpha=0.7;
						ctx.translate(fieldwidth*(spr.px+0.5),fieldwidth*(spr.py+0.5))
						//var angle = Math.atan2(this.height_in_fields,this.width_in_fields)
						ctx.rotate(spr.angle)
						ctx.drawImage(spr.img,0,-fieldwidth/2,
						spr.length,fieldwidth)
						ctx.restore()
		}]
	constructor(startx,starty,endx,endy){
		super()
		this.px=startx
		this.py=starty
		this.width_in_fields = endx-startx
		this.abs_width=Math.abs(endx-startx)
		this.height_in_fields = endy-starty
		this.abs_height = Math.abs(endy-starty)
		this.img=this.width_in_fields**2+this.height_in_fields**2 > 20 ? images['strelkab.png'] : images['strelkas.png']
		this.angle = Math.atan2(this.height_in_fields,this.width_in_fields)
		this.length = Math.sqrt(this.abs_width**2+this.abs_height**2)*fieldwidth
	}
}
class Field extends Sprite{
	figure = null;
	onmouseover=[(e,spr)=>{if (spr.canMoveHere()) spr.fillcolor="green";}]
	onmouseout =[(e,spr)=>{if (spr.fillcolor =="green")spr.fillcolor=null;}]
	onmouseup = [/*(e,spr)=>{if (game.player.selectedfigure)game.player.selectedfigure.timeout=true},*/(e,spr)=>{adapter.actions[0](e,spr)}]
	onmousedown=[(e,spr)=>{adapter.actions[1](e,spr)}]
	behaviours = [(spr)=>{ctx.clearRect(spr.px*fieldwidth,spr.py*fieldwidth,fieldwidth,fieldwidth)}]
	constructor(color,px,py){
		super();
		this.startcolor=color;
		this.px=px;
		this.py=py;
		this.posx = px*fieldwidth;
		this.posy = py*fieldwidth;
		this.width = fieldwidth;
		this.height = fieldwidth;
		this.behaviours.push((obj)=>{ctx.fillStyle=obj.startcolor;
			ctx.fillRect(obj.px*fieldwidth,obj.py*fieldwidth,fieldwidth,fieldwidth);})
		this.behaviours.push((spr)=>{if (game.player.selectedfigure&&game.player.selectedfigure.cantogofields.includes(this)){
			ctx.fillStyle = "LawnGreen";
			ctx.globalAlpha=0.2;
			ctx.fillRect(spr.px*fieldwidth,spr.py*fieldwidth,fieldwidth,fieldwidth)}
			if (game.player.selectedfigure && game.player.selectedfigure.field == this){
				ctx.fillStyle = "Blue";
				ctx.globalAlpha=0.5;
				ctx.fillRect(spr.px*fieldwidth,spr.py*fieldwidth,fieldwidth,fieldwidth)}
			})
		this.behaviours.push((spr)=>{if (spr.fillcolor!=null){
			ctx.fillStyle = spr.fillcolor;
			ctx.globalAlpha=0.5;
			ctx.fillRect(spr.px*fieldwidth,spr.py*fieldwidth,fieldwidth,fieldwidth);}})
		this.sledpeshki = null;
	}
	setFigure(figure){
		this.figure = figure
	}
	canMoveHere(){
		var selectedfig=game.player.selectedfigure;
		if ( selectedfig!= null && selectedfig.canMoveHere(this)==true){
			return true;
		}
		else
		{
			return false;
			/*if (selectedfig==null)
				return false;
			else{
				selectedfig.figReturn();
				return false;
			}*/
		}
	}
}	
		
class Board{
	fields = []
	figures = []
	wfigures = []
	bfigures = []
	arrow = null
	kings=[null,null]
	rooks = [[],[]];
	sledpeshkifield;
	figparams = [["roof",0,0,0],["konb",1,0,0],["slon",2,0,0],["king",4,0,0],["ferz",3,0,0],["slon",5,0,0],["konb",6,0,0],["roof",7,0,0],
	["peshka",0,1,0],["peshka",1,1,0],["peshka",2,1,0],["peshka",3,1,0],["peshka",4,1,0],["peshka",5,1,0],["peshka",6,1,0],
	["peshka",7,1,0],
	["roof",0,7,1],["konb",1,7,1],["slon",2,7,1],["king",4,7,1],["ferz",3,7,1],["slon",5,7,1],["konb",6,7,1],["roof",7,7,1],
	["peshka",0,6,1],["peshka",1,6,1],["peshka",2,6,1],["peshka",3,6,1],["peshka",4,6,1],["peshka",5,6,1],["peshka",6,6,1],
	["peshka",7,6,1]]
	flipped=1
	constructor(){
		
		this.figures = [this.wfigures,this.bfigures];
	}
	createNewGame(loadeddata=null){
		var s=[]
		var wking;
		var bking;
		var color = ["white","saddlebrown"];
		for (let i=0; i<8;i++){
			for (let j=0; j<8;j++){
				s.push(new Field(color[(i+j+1)%2],i,j))
			}
			this.fields.push(s);
			s=[]
		}
		var figuress
		if (!loadeddata)
			figuress=this.figparams
		else
			figuress = loadeddata.figures
		for (let i of figuress){
			if (i[0] == "king")
				var fig = new KingFigure(i[0],this.fields[i[1]][i[2]],game.players[i[3]])				
			else if (i[0] =="peshka")
				var fig = new PeshkaFigure(i[0],this.fields[i[1]][i[2]],game.players[i[3]])
			else
				var fig = new Figure(i[0],this.fields[i[1]][i[2]],game.players[i[3]])
			if (i[0] == "roof")
				this.rooks[i[3]].push(fig);
			//this.figures.push(fig)
			i[3]==0 ? this.wfigures.push(fig) : this.bfigures.push(fig);
			if (i[0]=="king"){
				this.kings[i[3]] = fig;
			}
			if (loadeddata){
				if (!i[5])
					fig.firstmove=false
					//game.turn=i[6]-1
			}
		}
		if (loadeddata){
			loadeddata.sledi.forEach(sledAr=>{board.fields[sledAr[0]][sledAr[1]].sledpeshki=board.fields[sledAr[2]][sledAr[3]].figure			
			})
			game.turn=loadeddata.turn-1
			game.switchTurn()
			if (game.turn % 2 === game.player.team)
				board.arrow = new Arrow(...loadeddata.lastmove)
		}
		//board.fields[this.px][(this.py+field.py)/2].sledpeshki = this;
	}
	redraw(){		
		this.fields.forEach(str=>str.forEach(el=>el.update()));
		this.figures.forEach(str=>str.forEach(el=>el.update()));
		this.arrow?.update()
		if (game.player.selectedfigure)
			game.player.selectedfigure.update();
	}
	handleEvent(e){
		this.fields.forEach(str=>str.forEach(el=>el.handleEvent(e)));
		this.figures.forEach(str=>str.forEach(el=>el.handleEvent(e)));
	}
	flip(){
        this.figures.forEach(str=>str.forEach(fig=>{fig.field.figure=board.fields[fig.px][fig.py].figure;fig.px = 7- fig.px;fig.py=7-fig.py;
        var fld = board.fields[fig.px][fig.py]; fig.field=fld; fld.figure=fig;
        fig.posx = fld.posx; fig.posy=fld.posy}))
        this.flipped = this.flipped*-1;
	}
	updateFigPos(){
		this.figures.forEach(str=>str.forEach(el=>{el.posx=el.px*fieldwidth;el.posy=el.py*fieldwidth}));
		this.fields.forEach(str=>str.forEach(el=>{el.posx=el.px*fieldwidth;el.posy=el.py*fieldwidth}));
	}
}


class Figure extends Sprite{
	onmousedown=[(e,spr)=>{if (connected && spr.player.selectedfigure == null && game.player.team==spr.team && game.turn%2==game.player.team && !spr.timeout)
	{spr.setSelected();spr.posx= e.offsetX-spr.width/3;spr.posy = e.offsetY-spr.width/3;spr.timeout=true}}]
	onmouseup=[(e,spr)=>{}]
	onmousemove = [(e,spr)=>{if (spr.selected) {spr.posx= e.offsetX-spr.width/3;spr.posy = e.offsetY-spr.width/3}}]
	behaviours=[(spr)=>{ctx.save()
						ctx.translate(spr.posx+fieldwidth/2,spr.posy+fieldwidth/2)
						ctx.rotate(flipper.angle_in_rad)
						ctx.drawImage(spr.img,-fieldwidth/2,-fieldwidth/2,fieldwidth,fieldwidth)
						ctx.restore()
		//ctx.drawImage(spr.img,spr.posx,spr.posy,fieldwidth,fieldwidth)
		}]
	constructor(path,field,player){
		super();
		var teams = ["w","b"]
		this.name = path;
		this.player=player;
		this.team=player.team;
		this.field = field;
		this.field.setFigure(this);
		this.px=field.px;
		this.py=field.py;
		this.posx=field.posx;
		this.posy = field.posy;
		this.img = images[teams[this.team]+path+".png"];
		this.turnrule = game.turnrules[path].bind(this);
		this.width=fieldwidth;
		this.height = fieldwidth;
		this.selected = false;
		this.cantogofields = [];
		this.firstmove = true;
		this.timeout=false;
	}
	setSelected(){
		this.turnrule();
		this.enemyFiguresCantAttackOurKing();
		this.player.selectedfigure=this;
		this.selected = true;
	}
	/*update(){
		super.update()
		this.timeout=false
	}*/
	canMoveHere(field){
		if (this.cantogofields.includes(field)){
			return true;
		}
		else {
			return false;
		}
		}
	
	makeMove(field,send=true,switcht=true){
	    var predpx = this.px
	    var predpy = this.py
		this.px = field.px;
		this.py = field.py;
		this.posx = field.posx;
		this.posy = field.posy;		
		if (field.figure != null)
		{	
			removeItemOnce(board.figures[field.figure.team],field.figure);
		}
		field.setFigure(this);
		this.field.figure=null;
		this.field = field;
		this.selected = false;
		this.firstmove = false;
		this.timeout=false;
		this.cantogofields.length = 0;
		//console.log(this.field);
		if (send){
		    websocket.send(JSON.stringify({type:'move',startfield:[isFlipped(predpx),isFlipped(predpy)],
		    endfield:[isFlipped(this.px),isFlipped(this.py)],
		    user_id:id,swt:switcht}))
			board.arrow=null
		    return send
		}
	}
	figReturn(){		
		//console.log('отпустили',this.timeout)
		//this.timeout=false;
		this.posx = this.px*fieldwidth;
		this.posy = this.py*fieldwidth;
		this.selected = false;
		this.player.selectedfigure=null;
		this.cantogofields.length = 0;
		setTimeout(()=>this.timeout=false,10)
		//this.timeout=false
		//game.player.selectedfigure=null;
	}
	enemyFiguresCantAttackOurKing(){
		this.field.figure = null;
		var cantogofieldscopy = [...this.cantogofields];
		for ( let fld of cantogofieldscopy){
			let afigure = fld.figure;
			fld.figure = this;
			for (let figure of board.figures[(this.team+1)%2]){
				figure.turnrule();
				if (this.name == "king"){
					if (figure.cantogofields.includes(fld)){
						removeItemOnce(this.cantogofields,fld);
						//break;
					}
				}
				if (figure.cantogofields.includes(board.kings[this.team].field)){
					board.kings[this.team].rokerate=false
					if (fld != figure.field && this.name != "king"){
						removeItemOnce(this.cantogofields,fld);
						//break;
					}
					figure.cantogofields=[];
				}
				figure.cantogofields=[]	
			}
			fld.figure = afigure;
			//board.fields[fld.px,fld.py].figure = afigure;
		}
		this.field.figure = this;
		//console.log("ended");
	}
}
class PeshkaFigure extends Figure{
	constructor(path,field,player){
		super(path,field,player)
	}
	makeMove(field,send=true){
		if (Math.abs(this.py-field.py) == 2){
			board.fields[this.px][(this.py+field.py)/2].sledpeshki = this;
			board.sledpeshkifield = board.fields[this.px][(this.py+field.py)/2];
		}
		if (field.sledpeshki != null){
			removeItemOnce(board.figures[(this.team+1)%2],field.sledpeshki)
			if (field.sledpeshki.field)
			    field.sledpeshki.field.figure = null;
			field.sledpeshki.field = null
		//	field.sledpeshki=null
		}
		super.makeMove(field,send)
	    this.prevrashenie()
	}
	prevrashenie(){
		//var p = this.team == 1 ? 7 : 0
		//console.log(p)
		if (this.py == 0 || this.py==7){
			removeItemOnce(board.figures[this.team],this)
			var ferz = new Figure("ferz",board.fields[this.px][this.py],game.players[this.team])			
			board.figures[this.team].push(ferz);						
		}
	}
}
class KingFigure extends Figure{
	constructor(path,field,player){
		super(path,field,player)
		this.rokeratewith=[]
		this.rokerate=true
	}
	makeMove(field,send=true){
		if (Math.abs(this.px-field.px) == 2)
			this.rokeratemove(field,send)
        super.makeMove(field,send)
		this.rokeratewith=[]
	//	game.switchTurn()
	//	console.log(this.field)
	}
	rokeratemove(field,send=true){
	    var rook;
		for (var r of this.rokeratewith)
			if (r[0] == field.px && r[1].team == this.team)
				rook = r[1];
		if (rook){
		    rook.makeMove(board.fields[(this.px+field.px)/2][this.py],false,false)
		    console.log("ya tut")
		}
	}
}

class Player{
	selectedfigure=null
	constructor(team){
		this.team=team
	}
}

class Viewer{
    team=null
    selectedfigure=null
}

class Game{
	players = [new Player(0),new Player(1)]
	player;
	turnrules = {ferz: ferzrule,king: korolrule,konb: konbrule,roof: roofrule,slon: slonrule, peshka:peshkarule}
	turn = 0
	curplayerkingfield;
	constructor(){
		this.player = this.players[0]
		this.curplayerkingfield = null
	}
	switchTurn(){
		board.fields.forEach(str=>str.forEach(el=>{if (el.sledpeshki && el.sledpeshki.team != this.turn%2) el.sledpeshki=null}));
		/*if (this.curplayerkingfield)
			this.curplayerkingfield.fillcolor = null;		
		this.curplayerkingfield = board.kings[(this.player.team+1)%2].field
		for (var figure of board.figures[this.player.team]){
			figure.turnrule()
			if (figure.cantogofields.includes(this.curplayerkingfield)){
				this.curplayerkingfield.fillcolor = "red";
			}				
		}*/
        if (this.curplayerkingfield)
            this.curplayerkingfield.fillcolor = null
		var checkmat=false
		for (var figure of board.figures[this.turn%2]){
			figure.turnrule()
			if (figure.cantogofields.includes(board.kings[(this.turn+1)%2].field)){
				board.kings[(this.turn+1)%2].field.fillcolor = "red";
				checkmat=true
				this.curplayerkingfield = board.kings[(this.turn+1)%2].field
				//
			}
		}
		this.checkMattOrDraw(checkmat)
		this.turn = this.turn + 1;
		//this.player = this.players[this.turn%2];
		board.kings.forEach(king=>king.rokerate=true);
		board.figures.forEach(str=>str.forEach(el=>el.cantogofields=[]));
	}
	checkMattOrDraw(checkmat){
		/*for (var figure of board.figures[this.turn%2]){
			if (figure.cantogofields.includes(board.kings[(this.turn+1)%2].field))
		}*/
		var draw = true
		var matt=checkmat
		//var ctgflist=[]
		//console.log(checkmat)
		for (var figure of board.figures[(this.turn+1)%2]){
			figure.turnrule()
			figure.enemyFiguresCantAttackOurKing()
			if (figure.cantogofields.length!=0){
				matt=false
				draw=false
				break;
			}
		}
		
		if (draw && !matt)
			setTimeout(()=>alert('draw'),100)
		if (matt){
			var k = this.turn % 2 ? 'черн' : 'бел'
			setTimeout(()=>alert(`${k}ые выиграли`),100)
		}
	}
}
function ferzrule(){
	slonn(this);
	rooff(this);
};
function korolrule(){
	var v = [-1,0,1]
	var fields = board.fields
	for (let i of v)
		for (let j of v){
			if (inBoard(this.px+i,this.py+j) && Math.abs(i)+Math.abs(j) != 0){
				var field = fields[this.px+i][this.py+j]
				if(field.figure ==null || field.figure.team != this.team)
					this.cantogofields.push(field);
			}
		}
	rokerate(this);
};
function konbrule(){
	var k=[-1,-2,1,2]
	for(let i of k)
		for (let j of k)
			if (Math.abs(i)+Math.abs(j)==3 && inBoard(this.px+i,this.py+j)){
				var field = board.fields[this.px+i][this.py+j];
				if (field.figure == null)
					this.cantogofields.push(field)
				else
					if (field.figure.team != this.team)
						this.cantogofields.push(field)
		}
	/*for (var str of board.fields)
		for (var field of str)
			this.cantogofields.push(field)*/
	//this.cantogofields.push(board.fields[0][0])
};
function roofrule(){
	rooff(this);
};
function slonrule(){
	slonn(this);
};
function peshkarule(){
	var v = this.team==0 ? 1 : -1;
	v = board.flipped==1 ? v : -v;
	var fields = board.fields;
	if (inBoard(this.px,this.py+v)&& fields[this.px][this.py+v].figure == null){
		this.cantogofields.push(fields[this.px][this.py+v]);
		if (this.firstmove && fields[this.px][this.py+2*v].figure == null)
			this.cantogofields.push(fields[this.px][this.py+2*v])
	}
	
	for (let i of [1,-1]){
		var f= this.px+i;
		var k = this.py+v
		if (inBoard(f,k)){
			if (fields[this.px+i][this.py+v].figure != null && fields[this.px+i][this.py+v].figure.team != this.team){
				this.cantogofields.push(fields[this.px+i][this.py+v]);
			}
			else if (fields[this.px+i][this.py+v].sledpeshki != null && fields[this.px+i][this.py+v].sledpeshki.team != this.team)
				this.cantogofields.push(fields[this.px+i][this.py+v])
		}			
	}
};
function inBoard(x,y){
	if (x>-1 && x<8 && y>-1 && y<8)
		return true
	else
		return false
}
function slonn(obj){
	var k=[1,-1]
	for (let i of k)
		for (let j of k){
			var field;
			var p=1;
			while(inBoard(obj.px+p*i,obj.py+p*j)){
				field = board.fields[obj.px+p*i][obj.py+p*j];
				if (field.figure == null)
					obj.cantogofields.push(field)
				else{
					if (field.figure.team == obj.team)
						break;
					else {
						obj.cantogofields.push(field);
						//console.log("fff", board.fields[3][5]);
						//console.log("ya zdes", field);
						break;
					}
				}
				p++;
				
			}
		}
}
function rooff(obj){
	var v = [[1,0],[-1,0],[0,1],[0,-1]];
	var i;
	var j;
	var field;
	for (let t of v){
		i=t[0];
		j=t[1];
		var p=1;
		while (inBoard(obj.px+p*i,obj.py+p*j)){
			field = board.fields[obj.px+p*i][obj.py+p*j];
			if (field.figure == null)
					obj.cantogofields.push(field)
				else{
					if (field.figure.team == obj.team)
						break;
					else {
						obj.cantogofields.push(field);
						break;
					}
				}
			p++
		}
	}	
}
function rokerate(king){
	if (king.firstmove && board.kings[(king.team+1)%2].rokerate)
		for (var rook of board.rooks[king.team])
			if (rook.firstmove)
				if (noFiguresBetween(king,rook)){
					var x = king.px > rook.px ? -2 : 2;
					if (rokerateNotUnderAttack(king,rook)){					
						king.rokeratewith.push([king.px+x,rook]);
					//console.log(king.rokeratewith);
						king.cantogofields.push(board.fields[king.px+x][king.py])
					}
				}
}
function rokerateNotUnderAttack(king,rook){
	var z = king.px > rook.px ? king.px-2 : king.px+2;
	let t = Math.min(z,king.px)
	let k = Math.max(z,king.px)
	for (var fig of board.figures[(king.team+1)%2]){
		if (fig.name!="king"){
			fig.turnrule()
			for (let i=t;i<=k;i++){
				var fld = board.fields[i][king.py];
				if (fig.cantogofields.includes(fld)){
					return false;
				}
			}
		}
	}
	return true;
}
function noFiguresBetween(king,rook){
	var min = Math.min(...[king,rook].map((el)=>el.px))
	var max = Math.max(...[king,rook].map((el)=>el.px))
	for (let i=min+1;i<max;i++)
		if (board.fields[i][king.py].figure != null)
			return false
	//king.rokeratewith.push([i,king.py,rook]);
	return true;
}
	
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function canvasupdate(){
	//board = new Board();
	board.redraw();
	while (true) {if(canevent != null)//sprit.handleEvent(canevent)};
	//sprit.update();
	{board.handleEvent(canevent);}
	board.redraw();
	canevent = null;
	await sleep(25);}
	}

function newGame(){
    websocket.send(JSON.stringify({type:"connection",content:"newgame"}))
}
function cansize(){
	game?.player.selectedfigure?.figReturn()
	if (game && game.player.selectedfigure)
		game.player.selectedfigure.timeout=false
	var candiv = document.getElementById("canvasdiv")
	//var canwidth=Math.max(240,Math.min(parseFloat(getComputedStyle(candiv).width)*0.8,480))
	//var canwidth=Math.min(parseFloat(getComputedStyle(candiv).width)*0.8,480)
	var canwidth=parseFloat(getComputedStyle(candiv).width)*0.9
	
	canvas.width=canwidth;
	canvas.height=canwidth;
	fieldwidth=canwidth/8;
	//adapter.onSizeChanged()
	adapter.onSizeChanged()
}
var on_ws_message;
window.addEventListener("DOMContentLoaded", async () => {
	//chatBoard = require('./GameMain.js').chatBoard
	on_ws_message = require('./GameMain.js').on_ws_message
	canvas = document.getElementById("myCanvas")
	cansize()
    ctx = canvas.getContext("2d");
	canvas.addEventListener("mouseup", async function(event){
	canvasevent(event);
	//canvas.removeEventListener("mousemove",canvasevent)
	moveaplier=false;
	await sleep(25);
	moveaplier=true;
	//canvas.addEventListener("mousemove",canvasevent)
})
	
canvas.addEventListener("mousedown", canvasevent)
canvas.addEventListener("mousemove", function(event){

    if (moveaplier)
        canvasevent(event)
})
canvas.addEventListener("mouseout", function(event){
				var sf = game.player.selectedfigure;
				if (sf != null)
					sf.figReturn();
		})
    var preloads = await Promise.all(
        image_names.map(
            imageName => loadImage(imageName)
            .then( img => ([imageName, img]))
            .catch(err => {
                // этот catch нужен, потому что Promise.all отменяется, если отменился хоть один из промисов
                console.error(err);
                // если загрузка картинки не удалась - можно вернуть дефолтную
                return null;
            })
    )).then( async imageEntries => {
        // тут мы работаем с загружеными картинками
		
        images = Object.fromEntries(imageEntries);
		/*while (!connected){
			console.log(connected)
			if (connected){
				game = new Game();
				board = new Board()
				canvasupdate()
			}
			else
				sleep(25)
		}		*/
		//await sleep(400)
		game = new Game();
		board = new Board()
		//canvasupdate()
		//window.addEventListener('resize',()=>{cansize();board.updateFigPos()});
    });
  //websocket = new WebSocket("ws://localhost:8000/ws/livegame/"+1)
	
	
//	websocket.onopen=(event)=>{ console.log('start game')
 // websocket.send(JSON.stringify({type:'connection',content:'startgame',token: Cookies.get('token')}))}
  websocket.onmessage = ({ data }) => {
    const event = JSON.parse(data);
	if (event.type=='on_open'){
		websocket.send(JSON.stringify({type:'connection',content:'startgame',token: Cookies.get('token')}))
	}
    if (event.type=="startgame"){
        id = event.data.team
		
		if (id !== undefined)
			game.player = game.players[id]
		else
			game.player=new Viewer()
		board.createNewGame()           
		canvasupdate()
		window.addEventListener('resize',()=>{cansize();board.updateFigPos()});
        if (event.content=="ok"){			
            if (id==0){
				flipper.flip()
			}
        }
		//connected = true;
    }
	if (event.type=="loadgame"){
        id = event.data.team
		
		if (id !== undefined)
			game.player = game.players[id]
		else
			game.player=new Viewer()
		board.createNewGame(event.data.figs)           
		canvasupdate()
		window.addEventListener('resize',()=>{cansize();board.updateFigPos()});
        if (event.content=="ok"){			
            if (id==0)
                flipper.flip()
        }
		connected = true;
    }
    if (event.type=="move_done"){
        let startposx = isFlipped(event.data.startfield[0])
        let startposy = isFlipped(event.data.startfield[1])
        let endposx = isFlipped(event.data.endfield[0])
        let endposy = isFlipped(event.data.endfield[1])
        board.fields[startposx][startposy].figure.makeMove(board.fields[endposx][endposy],false)
		board.arrow=new Arrow(startposx,startposy,endposx,endposy)
        if (event.data.swt)
            game.switchTurn()
    }
	if (event.type == "reload_page")
		window.location.reload();
	on_ws_message(event)
  };
  })



/*function getWebSocketServer() {
  if (window.location.host === "ufaevmihail.github.io") {
    return "wss://chessproject1.herokuapp.com/";
  } else if (window.location.host === "localhost:63342") {
    return "ws://localhost:8001/";
   //return "wss://chessproject1.herokuapp.com/";
  } else {
    throw new Error(`Unsupported host: ${window.location.host}`);
  }
}*/
