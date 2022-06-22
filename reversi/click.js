class Board{
  constructor(){
    this.boardData=(new Array(100)).fill(0);
    this.boardData[44]=2;this.boardData[45]=1;this.boardData[54]=1;this.boardData[55]=2;
    this.present();
  }

  divElement(stoneId){
    return document.getElementById(`cell${stoneId}`);
  }

  toBlack(stoneId){
    let tar=this.divElement(stoneId);
    let span="<span class=\"blackStone\"></span>";
    if(tar.innerHTML!=span)tar.innerHTML=span;
  }

  toWhite(stoneId){
    let tar=this.divElement(stoneId);
    let span="<span class=\"whiteStone\"></span>";
    if(tar.innerHTML!=span)tar.innerHTML=span;
  }

  remove(stoneId){
    let tar=this.divElement(stoneId);
    let span="";
    if(tar.innerHTML!=span)tar.innerHTML=span;
  }

  present(){
    for(let i=1;i<9;i++){
      for(let j=1;j<9;j++){
        if(this.boardData[10*i+j]==1)this.toBlack(10*i+j);
        else if(this.boardData[10*i+j]==2)this.toWhite(10*i+j);
        else this.remove(10*i+j);
      }
    }
  }

  putStone(stoneId,color){
    this.boardData[stoneId]=color;
    let areThereTurnedStones=false;
    ([-11,-10,-9,-1,1,9,10,11]).forEach(direction=>{
      let now=stoneId+direction;
      for(;this.boardData[now]==(color==1?2:1);now+=direction){}
      if(this.boardData[now]==color&&now!=stoneId+direction){
        now=stoneId+direction;
        for(;this.boardData[now]==(color==1?2:1);now+=direction){
          this.boardData[now]=color;
        }
        areThereTurnedStones=true;
      }
    });
    if(!areThereTurnedStones){
      this.boardData[stoneId]=0;
      return false;
    }
    this.present();
    return true;
  }

  canPutStone(stoneId,color){
    if(board.boardData[stoneId]!=0)return false;
    let result=false;
    ([-11,-10,-9,-1,1,9,10,11]).forEach(direction=>{
      let now=stoneId+direction;
      for(;this.boardData[now]==(color==1?2:1);now+=direction){}
      if(this.boardData[now]==color&&now!=stoneId+direction){
        result=true;
      }
    });
    return result;
  }
}

class Time{
  constructor(initialTime){
    this.turn=(Math.random()<0.5)-0;
    this.player0=initialTime;
    this.player1=initialTime;
    this.timerId=undefined;
    this.color=1;
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
        playAudio("./mp3/bell.mp3");
        alert("flag!");
        endFlg=true;
        sendMessage("you lose...",this.turn);
        sendMessage("you win!",!this.turn-0);
        return 0;
      }
      eval(`this.player${this.turn}--`);
      this.countDown();
      this.present();
      playAudio("./mp3/clock.mp3");
    },1000);
  }

  changeTurn(){
    clearTimeout(this.timerId);
    this.present();
    sendMessage("",0);sendMessage("",1);
    document.getElementsByClassName("player")[this.turn].classList.remove("turn");
    this.turn=!this.turn-0;
    this.color=(this.color==1)?2:1;
    document.getElementsByClassName("player")[this.turn].classList.add("turn");
    if(canPass()){
      if(passFlg){
        endFlg=true;
        presentResult();
        return;
      }else{
        passFlg=true;
        this.changeTurn();
        return;
      }
    }
    if(passFlg){
      alert(`${this.color==1?"white":"black"}:pass`);
      passFlg=false;
    }
    this.countDown();
  }

  stop(){
    clearTimeout(this.timerId);
  }
}

function writeColorLabels(time){
  let colorLabels=document.querySelectorAll(".colorLabel")
  colorLabels[0].classList.remove("blackLabel","whiteLabel");
  colorLabels[1].classList.remove("blackLabel","whiteLabel");
  colorLabels[0].classList.add(time.turn+1==time.color?"blackLabel":"whiteLabel");
  colorLabels[1].classList.add(time.turn+1==time.color?"whiteLabel":"blackLabel");
  colorLabels[0].innerHTML=(time.turn+1==time.color?"black":"white");
  colorLabels[1].innerHTML=(time.turn+1==time.color?"white":"black");
}

function getUrlQueryParams(){
  let url=window.location.href;
  let param=url.split("?")[1];
  if(param===undefined)return {};
  return JSON.parse(`{"${param.replaceAll("=","\":").replaceAll("&",",\"")}}`);
}const urlQueryParams=getUrlQueryParams();

let audios={};
function playAudio(path){
  if(!audioFlg)return;
  if(path in audios){
    audios[path].play();
  }else{
    audios[path]=new Audio(path);
  }
}

function init(){
  initialTime=urlQueryParams.initialTime??600;
  latestPoint=null;
  board=new Board;
  board.present();
  endFlg=false;
  pausedFlg=false;
  passFlg=false;
  audioFlg=urlQueryParams.audioFlg??false;
  time=new Time(initialTime);
  writeColorLabels(time);
  time.present();
  time.countDown();
}init();

function selectPoint(i){
  playAudio("./mp3/stone.mp3");
  if(pausedFlg){return 0;}
  if(board.boardData[i]==0){
    if(board.putStone(i,time.color))
      time.changeTurn();
  }
}

function reset(){
  playAudio("./mp3/button.mp3");
  let res=confirm("do you want to reset?");
  if(res){
    if(pausedFlg) pause();
    time.stop();
    sendMessage("",0);
    sendMessage("",1);
    document.getElementsByClassName("player")[time.turn].classList.remove("turn");
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
      for(let i=0;i<8*8;i++){cells[i].setAttribute("style","");}
    }else{
      time.stop();
      pauseButton.innerHTML="restart";
      for(let i=0;i<8*8;i++){cells[i].setAttribute("style","display:none");}
    }
    pausedFlg=!pausedFlg;
  }
}

function canPass(){
  for(let i=1;i<9;i++) for(let j=1;j<9;j++){
    if(board.canPutStone(10*i+j,time.color)){
      return false;
    }
  }
  return true;
}

function presentResult(){
  let blackScore=0,whiteScore=0;
  for(let i=0;i<100;i++){
    if(board.boardData[i]==1)blackScore++;
    else if(board.boardData[i]==2)whiteScore++;
  }
  let player0Score=(time.turn+1==time.color)?blackScore:whiteScore,
  player1Score=(time.turn+1==time.color)?whiteScore:blackScore;
  document.querySelectorAll(".timer")[0].innerHTML=player0Score;
  document.querySelectorAll(".timer")[1].innerHTML=player1Score;
  if(blackScore==whiteScore){alert(`draw\n\nblack:${blackScore}\nwhite:${whiteScore}`);}
  if(blackScore>whiteScore){alert(`black win!\n\nblack:${blackScore}\nwhite:${whiteScore}`);}
  if(blackScore<whiteScore){alert(`white win!\n\nblack:${blackScore}\nwhite:${whiteScore}`);}
}

function sendMessage(msg,player){
  let message=document.getElementsByClassName("message")[player];
  message.innerHTML=msg;
}
