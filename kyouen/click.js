class Point{
  constructor(y,x){
    this.x=x;
    this.y=y;
  }

  get divElement(){
    return document.getElementById(`cell${this.y}${this.x}`);
  }

  get color(){
    const arr=this.divElement.classList;
    return arr.contains("white")?"white":arr.contains("black")?"black":"null"
  }

  toBlack(){
    let tar=this.divElement;
    tar.classList.remove("white");
    tar.classList.add("black");
  }

  toWhite(){
    let tar=this.divElement;
    tar.classList.remove("black");
    tar.classList.add("white");
  }

  static replaceWhiteWithBlack(){
    for(let i=0;i<size;i++){
      for(let j=0;j<size;j++){
        let point=new Point(i,j);
        if(point.color=="white"){point.toBlack();}
      }
    }
  }

  static distance(point1,point2){
    const dx=point1.x-point2.x;
    const dy=point1.y-point2.y;
    return Math.sqrt(dx*dx+dy*dy);
  }

  static areCocircle(points){
    const d01=Point.distance(points[0],points[1]);
    const d02=Point.distance(points[0],points[2]);
    const d03=Point.distance(points[0],points[3]);
    const d12=Point.distance(points[1],points[2]);
    const d13=Point.distance(points[1],points[3]);
    const d23=Point.distance(points[2],points[3]);
    const equal=(arg1,arg2)=>Math.abs(arg1-arg2)<0.000000001;
    return equal(d01*d23,d02*d13+d03*d12)||
      equal(d02*d13,d01*d23+d03*d12)||
      equal(d03*d12,d01*d23+d02*d13);
  }

  static callCancel(){
    whitePoints.map(point=>point.toBlack());
    if(latestPoint!=null)latestPoint.toWhite();
    callFlg=false;
    document.getElementsByClassName("rabelForCallButton")[time.turn].innerHTML="kyouen!";
  }
}

class Time{
  constructor(initialTime){
    this.turn=(Math.random()<0.5)-0;
    this.player0=initialTime;
    this.player1=initialTime;
    this.timerId=undefined;
    document.getElementsByClassName("player")[this.turn].classList.add("turn");
  }

  present(){
    const formatTime=second=>`${Math.floor(second/60)}:${("00"+second%60).slice(-2)}`;
    document.getElementsByClassName("timer")[0].innerHTML=formatTime(this.player0);
    document.getElementsByClassName("timer")[1].innerHTML=formatTime(this.player1);
  }

  countDown(){
    this.timerId=setTimeout(()=>{
      if(eval(`this.player${this.turn}<=0`)){
        (new Audio("./mp3/bell.mp3")).play();
        alert("flag!");
        endFlg=true;
        sendMessage("you lose...",this.turn);
        sendMessage("you win!",!this.turn-0);
        return 0;
      }
      eval(`this.player${this.turn}--`);
      this.countDown();
      this.present();
      (new Audio("./mp3/clock.mp3")).play();
    },1000);
  }

  changeTurn(){
    clearTimeout(this.timerId);
    eval(`this.player${this.turn}+=${fischerTime};`);
    time.present();
    document.getElementsByClassName("player")[this.turn].classList.remove("turn");
    this.turn=!this.turn-0;
    document.getElementsByClassName("player")[this.turn].classList.add("turn");
    this.countDown();
  }

  stop(){
    clearTimeout(this.timerId);
  }
}

let audios={};
function playAudio(path){
  if(!(path in audios)){
    audios[path]=new Audio(path);
  }
  audios[path].play();
}

function init(){
  size=9;
  initialTime=60;
  fischerTime=20;
  latestPoint=null;
  whitePoints=[];
  endFlg=false;
  pausedFlg=false;
  callFlg=false;
  time=new Time(initialTime);
  time.present();
  time.countDown();
}init();


function addToWhitePoints(selectedPoint){
  selectedPoint.toWhite();
  whitePoints.push(selectedPoint);
  if(whitePoints.length==4){
    if(Point.areCocircle(whitePoints)){
      playAudio("./mp3/correct.mp3");
      time.stop();
      endFlg=true;
      alert("kyouen!");
      sendMessage("you win!",time.turn);
      sendMessage("you lose...",!time.turn-0);
    }else{
      (new Audio("./mp3/blip.mp3")).play();
      sendMessage("not kyouen...",time.turn);
      Point.callCancel();
    }
  }else{
    playAudio("./mp3/button.mp3");
  }
}

function putStone(selectedPoint){
  if(selectedPoint.color!="null"){
    return 0;
  }else{
    playAudio("./mp3/stone.mp3");
    if(latestPoint!=null)latestPoint.toBlack();
    selectedPoint.toWhite();
    latestPoint=selectedPoint;
    let messages=document.getElementsByClassName("message");
    messages[0].innerHTML="";
    messages[1].innerHTML="";
    time.changeTurn();
  }
}

function selectPoint(i,j){
  if(pausedFlg){return 0;}
  let selectedPoint=new Point(i,j);
  if(callFlg){
    if(selectedPoint.color!="black"){
      return 0;
    }else{
      addToWhitePoints(selectedPoint);
    }
  }else{
    putStone(selectedPoint);
  }
}

function reset(){
  playAudio("./mp3/button.mp3");
  let res=confirm("do you want to reset?");
  if(res){
    if(pausedFlg) pause();
    time.stop();
    Point.callCancel();
    sendMessage("",0);
    sendMessage("",1);
    document.getElementsByClassName("player")[time.turn].classList.remove("turn");
    for(let i=0;i<9;i++){
      for(let j=0;j<9;j++){
        let point=new Point(i,j);
        let tar=point.divElement;
        tar.classList.remove("white");
        tar.classList.remove("black");
      }
    }
    init();
  }
}

function pause(){
  if(!endFlg){
    playAudio("./mp3/button.mp3");
    let pauseButton=document.getElementById("rabelForPauseButton");
    let cells=document.getElementsByClassName("cell");
    if(pausedFlg){
      time.countDown();
      pauseButton.innerHTML="pause";
      for(let i=0;i<size*size;i++){cells[i].setAttribute("style","");}
    }else{
      time.stop();
      pauseButton.innerHTML="restart";
      for(let i=0;i<size*size;i++){cells[i].setAttribute("style","display:none");}
    }
    pausedFlg=!pausedFlg;
  }
}

function callKyouen(player){
  if(player!=time.turn){
    playAudio("./mp3/blip.mp3");
    sendMessage("not your turn",player)
    return 0;
  }else{
    playAudio("./mp3/button.mp3");
    let callButton=document.getElementsByClassName("rabelForCallButton")[time.turn];
    if(!callFlg){
      whitePoints=(latestPoint!=null)?[latestPoint]:[];
      callFlg=true;
      callButton.innerHTML="cancel";
    }else{
      callFlg=false;
      Point.callCancel();
    }
  }
}

function sendMessage(msg,player){
  let message=document.getElementsByClassName("message")[player];
  message.innerHTML=msg;
}
