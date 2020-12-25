var whiteBoard;


function setD3Utils (whiteBoard) {
  this.whiteBoard = whiteBoard
}

// 工具操作栏
function doPointer(mvm, selectGround) {
  if (!whiteBoard) {
    return;
  }
  document.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
  document.onmousedown = function (e) {
    if (!selectGround) {
      document.onmousedown = null;
    }
    let left = selectGround.offsetLeft,
    top = selectGround.offsetTop
    oldSize = [selectGround.offsetWidth, selectGround.offsetHeight];
    selectGround.attributes[2].nodeValue = mvm.id;
    whiteBoard.isEdit = true;
    whiteBoard.isDraw = true;
    if (e.srcElement.nodeName === "SPAN" && e.srcElement.attributes[1].name === 'resize-mode') {
      let x = 0, y = 0;
      setGroundScale(mvm.id, selectGround, e, left, top);
      // let wid = selectGround.offsetWidth, hei = selectGround.offsetHeight;
      // document.onmousemove = function(e) {
      //   x = e.clientX - left;
      //   y = e.clientY - top;
      //   console.log( x, y);
      //   if (x > 0) {
      //     selectGround.style.width = `${x}px`;
      //   } else {
      //     selectGround.style.width = `${wid + Math.abs(x)}px`;
      //     selectGround.style.left = `${left - Math.abs(x)}px`;
      //   }
      //   if (y > 0) {
      //     selectGround.style.height = `${y}px`;
      //   } else {
      //     selectGround.style.height = `${hei + Math.abs(y)}px`;
      //     selectGround.style.top = `${top - Math.abs(y)}px`;
      //   } 
      // }
      // document.onmouseup = function(e) {
      //   document.onmousemove = null;
      //   vm.isDraw = false;
      //   console.log("缩放放开了")
      //   vm.updateSharp(vm.lineList[mvm.id])
      // }
    } else {
      var translate = mvm.transform.baseVal[0] ? mvm.transform.baseVal[0].matrix : {e: 0, f: 0};
      if ((e.srcElement.nodeName !== 'path' && e.srcElement.nodeName !== 'image') || e.srcElement.parentNode.id != mvm.id) {
        whiteBoard.isEdit = false;
        whiteBoard.isDraw = false;
        selectGround.style.display = 'none';
        whiteBoard.svg.select('#' + mvm.id).select('path').attr('stroke', whiteBoard.lineList[mvm.id].color);
      } else {
        let startX = e.clientX,
        startY = e.clientY,
        tempSetX = 0,
        tempSetY = 0,
        stepX = 0,
        stepY = 0;
        let x = translate.e, y = translate.f;
        document.onmousemove = function(e) {
          stepX = e.clientX - startX;
          stepY = e.clientY - startY;
          let pos = {x: (stepX - tempSetX) , y: (stepY - tempSetY) };
          if (pos.x || pos.y) {
            if (whiteBoard.isEdit) {
              SHARP_TRANSLETE([{id: mvm.id, pos: pos}], 'move');
              whiteBoard.isChange = true;
            }
            tempSetX = stepX;
            tempSetY = stepY;
          }
        }
        document.onmouseup = function(e) {
          document.onmousemove = null;
          if (whiteBoard.isChange) {
            whiteBoard.isChange = false;
            console.log("拖动放开了")
            whiteBoard.updateSharp(whiteBoard.lineList[mvm.id])
          }
        }
      }
    }
  };
}

function doEraser(mvm, selectGround) {
  if (!whiteBoard) {
    return;
  }
  whiteBoard.isEdit = false;
  document.onmousedown = null;
  document.onmousemove = null;
  document.onmouseup = null;
  mvm.onmousedown = function (e) {
    var id = mvm.id;
    SHARP_REMOVE([id])
  };
}

function setGroundScale(id, selectGround, e, left, top) {
  if (!whiteBoard) {
    return;
  }
  var name = e.srcElement.attributes[1].nodeValue;
  var pos = [selectGround.offsetLeft, selectGround.offsetTop];
  whiteBoard.isDraw = true;
  let wid = selectGround.offsetWidth, 
      hei = selectGround.offsetHeight,
      x, y
  document.onmousemove = function(e) {
    x = e.clientX - left,
    y = e.clientY - top;
    move = {x: 0, y: 0};
    var scale = { scale: {}}
    if (name == 'rb') {
      if (x > 0) {
        scale.scale.x = x / wid
      }
      if (y > 0) {
        scale.scale.y = y / hei
      }
    } else if (name == 'lb') {
      if ((-x + wid) > 0) {
        scale.scale.x = (-x + wid) / wid
      }
      if (y > 0) {
        scale.scale.y = y / hei
      }
    } else if (name == 'lt') {
      if ((-x + wid) > 0) {
        scale.scale.x = (-x + wid) / wid
      }
      if ((-y + hei) > 0) {
        scale.scale.y = (-y + hei) / hei
      }
    } else if (name == 'rt') {
      if (x > 0) {
        scale.scale.x = x / wid
      }
      if ((-y + hei) > 0) {
        scale.scale.y = (-y + hei) / hei
      }
    } else if (name == 'll') {
      if ((-x + wid) > 0) {
        scale.scale.x = (-x + wid) / wid
      }
    } else if (name == 'rr') {
      if (x > 0) {
        scale.scale.x = x / wid
      }
    } else if (name == 'tt') {
      if ((-y + hei) > 0) {
        scale.scale.y = (-y + hei) / hei
      }
    } else if (name == 'bb') {
      if (y > 0) {
        scale.scale.y = y / hei
      }
    }
    scale.id = id;

    // if (move.x) {
    //   selectGround.style.left = move.x + 'px';
    // } 
    // if (move.y) {
    //   selectGround.style.top = move.y + 'px';
    // }

    // let scale = {
    //   scale: {
    //     x: selectGround.offsetWidth / wid, 
    //     y: selectGround.offsetHeight / hei
    //   },
    //   id: id
    // };

    if (whiteBoard.isEdit && (scale.scale.x || scale.scale.y)) {
      SHARP_TRANSLETE([scale], 'scale')
    }
    document.onmouseup = function(){
      document.onmousemove = null;
      whiteBoard.isDraw = false;
      console.log("缩放放开了")
      whiteBoard.updateSharp(whiteBoard.lineList[id])
    }
  }
}

// 以下为同步操作方法
function draw (line) {
  if (!whiteBoard) {
    return;
  }
  if (line.type === 'PATH') {
    drawLine(line);
  } else if (line.type === 'IMAGE'){
    drawImage(line);
  }
}

function drawLine(line){
  var id = line.id;
  var lineStruct = d3.line().curve(d3.curveBasis);
  lineStruct = lineStruct.x(function(d) { return d[0]})
             .y(function(d) { return d[1]})
  if (!whiteBoard.lineList[id]) {
    whiteBoard.lineList[id] = { path: []}
    Object.keys(line).forEach(function(key) {
      if (key !== 'path') {
        whiteBoard.lineList[id][key] = line[key]
      }
    })
  }
  if (!line.createTime) {
    whiteBoard.lineList[id].path.push(line.path);
  }
  whiteBoard.lineList[id].matrix = line.matrix;
  var select = whiteBoard.canvasMain.select('#' + id).selectAll('path');
  var d = lineStruct(whiteBoard.lineList[id].path);

  let centPoint = whiteBoard.lineList[id].centPoint;
  let left = whiteBoard.lineList[id].matrix[4];
  let top = whiteBoard.lineList[id].matrix[5];
  let scaleX = whiteBoard.lineList[id].matrix[0];
  let scaleY = whiteBoard.lineList[id].matrix[3];
  if (whiteBoard.isEmpty(select._groups[0])) {
    var g = whiteBoard.canvasMain
      .append('g')
      .attr('id', id)
      .attr('class', 'g_ground');
    if (centPoint) {
      g.attr('transform', `translate(${left}, ${top}) translate( ${centPoint[0]}, ${centPoint[1]}) scale(${scaleX},${scaleY} ) translate(-${centPoint[0]}, -${centPoint[1]} )`);
    }  
    g.append('path')
      .attr('d', d)
      .attr("stroke", whiteBoard.lineList[id].color)
      .attr('stroke-linecap', 'round')
      .attr("stroke-width", whiteBoard.lineList[id].thinkness)
      .attr("fill","none")      
  } else {
    select.attr('d', d);
  }
}

function drawImage(line) {
  var id = line.id;
  var select = whiteBoard.canvasMain.select('#' + id).selectAll('image');
  if (!whiteBoard.lineList[id]) {
    whiteBoard.lineList[id] = {}
    Object.keys(line).forEach(function(key) {
      whiteBoard.lineList[id][key] = line[key] 
    })
  }
  let centPoint = whiteBoard.lineList[id].centPoint;
  let left = whiteBoard.lineList[id].matrix[4];
  let top = whiteBoard.lineList[id].matrix[5];
  let scaleX = whiteBoard.lineList[id].matrix[0];
  let scaleY = whiteBoard.lineList[id].matrix[3];
  if (whiteBoard.isEmpty(select._groups[0])) {
    var g = whiteBoard.canvasMain
      .append('g')
      .attr('id', id)
      .attr('class', 'g_ground');
    if (centPoint) {
      g.attr('transform', `translate(${left}, ${top}) translate( ${centPoint[0]}, ${centPoint[1]}) scale(${scaleX},${scaleY} ) translate(-${centPoint[0]}, -${centPoint[1]} )`);
    }  
    var image = g.append('image')
      .attr('xlink:href', line.url)
      // .attr('width', line.width * (vm.windowSize.x / line.windowX))
      // .attr('height', line.height * (vm.windowSize.y / line.windowY))
      .attr('x', 0)
      .attr('y', 0);
  }
}

function removeItem(data){
    var ids = data.ids;
    for (var i = ids.length - 1; i >= 0; i--) {
      let id = ids[i];
      delete whiteBoard.lineList[id];
      whiteBoard.svg.select('#' + id).remove();
      $("#selectGround")[0].style.display = 'none';
    }
}

function moveItem(datas){
  datas.forEach(function(data) {
    // console.log(vm.lineList[data.id])
      whiteBoard.lineList[data.id].matrix[4] += data.pos.x;
      whiteBoard.lineList[data.id].matrix[5] += data.pos.y;
      translate(data.id);
  })
}

function scaleItem(datas){
  datas.forEach(function(data) {
      whiteBoard.lineList[data.id].matrix[0] = data.scale.x || whiteBoard.lineList[data.id].matrix[0];
      whiteBoard.lineList[data.id].matrix[3] = data.scale.y || whiteBoard.lineList[data.id].matrix[3];
      translate(data.id);
  })
}

function translate (id) {
  var centPoint = whiteBoard.lineList[id].centPoint || getOldParam(id);
  let left = whiteBoard.lineList[id].matrix[4];
  let top = whiteBoard.lineList[id].matrix[5];
  let scaleX = whiteBoard.lineList[id].matrix[0];
  let scaleY = whiteBoard.lineList[id].matrix[3];
  var box = document.getElementById(id).getBBox();
  if (selectGround.attributes[2].nodeValue == id) {
    selectGround.style.left = `${box.x + left}px`;
    selectGround.style.top = `${box.y + top}px`;
    selectGround.style.transform =  `scale(${scaleX}, ${scaleY})`
  }
  whiteBoard.svg.select('#' + id).attr('transform', `translate(${left}, ${top}) translate( ${centPoint[0]}, ${centPoint[1]}) scale(${scaleX},${scaleY} ) translate(-${centPoint[0]}, -${centPoint[1]} )`);
}

function getOldParam(id) {
  var box = document.getElementById(id).getBBox();
  var centPoint = {x: box.x + box.width / 2, y: box.y + box.height / 2};
  return [centPoint.x, centPoint.y];
}
// function scaleItem(data){
//   // datas.forEach(function(data) {
//       vm.svg.select('#' + data.id).attr('transform', `scale(${data.scale.x}, ${data.scale.y})`);
//   // })
// }


//即时通讯
const ChatosExamle = {
    Message: {
        add: function (message, type) {
            var chat_body = $('.layout .content .chat .chat-body');
            if (chat_body.length > 0) {

                type = type ? type : '';
                message = message ? message : 'Lorem ipsum dolor sit amet.';

                $('.layout .content .chat .chat-body .messages').append('<div class="message-item ' + type + '"><div class="message-content">' + message + '</div><div class="message-action">PM 14:25 ' + (type ? '<i class="ti-check"></i>' : '') + '</div></div>');

                chat_body.scrollTop(chat_body.get(0).scrollHeight, -1).niceScroll({
                    cursorcolor: 'rgba(66, 66, 66, 0.20)',
                    cursorwidth: "4px",
                    cursorborder: '0px'
                });
            }
        }
    }
}