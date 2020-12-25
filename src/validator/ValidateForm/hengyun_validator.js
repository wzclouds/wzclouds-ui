import api from '@/api/axiosApi'
//////////////////////加载及显示验证信息///////////////////////////
/**
 * 主要用于阶段url:ex:当axios的url为/api/xxx/xxx...时即截断url为api/xxx;
 *                    当axios的http请求统一前缀时url形如xxx/xxxxxx..,截断即为xxx/
 * @type {string[]}
 */
var projectPrefixs = ["admin/"];
/**
 * 开启恒运校验体系
 * 校验规则向后端服务器拉取，保持与后端服务器的校验规则一致，使得修改校验的时候，仅仅需要修改一个地方即可
 * @param ajaxSetting      ajax配置文件主要包括(url,method,dataType,contentType)，一般只需配置axios的api即可，可重写参数
 * @param selectorSetting  元素配置
 * 							tipForm：表示在form中placeholder所绑定项，主要用于输入框验证信息显示
 * 							validate： data中的验证集合，对应的prop应该绑定对应属性字段，主要用于表单提交验证
 * 						  vm: 当前页面顶级元素，主要用于错误提示
 * @param cb  回调方法
 * @returns
 */

function openValidator(ajaxSetting,selectorSetting, cb){
  var ajaxSettingCopy = {};
  ajaxSettingCopy.url = builderValidatorUrl(ajaxSetting.api.url);
  ajaxSettingCopy.method = ajaxSetting.api.method
  ajaxSettingCopy.dataType = 'json'
  ajaxSettingCopy.contentType = 'application/json'

  Object.keys(ajaxSetting).forEach(function (key) {
    ajaxSettingCopy[key] = ajaxSetting[key]
  })

  Object.keys(selectorSetting.tipForm).forEach(function (key) {
    selectorSetting.tipForm[key] = ''
  })

  api(ajaxSettingCopy).then(res => {
    if (res.status === 200){
    const data = res.data
    Object.keys(data).forEach(function (index) {
      var key = data[index]['fieldName']
      if (selectorSetting.tipForm.hasOwnProperty(key)) {
        data[index].constraints.forEach((item, index) => {
          if (item.type === 'range'){
            setRangeVali(selectorSetting, key, item)
          }
          if (item.type === 'notNull'){
            setNotNullVali(selectorSetting, key, item)
          }
        })
        selectorSetting.tipForm[key]=(selectorSetting.tipForm[key].substring(selectorSetting.tipForm[key].length-1)==',')?selectorSetting.tipForm[key].substring(0,selectorSetting.tipForm[key].length-1):selectorSetting.tipForm[key];
      }
    })
    safeCb(cb)(res)
  } else {
      if (selectorSetting.vm) {
        selectorSetting.vm.$Message.info(res.data.errmsg)
      }
  }
}
)
}

/**
 * 长度校验
 * @param selectorSetting 元素配置
 * @param key 校验字段key
 * @param item 校验类项
 */
function setRangeVali(selectorSetting, key, item){
    selectorSetting.tipForm[key] += '最小长度:' + String(item.attrs.min)
      + ',最大长度:' + String(item.attrs.max) + ','
    if (!selectorSetting.validate.hasOwnProperty(key)) {
      selectorSetting.validate[key] = []
    }
    selectorSetting.validate[key].push({
      validator: (rule, value, cb) => {
      if(value && value.length > item.attrs.max){
      cb(new Error('长度不能大于' + item.attrs.max + '个字符'))
      return
    }
    cb()
  }
  })
}

/**
 * 必填校验
 * @param selectorSetting 元素配置
 * @param key 校验字段key
 */
function setNotNullVali(selectorSetting, key){
  selectorSetting.tipForm[key] += '必填' + ','
  if (!selectorSetting.validate.hasOwnProperty(key)) {
    selectorSetting.validate[key] = []
  }
  selectorSetting.validate[key].push({
    required: true,
    validator: (rule, value, cb) => {
    if(!value){
    cb(new Error('不能为空!'))
    return
  }
  cb()
}
})
}

function safeCb(cb) {
  if (typeof cb === 'function') {
    return cb;
  } else {
    return function () {};
  }
}
// function formatterSelectorSetting(selectorSetting){
//
//   var formatterSetting = {
//     attrName:"name",
//     prefix:"",
//     suffix:""
//   };
//   if(!selectorSetting){
//     return formatterSetting;
//   }
//   for(var key in formatterSetting){
//
//     if(selectorSetting[key]){
//       formatterSetting[key] = selectorSetting[key];
//     }
//   }
//   return formatterSetting;
// }
//
// function validatorLoadSuccess(rows){
//
//   if(!rows || rows.length == 0){
//     return ;
//   }
//
//
//   addValidtor(this.fromParentElem,this.selectorSetting,this.callbackValidatorRuleConfig,rows);
// }

// function addValidtor(parentEle,selectorSetting,callbackValidatorRuleConfig,constraints){
//
//   var $parentEle = $(parentEle);
//   for(var i in constraints){
//
//     var constraint = constraints[i];
//     var name = constraint.fieldName;
//     var constraintText = "";
//     for(var j in constraint.constraints){
//
//       constraintText += getDesc(constraint.constraints[j],constraint.fieldType);
//     }
//     var selector = selectorSetting.attrName+"='"+selectorSetting.prefix+name+selectorSetting.suffix+"'";
//     var customPlaceholder = $parentEle.find("["+selector+"]").attr("placeholder");
//     if(notEmpty(customPlaceholder)){
//       constraintText = customPlaceholder + "(" + constraintText+")";
//     }
//     $parentEle.find("["+selector+"]").attr("placeholder",constraintText);
//     callbackValidatorRuleConfig($parentEle.find("["+selector+"]"),constraint);
//   }
// }

// function getDesc(constraint,fieldType){
//
//   if(fieldType == "string" && constraint.type == "range"){
//     return "最大长度"+constraint.attrs.max;
//   }
//   if(fieldType == "int" && constraint.type == "range"){
//     return "最大值是：  "+constraint.attrs.max;
//   }
//   if(fieldType == "double" && constraint.type == "range"){
//     return "最大值是："+constraint.attrs.max;
//   }
//   return "";
// }

function copy(obj){

  var copyObj = {};
  for ( var key in obj) {
    copyObj[key] = obj[key];
  }
  return copyObj;
}

function builderValidatorUrl(url){

  for(var i in projectPrefixs){
    var index = url.indexOf(projectPrefixs[i]);
    if(index < 0){
      continue ;
    }
    return  url.substring(0,index + projectPrefixs[i].length) + "from/validator/" + url.substring(index + projectPrefixs[i].length);
  }
}

//////////////////////校验规则配置   有默认规则   可以被覆盖///////////////////////////
function defaultCallbackValidatorRuleConfig(jqueryElem,constraint){

  var dataTypes = "";
  for(var j in constraint.constraints){
    var dataType = null;
    switch(constraint.fieldType){
      case "string": dataType =stringValidatorRuleConfig(constraint.constraints[j]) ;break;
      case "int": dataType =numberValidatorRuleConfig(constraint.constraints[j]) ;break;
      case "double": dataType =doubleValidatorRuleConfig(constraint.constraints[j]) ;break;
      case "date": dataType = dateValidatorRuleConfig(constraint.constraints[j]) ;break;
      default : dataType = ortherValidatorRuleConfig(constraint.constraints[j]);break;
    }
    if(dataType){
      dataTypes += dataType + ",";
    }
  }

  dataTypes = removeLastChar(dataTypes,",");
  if(dataTypes.length > 0){
    var customRule = jqueryElem.attr("dataType");
    if(notEmpty(customRule)){
      dataTypes = customRule + "," + dataTypes;
    }
    jqueryElem.attr("dataType",dataTypes);
  }
}

function notEmpty(str){

  return str && str.length > 0 ;
}
function removeLastChar(str,removeChar){

  if(!str || str.length == 0 || str.charAt(str.length-1) != removeChar){
    return str;
  }
  return removeLastChar(str.substring(0,str.length-1),removeChar);
}

//字符串长度验证规则
function stringValidatorRuleConfig(constraint){

  if(constraint.type == "range"){
    return "*1-"+constraint.attrs.max;
  }

  if(constraint.type == "notNull"){
    return "*";
  }
  return null;
}
//整数校验规则
function numberValidatorRuleConfig(constraint){


  if(constraint.type == "notNull"){
    return "*,/\\d+/";
  }
  return null;
}
/**
 * 浮点数（小数）校验规则
 * @param constraint
 * @returns
 */
function doubleValidatorRuleConfig(constraint){

  if(constraint.type == "notNull"){
    return "*,/^\\d+\\.?\\d*$/";
  }
  return null;
}
//时间校验规则
function dateValidatorRuleConfig(constraint){

  if(constraint.type == "notNull"){
    return "*";
  }
  return null;
}
//除了上面以为的其他类型的校验规则
function ortherValidatorRuleConfig(constraint){

  if(constraint.type == "notNull"){
    return "*";
  }
  return null;
}

const validatorModel = (ajaxSetting,fromParentElem,selectorSetting,callbackValidatorRuleConfig) => {
  openValidator(ajaxSetting,fromParentElem,selectorSetting,callbackValidatorRuleConfig)
  window.openValidator = openValidator;
}

export default validatorModel
