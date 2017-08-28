//////////////////////// 显示或隐藏排名面板
$('#show-rank').change(function() {
  if (this.checked === true) {
    
    CM_UIUtil.showRankPanel();
    
    // 加载数据
    CM_UIUtil.loadAllRankData();
  } else {
    CM_UIUtil.hideRankPanel();
  }
});

$('#close-panel-btn').click(function() {
  CM_UIUtil.hideJPPanel();
});

window.CM_UIUtil = {
  showSearchBar: function() {
    $('#search-bar-container').animate({
      top: 0,
    });
    $('#fab-button').animate({
      opacity: '0.0',
    });
  },
  hideSearchBar: function() {
    $('#search-bar-container').animate({
      top: '-500px',
    });
    $('#fab-button').animate({
      opacity: '1.0',
    });
  },
  showRankPanel: function() {
    $("#rank-panel").animate({
      right: '10px',
      // opacity: '0.5',
      // height: '150px',
      // width: '150px'
    });
  },
  hideRankPanel: function() {
    $('#show-rank').prop('checked', false);
    
    $("#rank-panel").animate({
      right: '-350px',
      // opacity: '0.5',
      // height: '150px',
      // width: '150px'
    });
  },
  showStatPanel: function() {
    $("#stat-panel").animate({left: '10px'});
  },
  hideStatPanel: function() {
    $("#stat-panel").animate({left: '-300px'});
  },
  showJPPanel: function() {
    $('#jp-panel').show();
  },
  hideJPPanel: function() {
    $('#jp-panel').hide();
  },
  loadRankData: function(dataType, successCallback, failureCallback) {
    
    var cityID = CM_Network.cityMapDataParams.cityID;
    // var dateType = CM_Network.cityMapDataParams.dateType;
    
    var arr = ['销售面积㎡', '供应面积㎡', '价格（元/㎡）', '存量㎡'];
    
    var loading = $('#loading-rank-' + dataType);
    loading.html('数据加载中...');
    
    var isCity = cityID === '-1' ? true : false;
    var cid = isCity ? '0' : cityID;
    
    var str = '';
    var typeIndex = parseInt(dataType) - 1;
    if (typeIndex < arr.length) {
      str = arr[typeIndex];
    }
    var html = '<tr><th width="20%">排名</th><th width="30%" class="th-content">'+ (isCity ? '城市' : '板块') +'</th><th width="50%">'+ str +'</th></tr>';
    
    CM_Network.sendReq('城市地图排行数据APP', [cid, '0', dataType, '0'], function (res) {
      // console.log(res);
      if (!res || !res.data || res.data.length === 0) {
        loading.html('无数据显示');
      } else {
        loading.html('');
        
        var data = res.data;
        for (var i = 0; i < data.length; i++) {
          var item = data[i];
          var name = isCity ? item.cityname : item.platename;
          html += '<tr><td>'+ (i+1).toString() +'</td><td>'+ name +'</td><td>'+ item.value +'</td></tr>';
        }
      }
      
      $('#rank-table-' + dataType).html(html);
      
      successCallback(res);
    }, function (err) {
      // console.log(err);
      loading.html('数据加载失败!');
      
      $('#rank-table-' + dataType).html(html);
      
      failureCallback(err);
    });
  },
  
  loadAllRankData: function() {
    var types = ['1','2','3','4'];
    var _this = this;
    
    var cityID = CM_Network.cityMapDataParams.cityID;
    
    var rankTitle = $('#rank-panel #panel-heading');
    if (cityID === '-1') {
      rankTitle.html('城市近半年TOP5排名');
      $('#rank-panel .th-content').text('城市');
    } else {
      rankTitle.html(cityID + '板块TOP5排名');
      $('#rank-panel .th-content').text('板块');
    }
    
    for (var i = 0; i < types.length; i++) {
      _this.loadRankData(types[i], function (res) {
        console.log(res);
      }, function (err) {
        console.log(err);
      });
    }
  }
};