$(document).ready(function() {
  
  // $('#search-breadcrumb').show();
  
  // 创建地图
  CM_Map.init();
  
  // 获取城市
  CM_Network.sendReq('城市地图字典APP', ['1', '-1'], (res) => {
    // console.log(res.data);
    var cities = res.data;
    var html = '<option value="-1">全国</option>';
    for (var i = 0; i < cities.length; i++) {
      var city = cities[i];
      html += '<option value="'+ city.id +'">'+ city.name +'</option>';
    }
    // console.log(html);
    $('#city').html(html);
  }, (err) => {
    // console.log(err);
    $('#city').html('');
  });
  
  // 加载城市地图数据
  CM_Network.loadCityMapData((res) => {
    CM_Map.addSmallMarkers(res.data);
  }, (err) => {
    alert(err);
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
      // html += '<a onclick="selectTimeItem(this);" data-value="'+ item.dic_value +'" class="item">'+ item.dic_name +'</a>';
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
    $('#advanced-search-bar').show();
  });
  
  // 关闭高级搜索
  $('#cancel-search').click(function() {
    $('#advanced-search-bar').hide();
  });
  
  // 开始高级查询
  $('#ok-search').click(function() {
    
  });
  
  // 打开搜索条
  $('#fab-button').click(function() {
    // alert(2);
    CM_UIUtil.showSearchBar();
  });
  // 点击search按钮搜索
  $('#basic-addon2').click(function() {
    
    console.log($('#city').val());
    
    CM_Network.cityMapDataParams.plateName = $('#plate-keyword').val();
    CM_Network.cityMapDataParams.cityID    = $('#city').val(); 

    CM_Network.loadCityMapData((res) => {
      console.log(res.data);
      CM_Map.addSmallMarkers(res.data);
    }, (err) => {
      alert(err);
    }); // end load
  }); // end search click
}); // end ready