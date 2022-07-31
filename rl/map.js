_=a=>console.log(a);
int=a=>Math.floor(a);
rand=()=>Math.random();
randInt=(a,b)=>a>b?console.error(`error00 input:${a},${b}`):int(rand()*(b-a+1))+a;
randDir=()=>["up","down","left","right"][randInt(0,3)];
matrix=(height,width,value)=>JSON.parse(JSON.stringify((new Array(height)).fill((new Array(width)).fill(value))));
ordinal=num=>{switch(num%100){case 11:case 12:case 13:return num+"th";default:switch(num%10){case 1:return num+"st";case 2:return num+"nd";case 3:return num+"rd";default:return num+"th";}}};

class Map{

  constructor(height,width,numOfRooms,numOfRoads){
    this.height=height;
    this.width=width;
    this.numOfRooms=numOfRooms;
    this.numOfRoads=numOfRoads;
    this.base=matrix(this.height,this.width," ");
    this.unit=matrix(this.height,this.width," ");
    this.display=matrix(this.height,this.width,false);
    this.data={"roots":[],"stairs":{},"spawn":{},"Items":[]};
  }

  static numOfRooms=10;
  static numOfRoads=13;
  static minSizes={area:{x:10,y:10,S:200},room:{x:7,y:7,S:100,s:0.4}};

  get toStr(){
    let res="";
    for(let i=0;i<this.height;i++){
      for(let j=0;j<this.width;j++){
        res+=(this.display[i][j]==false?" ":this.unit[i][j]==" "?this.base[i][j]:this.unit[i][j]);
      }
      res+="\n";
    }
    return res;
  }

  open(x,y,dx,dy){
    for(let i=0;i<dx;i++) for(let j=0;j<dy;j++)
      this.display[x+i][y+j]=true;
    GLOBAL.present();
  }

  close(x,y,dx,dy){
    for(let i=0;i<dx;i++) for(let j=0;j<dy;j++)
      this.display[x+i][y+j]=false;
    GLOBAL.present();
  }

  enterRoom(roomIndex){
    let room=this.data.roots[roomIndex].room;
    this.open(room.x-1,room.y-1,room.dx+2,room.dy+2);
    room.seen=true;
  }

  exitRoom(roomIndex){
    let room=this.data.roots[roomIndex].room;
    this.close(room.x,room.y,room.dx,room.dy);
  }

  reset(){
    this.base=matrix(this.height,this.width," ");
    this.unit=matrix(this.height,this.width," ");
    this.display=matrix(this.height,this.width,false);
    this.data={"roots":[],"stairs":{},"spawn":{},"Items":[]};
    GLOBAL.present();
  }

  randSpace(){
    let room=this.data.roots[randInt(0,this.numOfRooms-1)].room;
    let x=randInt(room.x,room.x+room.dx-1);
    let y=randInt(room.y,room.y+room.dy-1);
    return {x,y};
  }

  create(){
    this.data.roots.push({"area":new Area(0,0,this.height-1,this.width-1),"room":undefined,"roads":[]});

    Area.split(this.data.roots,this.numOfRooms);
    Room.create(this.data.roots,this.numOfRooms);
    for(let roomId=1;roomId<this.numOfRooms;roomId++){
      Road.create(this.data.roots,roomId);
    }
    for(let i=this.numOfRooms-1;i<this.numOfRoads;i++){
      Road.create(this.data.roots,randInt(1,this.numOfRooms-1));
    }

    this.data.spawn=this.randSpace();
    this.data.stairs=this.randSpace();

    Room.write(this.base,this.data.roots,this.numOfRooms);
    Road.write(this.base,this.data.roots,this.numOfRooms);
    this.unit[this.data.spawn.x][this.data.spawn.y]="@";
    this.base[this.data.stairs.x][this.data.stairs.y]="%";
    GLOBAL.player.x=GLOBAL.map.data.spawn.x;
    GLOBAL.player.y=GLOBAL.map.data.spawn.y;
    Enemy.addEnemies();

    this.enterRoom(Area.containArea(this.data.spawn.x,this.data.spawn.y,this.data.roots));
  }

}


class Area{

  constructor(x,y,dx,dy){
    this.x=x;
    this.y=y;
    this.dx=dx;
    this.dy=dy;
  }

  get sum(){
    return this.dx*this.dy;
  }

  contain(x,y){
    if(x>=this.x&&x<=this.x+this.dx){
      if(y>=this.y&&y<=this.y+this.dy){
        return true;
      }
    }
    return false;
  }

  
  static containArea(x,y,rootList){
    for(let i=0;i<rootList.length;i++){
      if(rootList[i].area.contain(x,y)){
        return i;
      }
    }
    return null;
  }

  static split(roots,numOfRooms){
    for(let i=1;i<numOfRooms;i++){
  
      let maxIndex=0
      for(let roomIndex=0;roomIndex<i;roomIndex++){
        if(roots[maxIndex].area.sum<roots[roomIndex].area.sum){
          maxIndex=roomIndex;
          }
      }
  
      let obj=roots[maxIndex].area
      if((obj.dx>2*Map.minSizes.area.x||obj.dy>2*Map.minSizes.area.y)&&
          obj.sum>=2*Map.minSizes.area.S+Math.min(obj.dx,obj.dy)){
  
        if(obj.dx>obj.dy){
  
          let minX=Math.max(Map.minSizes.area.x,Math.ceil(Map.minSizes.area.S/obj.dy));
          let x=obj.x+int(rand()*(obj.dx-2*minX))+minX+1;
          let y=obj.y;
          let dx=obj.dx-(x-obj.x);
          let dy=obj.dy;
  
          roots.push({"area":new Area(x,y,dx,dy),"room":undefined,"roads":[]});
          roots[maxIndex].area.dx=obj.dx-dx-1;
  
        }else{
  
          let minY=Math.max(Map.minSizes.area.y,Math.ceil(Map.minSizes.area.S/obj.dx));
          let x=obj.x;
          let y=obj.y+int(rand()*(obj.dy-2*minY))+minY+1;
          let dx=obj.dx;
          let dy=obj.dy-(y-obj.y);
  
          roots.push({"area":new Area(x,y,dx,dy),"room":undefined,"roads":[]});
          roots[maxIndex].area.dy=obj.dy-dy-1;
  
        }
  
      }else{console.error("error10");}
  
    }
  }

}


class Room{

  constructor(x,y,dx,dy){
    this.x=x;
    this.y=y;
    this.dx=dx;
    this.dy=dy;
    this.seen=false;
  }

  get sum(){
    return this.dx*this.dy;
  }


  static create(roots,numOfRooms){
    for(let i=0;i<numOfRooms;i++){
      //TODO:debug
  
      let minS=Math.max(Map.minSizes.room.S,roots[i].area.sum*Map.minSizes.room.s);
  
      let minDx=Math.max(Map.minSizes.room.x,Math.ceil(minS/(roots[i].area.dy-4)));
      let areaDx=roots[i].area.dx;
      let dx=minDx<areaDx-4?randInt(minDx,areaDx-4):areaDx-4;

      let minDy=Math.max(Map.minSizes.room.y,Math.ceil(minS/(dx-4)));
      let areaDy=roots[i].area.dy;
      let dy=minDy<areaDy-4?randInt(minDy,areaDy-4):areaDy-4;
  
      let x=randInt(2,roots[i].area.dx-dx)+roots[i].area.x;
      let y=randInt(2,roots[i].area.dy-dy)+roots[i].area.y;
  
      roots[i].room=new Room(x,y,dx,dy);
  
    }
  }

  static write(cells,roots,numOfRooms){
    for(let i=0;i<numOfRooms;i++){
      for(let x=roots[i].room.x;x<roots[i].room.x+roots[i].room.dx;x++){
        cells[x][roots[i].room.y-1]="|";
        cells[x][roots[i].room.y+roots[i].room.dy]="|";
      }
      for(let y=roots[i].room.y-1;y<roots[i].room.y+roots[i].room.dy+1;y++){
        cells[roots[i].room.x-1][y]="-";
        cells[roots[i].room.x+roots[i].room.dx][y]="-";
      }
      for(let x=roots[i].room.x;x<roots[i].room.x+roots[i].room.dx;x++){
        for(let y=roots[i].room.y;y<roots[i].room.y+roots[i].room.dy;y++){
          cells[x][y]=".";
        }
      }
    }
  }

}


class Road{

  constructor(id,direction,xStart,yStart,separator,xEnd,yEnd){
    this.id=id;
    this.dir=direction;
    this.xStart=xStart;
    this.yStart=yStart;
    this.separator=separator;
    this.xEnd=xEnd;
    this.yEnd=yEnd;
  }


  static create(roots,roomIndex){
    let dir;
    if(roots[roomIndex].area.x==0){dir="left";}
    if(roots[roomIndex].area.y==0){dir="up";}
    if(dir===undefined){dir=["up","left"][randInt(0,1)];}

    if(dir=="left"){

      let xStart=randInt(roots[roomIndex].room.x,roots[roomIndex].room.x+roots[roomIndex].room.dx-1);
      let partner=Area.containArea(xStart,roots[roomIndex].area.y-2,roots);
      let xEnd=randInt(roots[partner].room.x,roots[partner].room.x+roots[partner].room.dx-1);
  
      let yStart=roots[roomIndex].room.y-1;
      let separator=roots[roomIndex].area.y;
      let yEnd=roots[partner].room.y+roots[partner].room.dy;

      roots[roomIndex].roads.push(new Road(roomIndex-1,"left",xStart,yStart,separator,xEnd,yEnd));

    }


    if(dir=="up"){

      let yStart=randInt(roots[roomIndex].room.y,roots[roomIndex].room.y+roots[roomIndex].room.dy-1);
      let partner=Area.containArea(roots[roomIndex].area.x-2,yStart,roots);
      let yEnd=randInt(roots[partner].room.y,roots[partner].room.y+roots[partner].room.dy-1);
  
      let xStart=roots[roomIndex].room.x-1;
      let separator=roots[roomIndex].area.x;
      let xEnd=roots[partner].room.x+roots[partner].room.dx;

      roots[roomIndex].roads.push(new Road(roomIndex-1,"up",xStart,yStart,separator,xEnd,yEnd));

    }
  
  }

  static write(cells,roots,numOfRooms){

    for(let i=0;i<numOfRooms;i++){
      for(let j=0;j<roots[i].roads.length;j++){

        let road=roots[i].roads[j];
        
        if(road.dir=="left"){
          for(let y=road.yStart;y>road.yEnd;y--){
            cells[y>road.separator?road.xStart:road.xEnd][y]="#"
          }
          for(let x=Math.min(road.xStart,road.xEnd);x<=Math.max(road.xStart,road.xEnd);x++){
            cells[x][road.separator]="#"
          }
        }

        if(road.dir=="up"){
          for(let x=road.xStart;x>road.xEnd;x--){
            cells[x][x>road.separator?road.yStart:road.yEnd]="#"
          }
          for(let y=Math.min(road.yStart,road.yEnd);y<=Math.max(road.yStart,road.yEnd);y++){
            cells[road.separator][y]="#"
          }
        }

        cells[road.xStart][road.yStart]="+";
        cells[road.xEnd][road.yEnd]="+";

      }
    }

  }

}
