function addClickEvent(querySelector,callback){
  let htmlElement=document.querySelector(querySelector);
  let callback2=eval("()=>"+callback);
  htmlElement.addEventListener("touchstart",()=>{
    event.preventDafault();
    callback2;
  });
  htmlElement.addEventListener("click",callback2);
}

addClickEvent("#resetButton","reset();");
addClickEvent("#pauseButton","pause();");
for(let i=1;i<9;i++) for(let j=1;j<9;j++){
  addClickEvent(`#cell${i}${j}`,`selectPoint(${i}${j});`);
}
