// jquery datepicker 汉化
jQuery(function($){
$.datepicker.regional['zh-CN'] = {
closeText: '关闭',
prevText: '<上月',
nextText: '下月>',
currentText: '今天',
monthNames: ['一月','二月','三月','四月','五月','六月',
'七月','八月','九月','十月','十一月','十二月'],
monthNamesShort: ['一','二','三','四','五','六',
'七','八','九','十','十一','十二'],
dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
dayNamesMin: ['日','一','二','三','四','五','六'],
dateFormat: 'yy-mm-dd', firstDay: 1,
isRTL: false};
$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
});

$(document).ready(function() {
  
  // $('#search-breadcrumb').show();
  
  function startSearch() {
    
    $('#advanced-search-bar').hide();
    $('#filter-btn i').attr('class', 'glyphicon glyphicon-triangle-bottom');
    
    CM_UIUtil.hideStatPanel();
    CM_UIUtil.hideJPPanel();
    
    // 加载城市地图数据
    $('#search-breadcrumb').html('拼命获取数据中...');

    // CM_Network.cityMapDataParams.level = '1';
    CM_Network.loadCityMapData(function(res) {
      // console.log(res.data);
      if (!res.data || res.data.length === 0) {
        $('#search-breadcrumb').html('未找到数据');
        CM_Map.removeAllMarkers();
      } else {
        var desc = '';
        if ( CM_Network.cityMapDataParams.level === '1' ) {
          CM_Map.addCityListMarkers(res.data);
          desc = '城市';
        } else if ( CM_Network.cityMapDataParams.level === '2' ) {
          CM_Map.addCityDetailMarkers(res.data);
          desc = '板块';
        } else if ( CM_Network.cityMapDataParams.level === '3' ) {
          CM_Map.addPlateMarkers(res.data);
          desc = '板块';
        }
    
        $('#search-breadcrumb').html('共找到<span class="search-results-count">'+ res.data.length
         +'</span>条'+ desc +'数据');
       }
    }, function(err) {
      // alert(err);
      $('#search-breadcrumb').html('<span style="color: red;">获取数据失败</span>');
    });
  }
  
  // 创建地图
  CM_Map.init();
  
  // 获取城市
  CM_Network.sendReq('城市地图字典APP', ['1', ''], function(res) {
    // console.log(res.data);
    var cities = res.data;
    var html = '<option value="-1">全国</option>';
    for (var i = 0; i < cities.length; i++) {
      var city = cities[i];
      
      // 保存一份城市名单
      CM_Map.cityNames.push(city.name);
      
      html += '<option value="'+ city.name +'">'+ city.name +'</option>';
    }
    // console.log(html);
    $('#city').html(html);
    
    // $("#city").trigger("chosen:updated");
  }, function(err) {
    // console.log(err);
    $('#city').html('');
  });
  
  // 加载城市地图数据
  $('#search-breadcrumb').html('拼命获取数据中...');
  
  CM_Network.cityMapDataParams.level = '1';
  CM_Network.loadCityMapData(function(res) {
    // console.log(res.data);
    
    CM_Map.addCityListMarkers(res.data);
    $('#search-breadcrumb').html('共找到<span class="search-results-count">'+ res.data.length +'</span>条城市数据');
  }, function(err) {
    // alert(err);
    $('#search-breadcrumb').html('<span style="color: red;">获取城市数据失败</span>');
  });
  
  ////////////////////////////// 加载高级搜索里面的基础数据开始 /////////////////////////////////
  // 加载时间条件
  $('#filter-time-items').html('加载数据中...');
  CM_Network.sendReq('公共字典APP', ['城市地图前端日期段'], function(res) {
    html = ''
    var items = res.data;
    if (!items || items.length === 0) {
      $('#filter-time-items').html('暂无数据');
      return;
    }
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += '<label class="radio-inline"><input type="radio" name="date_item" data-name="'+ item.dic_name +'"  id="date_item" value="'+ item.dic_value +'" '+ (item.dic_value.toString() === CM_Network.cityMapDataParams.dateType ? 'checked' : '') +'>'+ item.dic_name +'</label>';
    }
    $('#filter-time-items').html(html);
  }, function(err) {
    // console.log(err);
    $('#filter-time-items').html('<span class="search-results-count">获取数据失败</span>');
  });
  
  function selectTimeItem(el) {
    var $this = $(el);
    // console.log($this.data('value'));
  }
  
  // 加载面积，单价，总价
  $('#other-filter-item').change(function() {
    // console.log($(this).val());
    loadOtherFilterItems($(this).val());
    
    $('.custom-item input[type=checkbox]').prop('checked', false);
    $('#other-filter-start').val('');
    $('#other-filter-end').val('');
    
    // 更新自定义字段后面的单位显示
    var text = $('#other-filter-item option:selected').text();
    if (text === '面积') {
      $('#item-unit').text('㎡');
    } else if (text === '单价') {
      $('#item-unit').text('元');
    } else if (text === '总价') {
      $('#item-unit').text('万元');
    } else {
      $('#item-unit').text('');
    }
  });
  function loadOtherFilterItems(val) {
    $('#other-filter-items').html('加载数据中...');
    // console.log(val);
    $('#other-filter-item').prop('disabled', true);
    CM_Network.sendReq('公共字典APP', [val], function(res) {
      // console.log(res);
      html = ''
      var items = res.data;
      if (!items || items.length === 0) {
        $('#other-filter-items').html('暂无数据');
        return;
      }
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        
        html += '<label class="checkbox-inline"><input type="checkbox" value="'+ item.dic_value +'">'+ item.dic_name +'</label>';
      }
      $('#other-filter-items').html(html);
      
      $('#other-filter-item').prop('disabled', false);
      
    }, function(err) {
      // console.log(err);
      $('#other-filter-items').html('<span class="search-results-count">获取数据失败</span>');
      
      $('#other-filter-item').prop('disabled', false);
    });
  }
  
  loadOtherFilterItems('城市地图前端面积段');
  
  ////////////////////////////// 加载高级搜索里面的基础数据结束 /////////////////////////////////
  
  // 打开高级搜索
  $('#filter-btn').click(function() {
    // console.log(213);
    if ($('#advanced-search-bar').is(":visible")) {
      $('#advanced-search-bar').hide();
      $('#filter-btn i').attr('class', 'glyphicon glyphicon-triangle-bottom');
    } else {
      $('#advanced-search-bar').show();
      $('#filter-btn i').attr('class','glyphicon glyphicon-triangle-top');
    }
  });
  
  // 关闭高级搜索
  $('#cancel-search').click(function() {
    $('#advanced-search-bar').hide();
    $('#filter-btn i').attr('class', 'glyphicon glyphicon-triangle-bottom');
  });
  
  // 清除搜索
  $('#clear-search').click(function() {
    // console.log('d-');
    CM_Network.cityMapDataParams.dateType = '0';
    CM_Network.cityMapDataParams.bDate = '';
    CM_Network.cityMapDataParams.eDate = '';
    
    CM_Network.cityMapDataParams.paramType = '-1';
    CM_Network.cityMapDataParams.paramValues = '';
    
    CM_Network.cityMapDataParams.plateName = '';
    
    $('#plate-keyword').val('');    
    
    $('#date-start').val('');
    $('#date-end').val('');
    
    $('#other-filter-start').val('');
    $('#other-filter-end').val('');
    
    // $('input:radio:checked').prop('checked', false);
    // 重置搜索条件显示
    $('#search-conditions #time-value').html('本月');
    var firstEl = $('.filter-items input[type="radio"]')[0];
    $(firstEl).prop('checked', true);
    
    $('#search-conditions #other-conditions').html('');
    
    $('.filter-items input[type="checkbox"]').each(function() {
      $(this).prop('checked', false);
    });
    
    $('#filter-btn i').attr('class', 'glyphicon glyphicon-triangle-bottom');
    
    // 开始搜索
    startSearch();
  });
  
  // 开始高级查询
  $('#ok-search').click(function() {
    var value = $('input:radio:checked').val();
    // console.log(value);
    if (value) {
      var dateType = value.toString();
      CM_Network.cityMapDataParams.dateType = dateType
      if (dateType === '-1') { // 自定义日期
        CM_Network.cityMapDataParams.bDate = $('#date-start').val();//'2017-01-09';
        CM_Network.cityMapDataParams.eDate = $('#date-end').val();//'2017-08-10';
        
        var startDate = new Date($('#date-start').val());
        var endDate   = new Date($('#date-end').val());
        
        if (startDate > endDate) {
          alert('开始日期不能大于结束日期');
          return;
        };
        
        $('#search-conditions #time-value').html($('#date-start').val() + ' - ' + $('#date-end').val());
        
      } else {
        CM_Network.cityMapDataParams.bDate = '';
        CM_Network.cityMapDataParams.eDate = '';
        
        $('#search-conditions #time-value').html($('input:radio:checked').data('name'));
      }
    }
    
    // 准备其他指标数据
    var paramValues = [];
    $("#advanced-search-bar input[type=checkbox]:checked").each(function() {
      // console.log( $(this).val() );
      var value = $(this).val();
      if (value === '-1') {
        // 自定义
        var start = $('#other-filter-start').val();
        var end   = $('#other-filter-end').val();
        
        // console.log(start);
        // console.log(end);
        
        start = parseInt(start);
        end   = parseInt(end);
        
        if (start < 0) {
          alert('值不能为负数');
          return;
        }
        
        if (end < start) {
          alert('第一个值不能大于第二个值');
          return;
        }
        
        paramValues.push(start.toString() + '-' + end.toString());
        
        // paramValues.push(value);
      } else {
        // 其他
        paramValues.push(value);
      }
    });
    
    if (paramValues.length > 0) {
      var text = $('#other-filter-item option:selected').text();
      // console.log(text);
      var unit = '';
      if (text === '面积') {
        CM_Network.cityMapDataParams.paramType = '1';
        unit = '㎡';
      } else if (text === '单价') {
        CM_Network.cityMapDataParams.paramType = '2';
        unit = '元';
      } else if (text === '总价') {
        CM_Network.cityMapDataParams.paramType = '3';
        unit = '万元';
      }
      
      CM_Network.cityMapDataParams.paramValues = paramValues.join(',');
      
      // 合并搜索条件
      var tmpArray = [];
      for (var i = 0; i < paramValues.length; i++) {
        var value = paramValues[i];
        
        var arr = value.split('-');
        var first = parseInt(arr[0]);
        var last  = parseInt(arr[1]);
        
        var tmpStr;
        if (first === 0 && last > 0) {
          tmpStr = last.toString() + unit + '以下';
        } else if ( first > 0 && last === 0 ) {
          tmpStr = first.toString() + unit + '以上';
        } else {
          tmpStr = first.toString() + '-' + last.toString() + unit;
        }
        
        tmpArray.push(tmpStr);
      }
      
      $('#search-conditions #other-conditions').html('<span class="condition"><span class="bc-label">'+ text +'</span><span class="bc-value" id="time-value">'+ tmpArray.join(',') +'</span></span>');
      
    } else {
      $('#search-conditions #other-conditions').html('');
    }
    
    if (value || paramValues.length > 0) {
      startSearch();
      
      $('#filter-btn i').attr('class', 'glyphicon glyphicon-triangle-bottom');
    }

  });
  
  // 城市切换
  $('#city').change(function() {
    // console.log('123');
    var text = $('#city option:selected').text();
    // console.log(text);
    CM_Map.cityName = text;
    if (text === '全国') {
      // CM_Map.map.setCity(null);
      CM_Map.resetToOrigin();
    } else {
      CM_Map.map.setCity(text);
    }
  });
  
  // 打开搜索条
  $('#fab-button').click(function() {
    // alert(2);
    CM_UIUtil.showSearchBar();
  });
  
  // 关闭搜索条
  $('#close-search-bar-button').click(function() {
    CM_UIUtil.hideSearchBar();
    CM_UIUtil.hideRankPanel();
    CM_UIUtil.hideStatPanel();
    CM_UIUtil.hideJPPanel();
  });
  
  // 点击search按钮搜索
  $('#basic-addon2').click(function() {
    
    // console.log($('#city').val());
    
    if ($('#plate-keyword').val() && $('#plate-keyword').val().length > 0) {
      CM_Network.cityMapDataParams.plateName = $('#plate-keyword').val();
      CM_Network.cityMapDataParams.cityID    = $('#city').val(); 

      startSearch();
    }
    
    // CM_Network.loadCityMapData((res) => {
    //   console.log(res.data);
    //   CM_Map.addSmallMarkers(res.data);
    // }, (err) => {
    //   alert(err);
    // }); // end load
  }); // end search click
    
  // 监听marker点击事件
  $(document).on('marker:click', function(event, data) {
    // console.log(data);
    if (CM_Network.cityMapDataParams.level === '3') {
      //console.log('显示竞品');
      // 显示指标数据
      // showPlateStatData(data);
      CM_UIUtil.showStatData2(data);
      
      // 显示竞品数据
      CM_UIUtil.showJPData(data);
    }
    
    // 更新城市下拉列表显示
    $('#city').selectpicker('val', data.cityName);
  });
  
  // 添加jquery日期
  $('#date-start').datepicker({
    showAnim: 'slideDown',//show 默认,slideDown 滑下,fadeIn 淡入,blind 百叶窗,bounce 反弹,Clip 剪辑,drop 降落,fold 折叠,slide 滑动
    // minDate: -1,//最小日期，可以是Date对象，或者是数字（从今天算起，例如+7），或者有效的字符串('y'代表年, 'm'代表月, 'w'代表周, 'd'代表日, 例如：'+1m +7d')。
    // maxDate: +17,//最大日期，同上
    //defaultDate : +4, //默认日期，同上
    duration : 'fast',//动画展示的时间，可选是"slow", "normal", "fast",''代表立刻，数字代表毫秒数
    firstDay : 1 ,//设置一周中的第一天。默认星期天0，星期一为1，以此类推。
    nextText : '下一月',//设置“下个月”链接的显示文字。鼠标放上去的时候
    prevText : '上一月',//设置“上个月”链接的显示文字。
    showButtonPanel: true,//是否显示按钮面板 
    currentText : '今天',//设置当天按钮的文本内容，此按钮需要通过showButtonPanel参数的设置才显示。
    gotoCurrent : false,//如果设置为true，则点击当天按钮时，将移至当前已选中的日期，而不是今天。
    onSelect: function(dateText, inst) {
      $('#date-end').datepicker("option","minDate",dateText);
    },
  });
  
  $('#date-end').datepicker({
    showAnim: 'slideDown',//show 默认,slideDown 滑下,fadeIn 淡入,blind 百叶窗,bounce 反弹,Clip 剪辑,drop 降落,fold 折叠,slide 滑动
    // minDate: -1,//最小日期，可以是Date对象，或者是数字（从今天算起，例如+7），或者有效的字符串('y'代表年, 'm'代表月, 'w'代表周, 'd'代表日, 例如：'+1m +7d')。
    // maxDate: +17,//最大日期，同上
    //defaultDate : +4, //默认日期，同上
    duration : 'fast',//动画展示的时间，可选是"slow", "normal", "fast",''代表立刻，数字代表毫秒数
    firstDay : 1 ,//设置一周中的第一天。默认星期天0，星期一为1，以此类推。
    nextText : '下一月',//设置“下个月”链接的显示文字。鼠标放上去的时候
    prevText : '上一月',//设置“上个月”链接的显示文字。
    showButtonPanel: true,//是否显示按钮面板 
    currentText : '今天',//设置当天按钮的文本内容，此按钮需要通过showButtonPanel参数的设置才显示。
    gotoCurrent : false,//如果设置为true，则点击当天按钮时，将移至当前已选中的日期，而不是今天。
    onSelect: function(dateText, inst) {
      $('#date-start').datepicker("option","maxDate",dateText);
    },
  });
  
}); // end ready

// 限制只能输入数字  
$.fn.onlyNum = function () {  
    $(this).keypress(function (event) {  
        var eventObj = event || e;  
        var keyCode = eventObj.keyCode || eventObj.which;  
        // valid the input value (according to the regex)  
        return regNum(this.value + String.fromCharCode(keyCode)+0) ;  
    }).focus(function () {  
    //禁用输入法  
        this.style.imeMode = 'disabled';  
    });  
};  
/* 正则校验 */  
function regNum(number) {  
    if (/^[0-9]+(\.[0-9]+)?$/.test(number))  
        return true;  
    else  
        return false;  
} 

// 限制输入数字
$('#other-filter-start').onlyNum();
$('#other-filter-end').onlyNum();