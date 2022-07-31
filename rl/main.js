GLOBAL={};
let DEBUG_MODE_=false;
GLOBAL.forSmartphone=null;

document.addEventListener('keydown', keydown);
function keydown(event){
	switch(event.key){
		case "ArrowUp":
			event.preventDefault();
	    GLOBAL.player.explore(-1,0);
			break;
		case "ArrowDown":
			event.preventDefault();
	    GLOBAL.player.explore(1,0);
			break;
		case "ArrowLeft":
			event.preventDefault();
	    GLOBAL.player.explore(0,-1);
			break;
		case "ArrowRight":
			event.preventDefault();
	    GLOBAL.player.explore(0,1);
			break;
	}
	return false;
}

(()=>{
	let xStart=null;
	let xEnd=null;
	let yStart=null;
	let yEnd=null;
	let frame=document.getElementById("frame");

	frame.addEventListener("touchstart",e=>{e.preventDefault();xStart=e.touches[0].pageX;yStart=e.touches[0].pageY;});
	frame.addEventListener("touchmove",e=>{e.preventDefault();xEnd=e.touches[0].pageX;yEnd=e.touches[0].pageY;});
	frame.addEventListener("touchend",e=>{e.preventDefault();GLOBAL.forSmartphone=f(xEnd-xStart,yStart-yEnd);});

	f=(dx,dy)=>{console.log({dx,dy});
		if(Math.max(Math.abs(dx),Math.abs(dy))<15){return null;}
		if(Math.abs(dx)>Math.abs(dy)){return {"dx":0,"dy":dx>0?1:-1};}
		return {"dx":dy>0?-1:1,"dy":0};
	}
})();

GLOBAL.player={};
GLOBAL.player=new Player(0,null,null,"@",300,300,NaN,NaN,1000,20,20,NaN,NaN);
GLOBAL.floor=1;
GLOBAL.unit=[];

GLOBAL.messages=["Welcome!!","Readme -> (Progress)","Bug Report etc. -> github.com/wiiiiam104/rl/issues"];
GLOBAL.present=()=>{
	if(DEBUG_MODE_)GLOBAL.map.display=matrix(40,150,true);
	let border="------------------------------------------------\n";
	let status=GLOBAL.player.status;
	let statusStr=`hp:${status.hp}/${status.maxHp} lvl:${status.lvl} exp:${Math.floor((status.exp%1000)/10)}.${status.exp%10}% atk:${status.atk} def:${status.def}`;
	document.getElementById("map").innerHTML=GLOBAL.map.toStr+"\n\n"+border+GLOBAL.messages.slice(-3).join("\n")+"\n"+border+"floor:"+GLOBAL.floor+"\n"+statusStr;
}

GLOBAL.map=new Map(40,150,10,13);
GLOBAL.map.create();


setInterval(()=>{
	if(GLOBAL.forSmartphone!==null)
  	GLOBAL.player.explore(GLOBAL.forSmartphone.dx,GLOBAL.forSmartphone.dy);
},250);