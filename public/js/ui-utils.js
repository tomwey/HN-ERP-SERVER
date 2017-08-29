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
  showStatData: function(name, dataArr) {
    $("#stat-panel #panel-heading").html(name + '指标数据');
    
    var html = '';
    for (var i = 0; i < dataArr.length; i++) {
      var data = dataArr[i];
      html += '<tr><td>'+ data.label +':</td><td class="value">'+ data.value +'</td></tr>';
    }
    $("#stat-panel .table").html(html);
  },
  showStatData2: function(markerData) {
    
    CM_UIUtil.showStatPanel();
    
    var name = markerData.level >= 12 ? markerData.platename : markerData.cityname;
    $("#stat-panel #panel-heading").html(name + '指标数据');
    
    // 显示具体的指标数据
    var dealMoney = markerData.dealmoney;
    var dealNum   = markerData.dealnum;
    var dealArea  = markerData.dealarea;
    
    var statArr;
    if (dealMoney === 'NULL' && dealNum === 'NULL' && dealArea === 'NULL') {
      
      var storeNum = parseFloat(markerData.storenum);
      storeNum = storeNum >= 10000 ? (storeNum / 10000).toFixed(1).toString() + '万㎡' : 
      storeNum.toFixed(0).toString() + '㎡';
      
      var cycle = parseFloat(markerData.cycle) <= 0.0 ? 0 : parseFloat(markerData.cycle).toFixed(0).toString() + '%';
      
      var saleCount = parseInt(markerData.dealsalecount);
      saleCount = saleCount >= 10000 ? (saleCount / 10000).toFixed(0).toString() + '万套' : 
      saleCount.toString() + '套';
            
      // 显示指标数据
      
      statArr = [
        {label: '当前存量', value: storeNum},
        {label: '去化周期', value: cycle},
        {label: '成交均价', value: markerData.dealavgprice},
        {label: '成交套数', value: saleCount},
      ];
      
      if (markerData.platecount !== 'NULL') {
        statArr.splice(0,0,{ label: '板块总数', value: markerData.platecount });
      }
    } else {
      var v1,v2,v3;
      
      // 显示成交面积，成交套数，成交金额
        v1 = markerData.dealmoney >= 100000000 ? (markerData.dealmoney / 100000000).toFixed(1).toString() + '亿' 
      : (markerData.dealmoney / 10000.00).toFixed(1).toString() + '万';
      v2 = markerData.dealnum >= 10000 ? (markerData.dealnum / 10000).toFixed(1).toString() + '万套' 
      : markerData.dealnum.toString() + '套';
      v3 = markerData.dealarea >= 100000 ? (markerData.dealarea / 100000).toFixed(1).toString() + '万㎡' 
      : markerData.dealarea.toString() + '㎡';
    
      statArr = [{
                label: '成交金额',
                value: v1,
              },{
                label: '成交套数',
                value: v2,
              },{
                label: '成交面积',
                value: v3,
              },];
      // CM_UIUtil.showStatData(markerData.platename, dataArr);
    }
    
    var html = '';
    for (var i = 0; i < statArr.length; i++) {
      var data = statArr[i];
      html += '<tr><td>'+ data.label +':</td><td class="value">'+ data.value +'</td></tr>';
    }
    $("#stat-panel .table").html(html);
    
  },
  showJPData: function(data) {
    $('#jp-panel').show();
    
    $('#jp-panel #panel-heading').html(data.platename + '板块-TOP5竞品数据');
    
    $('#jp-panel #jp-loading').show();
    $('#jp-panel #more-stat').html('');
    
    // 加载竞品均价数据
    CM_Network.sendReq('城市地图排行数据APP', [data.plateid, '', ''], function(res) {
      // console.log(res);
      if (!res || !res.data || res.data.length === 0) {
        $('#avg-stat').html('暂无竞品均价数据');
      } else {
        var html = '';
        for (var i = 0; i < res.data.length; i++) {
          var data = res.data[i];
          html += '<span class="avgprice">'+ data.name +'：'+ data.avgprice +'</span>&emsp;';
        }
        $('#avg-stat').html(html);
      }
    }, function(err) {
      $('#avg-stat').html('获取均价数据失败');
    });
    
    // 加载竞品数据
    CM_Network.sendReq('城市地图竞品数据APP', [data.plateid,'',''], function(res) {
      // console.log(res.data);
      if (!res || !res.data || res.data.length === 0) {
        $('#jp-panel #jp-loading').html('暂无数据');
        // $('#jp-panel #more-stat').html('');
      } else {
        $('#jp-panel #jp-loading').hide();
        
        var html = '<table class="table table-bordered"><tr><th>产品类型</th><th>面积段</th><th>成交套数</th><th>套数占比</th><th>月均成交套数</th></tr>';
        for (var i = 0; i < res.data.length; i++) {
          var data = res.data[i];
          var prodType = data.name;
          var areaType = data.partvalue;
          var dealNum  = data.dealnum;
          var dealPercent = parseFloat(data.dealnumpercent).toFixed(0).toString() + '%';
          var avgDealNum = data.avgnum;
          html += '<tr><td>'+ prodType +'</td><td>'+ areaType +'</td><td>'+ dealNum +'</td><td>'+ dealPercent +'</td><td>'+ avgDealNum +'</td></tr>';
        }
        
        html += '</table>';
        $('#jp-panel #more-stat').html(html);
      }
    }, function(err) {
      $('#jp-panel #jp-loading').html('数据加载失败！');
    });
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