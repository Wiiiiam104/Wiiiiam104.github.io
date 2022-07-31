class Unit{

  constructor(id,x,y,icon,hp,maxHp,mp,maxMp,exp,atk,def,mat,mdf){
    this.id=id;
    this.x=x;
    this.y=y;
    this.icon=icon;
    this.status={hp,maxHp,mp,maxMp,"lvl":Math.floor(exp/1000),exp,atk,def,mat,mdf};
  }

  explore(dx,dy){
    if(GLOBAL.map.unit[this.x+dx][this.y+dy]!=" "){
      if(this.icon!="@"&GLOBAL.map.unit[this.x+dx][this.y+dy]!="@")return;
      this.attack(this.x+dx,this.y+dy,this.status.atk);
      if(this.icon=="@")Enemy.thinkAll();
    }else{
      this.move(dx,dy);
    }
    GLOBAL.present();
  }

  attack(x,y,atk){
    let unit;
    for(let i=0;i<GLOBAL.units.length;i++){
      if(GLOBAL.units[i].x==x && GLOBAL.units[i].y==y){
        unit=GLOBAL.units[i];
        break;
      }
    }

    if(unit!==undefined){
      let k=(rand()<0.10)?3*(0.9+rand()*0.2):0.9+rand()*0.2;
      let damage=Math.ceil(atk*atk/unit.status.def*k);
      unit.status.hp-=damage;
      GLOBAL.messages.push(`${this.icon} -> ${unit.icon} : ${damage} Damege`)
      if(unit.status.hp<=0){
        unit.killed();
      }
    }else{
      console.error("there are no units <Unit.attack>");
    }
  }

  
  get toughness(){
    return this.status.maxHp*this.status.atk*this.status.atk*this.status.def;
  }

  killed(){
    if(this===GLOBAL.player){
      GLOBAL.messages.push(`GAME OVER`);
      GLOBAL.map.unit[this.x][this.y]=" ";
      this.x=null;
      this.y=null;
      GLOBAL.map.display=matrix(40,150,true);
      GLOBAL.present();
    }else{
      let player=GLOBAL.player;
      GLOBAL.messages.push(`"${this.icon}" Was Killed`);
      player.status.exp+=Math.ceil(-10/(this.toughness/player.toughness+0.2)+200);
      if(player.status.lvl!=Math.floor(player.status.exp/1000)){
        player.levelUp();
      }
      GLOBAL.map.unit[this.x][this.y]=" ";
      this.x=null;
      this.y=null;
    }
  }

}


class Player extends Unit{

  move(dx,dy){
    switch(GLOBAL.map.base[this.x+dx][this.y+dy]){
      case "#":
      case "+":
      case ".":
        if(GLOBAL.map.base[this.x+dx][this.y+dy]=="#"){
          GLOBAL.map.exitRoom(Area.containArea(this.x,this.y,GLOBAL.map.data.roots));
        }else{
          GLOBAL.map.enterRoom(Area.containArea(this.x+dx,this.y+dy,GLOBAL.map.data.roots));
        }
        GLOBAL.map.unit[this.x][this.y]=" ";
        this.x+=dx;
        this.y+=dy;
        GLOBAL.map.unit[this.x][this.y]="@";
        GLOBAL.map.open(this.x-1,this.y-1,3,3);
        Enemy.thinkAll();
        GLOBAL.present();
        break;
      case "%":
        GLOBAL.forSmartphone=null;
        GLOBAL.floor++;
        GLOBAL.messages.push(`Reached ${ordinal(GLOBAL.floor)} Floor`);
        for(let i=0;i<GLOBAL.map.numOfRooms;i++){
          if(!GLOBAL.map.data.roots[i].room.seen)break;
          if(i==GLOBAL.map.numOfRooms-1){
            GLOBAL.player.status.hp=GLOBAL.player.status.maxHp;
            GLOBAL.messages.push("  Complete Bonus! (Healing)");
          }
        }
        GLOBAL.map.reset();
        GLOBAL.map.create();
        this.x=GLOBAL.map.data.spawn.x;
        this.y=GLOBAL.map.data.spawn.y;
        break;
    }
  }

  levelUp(){
    let deltaLvl=Math.floor(this.status.exp/1000)-this.status.lvl;
    this.status.lvl+=deltaLvl;
    let f=a=>Math.ceil(a/(deltaLvl+1)*Math.log(2)*(0.7+0.6*rand()));
    GLOBAL.messages.push(`Level Up ( ${this.status.lvl-deltaLvl} -> ${this.status.lvl} )`);
    GLOBAL.messages.push(`  HP(max) : ${this.status.maxHp} -> ${this.status.maxHp+=f(100)}  ATK : ${this.status.atk} -> ${this.status.atk+=f(7)}  DEF : ${this.status.def} -> ${this.status.def+=f(7)}`);
  }

}


class Enemy extends Unit{

  static addEnemies(){
    GLOBAL.units=[GLOBAL.player];
    for(let i=1;i<10;i++){
      let {x,y}=GLOBAL.map.randSpace();
      let l="@ABCDEFGHIJKL";
      let hp=Math.ceil(100*(0.23*GLOBAL.floor+0.77)*(0.7+0.6*rand()));
      let atk=Math.ceil(10*(0.23*GLOBAL.floor+0.77)*(0.7+0.6*rand()));
      let def=Math.ceil(10*(0.23*GLOBAL.floor+0.77)*(0.7+0.6*rand()));
      let e=new Enemy(i,x,y,l[i],hp,hp,NaN,NaN,NaN,atk,def,NaN,NaN);
      GLOBAL.map.unit[e.x][e.y]=e.icon;
      GLOBAL.units.push(e);
    }
  }

  static thinkAll(){
    for(let i=1;i<GLOBAL.units.length;i++){
      GLOBAL.units[i].think();
    }
  }

  think(){
    let x=this.x;
    let y=this.y;
    let px=GLOBAL.player.x;
    let py=GLOBAL.player.y;
    if(Area.containArea(x,y,GLOBAL.map.data.roots)==Area.containArea(px,py,GLOBAL.map.data.roots)){
      let dx=(x==px)?0:(x<px)?1:-1;
      let dy=(y==py)?0:(y<py)?1:-1;
      if(Math.abs(dx)+Math.abs(dy)==2){
        rand()<0.5?dx=0:dy=0;
      }
      this.explore(dx,dy);
    }
  }

  move(dx,dy){
    switch(GLOBAL.map.base[this.x+dx][this.y+dy]){
      case "#":
      case "+":
      case ".":
        GLOBAL.map.unit[this.x][this.y]=" ";
        this.x+=dx;
        this.y+=dy;
        GLOBAL.map.unit[this.x][this.y]=this.icon;
        break;
    }
  }

}
