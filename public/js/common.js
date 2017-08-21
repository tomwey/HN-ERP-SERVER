$(document).ready(function() {
  
  // $('select').chosen({
  //   no_results_text:
  //   "没有找到",
  // });
  
  // $('#search-breadcrumb').show();
  
  function startSearch() {
    
    $('#advanced-search-bar').hide();
    
    // 加载城市地图数据
    $('#search-breadcrumb').html('拼命获取数据中...');

    // CM_Network.cityMapDataParams.level = '1';
    CM_Network.loadCityMapData((res) => {
      if (!res.data || res.data.length === 0) {
        $('#search-breadcrumb').html('未找到数据');
        CM_Map.removeAllMarkers();
      } else {
        if ( CM_Network.cityMapDataParams.level === '1' ) {
          CM_Map.addCityListMarkers(res.data);
        } else if ( CM_Network.cityMapDataParams.level === '2' ) {
          CM_Map.addCityDetailMarkers(res.data);
        } else if ( CM_Network.cityMapDataParams.level === '3' ) {
          CM_Map.addPlateMarkers(res.data);
        }
    
        $('#search-breadcrumb').html('共找到<span style="color: red;padding: 0 5px;">'+ res.data.length
         +'</span>条数据');
       }
    }, (err) => {
      // alert(err);
      $('#search-breadcrumb').html('<span style="color: red;">获取数据失败</span>');
    });
  }
  
  // 创建地图
  CM_Map.init();
  
  // 获取城市
  CM_Network.sendReq('城市地图字典APP', ['1', '-1'], (res) => {
    // console.log(res.data);
    var cities = res.data;
    var html = '<option value="-1">全国</option>';
    for (var i = 0; i < cities.length; i++) {
      var city = cities[i];
      html += '<option value="'+ city.name +'">'+ city.name +'</option>';
    }
    // console.log(html);
    $('#city').html(html);
    
    // $("#city").trigger("chosen:updated");
  }, (err) => {
    // console.log(err);
    $('#city').html('');
  });
  
  // 加载城市地图数据
  $('#search-breadcrumb').html('拼命获取数据中...');
  
  CM_Network.cityMapDataParams.level = '1';
  CM_Network.loadCityMapData((res) => {
    CM_Map.addCityListMarkers(res.data);
    $('#search-breadcrumb').html('在“全国”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条城市数据');
  }, (err) => {
    // alert(err);
    $('#search-breadcrumb').html('<span style="color: red;">获取全国城市数据失败</span>');
  });
  
  ////////////////////////////// 加载高级搜索里面的基础数据开始 /////////////////////////////////
  // 加载时间条件
  $('#filter-time-items').html('加载数据中...');
  CM_Network.sendReq('公共字典APP', ['城市地图前端日期段'], (res) => {
    console.log(res);
    html = ''
    var items = res.data;
    if (!items || items.length === 0) {
      $('#filter-time-items').html('暂无数据');
      return;
    }
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      html += '<label class="radio-inline"><input type="radio" name="date_item" id="date_item" value="'+ item.dic_value +'">'+ item.dic_name +'</label>';
    }
    $('#filter-time-items').html(html);
  }, (err) => {
    // console.log(err);
    $('#filter-time-items').html('<span style="color:red;">获取数据出错</span>');
  });
  
  function selectTimeItem(el) {
    var $this = $(el);
    console.log($this.data('value'));
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
    CM_Network.sendReq('公共字典APP', [val], (res) => {
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
      
    }, (err) => {
      // console.log(err);
      $('#other-filter-items').html('<span style="color:red;">获取数据出错</span>');
      
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
  });
  
  // 清除搜索
  $('#clear-search').click(function() {
    // console.log('d-');
    CM_Network.cityMapDataParams.dateType = '394';
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
    
    $('input:radio:checked').prop('checked', false);
    $('.filter-items input[type="checkbox"]').each(function() {
      $(this).prop('checked', false);
    });
    
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
      } else {
        CM_Network.cityMapDataParams.bDate = '';
        CM_Network.cityMapDataParams.eDate = '';
      }
    }
    
    // 准备其他指标数据
    var paramValues = [];
    $("input[type=checkbox]:checked").each(function() {
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
      console.log(text);
      console.log(paramValues.join(','));
      
      if (text === '面积') {
        CM_Network.cityMapDataParams.paramType = 1;
      } else if (text === '单价') {
        CM_Network.cityMapDataParams.paramType = 2;
      } else if (text === '总价') {
        CM_Network.cityMapDataParams.paramType = 3;
      }
      
      CM_Network.cityMapDataParams.paramValues = paramValues.join(',');
    }
    
    if (value || paramValues.length > 0) {
      startSearch();
      
      
      // 加载城市地图数据
      // $('#search-breadcrumb').html('拼命获取数据中...');
      // 
      // CM_Network.cityMapDataParams.level = '1';
      // CM_Network.loadCityMapData((res) => {
      //   if ( CM_Network.cityMapDataParams.level === '1' ) {
      //     CM_Map.addCityListMarkers(res.data);
      //   } else if ( CM_Network.cityMapDataParams.level === '2' ) {
      //     CM_Map.addCityDetailMarkers(res.data);
      //   } else if ( CM_Network.cityMapDataParams.level === '3' ) {
      //     CM_Map.addPlateMarkers(res.data);
      //   }
      //   
      //   $('#search-breadcrumb').html('共找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条数据');
      // }, (err) => {
      //   // alert(err);
      //   $('#search-breadcrumb').html('<span style="color: red;">获取数据失败</span>');
      // });
    }
    
    // console.log($("input[type='checkbox']").eq(1).attr("checked").value)
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
  $(document).on('marker:click', (event, data) => {
    // console.log(data + $('#city'));
    // console.log(data);
    $('#city').selectpicker('val', data.cityName);
    
    // $('#city').val(data.cityName).change();
  });
  
}); // end ready