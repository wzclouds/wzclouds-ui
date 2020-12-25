function sybtn(e){
	var str = $(e).attr('src')
	var id = $(e).attr('data-id')
	var im = $(e).attr('class');
	if(im == 'el-icon-bells'){
	    $('#'+id).find('video')[0].muted = true;
	    $(e).attr('class','el-icon-close-notifications')
	}else{
        $('#'+id).find('video')[0].muted = false;
	    $(e).attr('class','el-icon-bells')
	}
}
function moveVideoleft(e){
	var tyId = $(e).attr('id')
	var localVideo = $(e).find('video');
    var midVideoc = $('.videoContainer');
    midVideoc.attr('id','tyId'+tyId)
    midVideoc.html('');
	var copyNode = localVideo[0].cloneNode();
	copyNode.srcObject = localVideo[0].srcObject;
    midVideoc[0].appendChild(copyNode)
}

function ec(){
	var wh = $(window).width()
	var index = 6;
	if(wh < 1445){
		index = 4
	}
	var swiper = new Swiper('.swiper-container', {
	  slidesPerView: index,
	  spaceBetween: 20
	});
}

function fit(){
  var w = $('body').width();
  var h = $('body').height();
  var hd = $('.whead').height();
  var vd = $('.mainvideo').height(h - hd - 40);
  $('.mainng').width(w - $('.mainr').width() - $('.personlist').width() - 70).height(vd.height() - 210);
  $('.mainr').height(vd.height() - 210);
  $('.personlist').height(vd.height() - 230);
}
fit();
ec();
$(window).resize(function(){
    fit();
	ec();
})
