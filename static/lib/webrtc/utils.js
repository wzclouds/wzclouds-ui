var menuConst = {
	home: [
		{name:'大厅在线用户',id: 'onlineClients', icon: 'ios-pulse', iconOutline: 'ios-pulse-outline', link:'1', node: 1, subMenu:[]},
        {name:'房间列表',id: 'serverMeetingStatistics', icon: 'ios-home', iconOutline: 'ios-home-outline', link:'3', node: 2, subMenu:[]},
		{name:'房间用户列表',id: 'meetingClients', icon: 'ios-contacts', iconOutline: 'ios-contacts-outline', link:'2', node: 3, subMenu:[]},
		{name:'创建临时房间',id: 'createMeeting', icon: 'ios-add-circle', iconOutline: 'ios-add-circle-outline',  link:'5', node: -1, subMenu:null},
		{name:'返回大厅',id: 'returnHall', icon: 'ios-undo', iconOutline: 'ios-undo-outline', link:'4', node: -1, subMenu:null}
    ],
	biz: [
		{name:'进入视频会议',id: 'meetingVideo', icon: 'ios-chatboxes', iconOutline: 'ios-chatboxes-outline', link:'/meetingvideo', node: -1, subMenu:null},
		{name:'进入画板',id: 'whiteboard', icon: 'ios-clipboard', iconOutline: 'ios-clipboard-outline', link:'/whiteboard', node: -1, subMenu:null}
	],
	manager: [
		{name:'会议管理',id: 'meetingManage', icon: 'ios-easel', iconOutline: 'ios-easel-outline', link:'/meetinglist', node: -1, subMenu:null}
	]
}
var modalType = {
	edit: 'edit',
	create: 'create'
}

function isThisMeetingManager(userId) {
    var tag = false
    if (menuConst.home[1].subMenu.length === 0) {
        return false;
    }
    menuConst.home[1].subMenu.forEach(obj => {
        // 设置房主
        if (obj.meeting.meetingId == base_vm.eleData.meetingId) {
            if (obj.meeting.owner == userId) {
                tag = true;
            }
        }
    })
    return tag;
}

// 设置菜单
function setMenuMap (url) {
	if (menuConst[url]) {
    	setMenu(menuConst[url])
	}
}

function getActionName(url) {
    if (url === 'home') {
        return url;
    }
    var managers = ['meetinglist']
    if (managers.indexOf(url) > -1) {
        return 'manager';
    }

    
    var biz = ['whiteboard', 'meetingvideo']
    if (biz.indexOf(url) > -1) {
        return 'biz';
    }
}

// 深拷贝
function deepCopyObject(source){
    var result = {};            
    for(var key in source) {                
        if(typeof source[key] === 'object') {
            result[key] = deepCopy(source[key]) //如果属性值为对象，递归
        } else {
            result[key] = source[key]
        }
    }            
    return result;
}
function deepCopy(input){
    var output;
    if(Object.prototype.toString.call(input)==='[object Array]'){
       output = input.slice(0);
    } 
    if(Object.prototype.toString.call(input)==='[object Object]'){
       output = {};
       for(let key in input) {   
            output[key] = input[key]
       } 
    } 
    for(let key in output){
        if(typeof output[key]==='object'){
            output[key]=deep(output[key]);
        }
    }
    return output;
}