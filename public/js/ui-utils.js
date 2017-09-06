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
  
  formatValue: function(aVal, factor, boundary, unit, defaultVale) 
  {
    if (!aVal || aVal === '' || aVal === 'NULL') return defaultVale + '&emsp;&emsp;';
    
    var newValue = parseFloat(aVal);
    if (newValue === 0.0) return 0.0;
    
    if (newValue < 0.0) return '--';
    
    if (newValue < 10000) {
      newValue = newValue.toFixed(0);
    } else {
      newValue = newValue.toFixed(factor);
    }
    
    if (boundary && boundary.value) {
      
      if (newValue >= boundary.value) {
        var tmp = newValue / boundary.value;
        if (tmp >= 1000) {
          return tmp.toFixed(0).toString() + boundary.suffix + unit;
        } else {
          return tmp.toFixed(factor).toString() + boundary.suffix + unit;
        }
      } else {
        return newValue.toString() + unit;
      }
      
      // return newValue >= boundary.value ? 
      //   ( (newValue / boundary.value).toFixed(factor).toString() + boundary.suffix + unit ): 
      //   newValue.toString() + unit;
    } else {
      return newValue.toString() + unit;
    }
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
      
      var storeNum = CM_UIUtil.formatValue(markerData.storenum, 1, { value: 10000, suffix: '万' },'套','--');
      
      var cycle = CM_UIUtil.formatValue(markerData.cycle, 0, null,'月','--');

      var saleCount = CM_UIUtil.formatValue(markerData.dealsalecount, 1, { value: 10000, suffix: '万' },'套','--');
            
      // 显示指标数据
      
      statArr = [
        {label: '当前存量', value: storeNum},
        {label: '去化周期', value: cycle},
        {label: '成交均价', value: CM_UIUtil.formatValue(markerData.dealavgprice, 0, null,'元','--')},
        {label: '成交套数', value: saleCount},
      ];
      
      if (markerData.platecount !== 'NULL' && parseInt(markerData.platecount) > 0) {
        statArr.splice(0,0,{ label: '板块总数', value: markerData.platecount });
      }
    } else {
      var v1,v2,v3;
      
      var dealMoney = markerData.dealmoney;
      if (!dealMoney || dealMoney === 'NULL' || dealMoney === '') {
        v1 = '--';
      } else {
        v1 = parseFloat(dealMoney);
        
        if (v1 >= 100000000) {
          v1 = (v1 / 100000000).toFixed(1).toString() + '亿';
        } else {
          v1 = (v1 / 10000).toFixed(1).toString() + '万';
        }
      }
      
      v2 = CM_UIUtil.formatValue(markerData.dealnum, 1, { value: 10000, suffix: '万' },'套','--');
      v3 = CM_UIUtil.formatValue(markerData.dealarea, 1, { value: 10000, suffix: '万' },'㎡','--');
      
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
    CM_Network.sendReq('城市地图竞品均价数据APP', [data.plateid.toString(), '', ''], function(res) {
      // console.log('---------');
      // console.log(res);
      if (!res || !res.data || res.data.length === 0) {
        $('#avg-stat').html('暂无竞品均价数据');
      } else {
        var html = '<h4>当前销售价格:</h4>';
        for (var i = 0; i < res.data.length; i++) {
          var data = res.data[i];
          html += '<span class="avgprice">'+ data.name +'均价：'+ CM_UIUtil.formatValue(data.avgprice, 0, null, '', '--') +'</span>&emsp;';
        }
        $('#avg-stat').html(html);
      }
    }, function(err) {
      $('#avg-stat').html('获取均价数据失败');
    });
    
    // 加载竞品数据
    var paramType = CM_Network.cityMapDataParams.paramType;
    var paramValues = CM_Network.cityMapDataParams.paramValues;
    var dateType = CM_Network.cityMapDataParams.dateType;
    var bDate = CM_Network.cityMapDataParams.bDate;
    var eDate = CM_Network.cityMapDataParams.eDate;
    
    CM_Network.sendReq('城市地图竞品数据APP', [data.plateid.toString(),paramType,paramValues,dateType,bDate,eDate], function(res) {
      // console.log(res.data);
      if (!res || !res.data || res.data.length === 0) {
        $('#jp-panel #jp-loading').html('暂无数据');
        // $('#jp-panel #more-stat').html('');
      } else {
        $('#jp-panel #jp-loading').hide();
        
        var html = '<table class="table table-bordered"><tr><th>产品类型</th><th>面积段</th><th>成交套数</th><th>套数占比</th><th width="25%">近半年月均成交套数</th></tr>';
        for (var i = 0; i < res.data.length; i++) {
          var data = res.data[i];
          var prodType = data.name;
          var areaType = data.partvalue;
          var dealNum  = CM_UIUtil.formatValue(data.dealnum, 0, null, '','--');
          var dealPercent = CM_UIUtil.formatValue(data.dealnumpercent, 0, null, '%','--');//parseFloat(data.dealnumpercent).toFixed(0).toString() + '%';
          var avgDealNum = CM_UIUtil.formatValue(data.avgnum, 0, null, '','--');
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
    
    var arr = ['销售面积㎡', '供应面积㎡', '价格（元/㎡）', '存量（套）'];
    
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
    
    CM_Network.sendReq('城市地图排行数据APP', [cid.toString(), '0', dataType.toString(), '0'], function (res) {
      // console.log(res);
      if (!res || !res.data || res.data.length === 0) {
        loading.html('无数据显示');
      } else {
        loading.html('');
        
        var data = res.data;
        for (var i = 0; i < data.length; i++) {
          var item = data[i];
          var name = isCity ? item.cityname : item.platename;
          html += '<tr><td>'+ (i+1).toString() +'</td><td>'+ name +'</td><td>'+ CM_UIUtil.formatValue(item.value, 0, null, '', '--') +'</td></tr>';
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
      rankTitle.html(cityID + '板块近半年TOP5排名');
      $('#rank-panel .th-content').text('板块');
    }
    
    for (var i = 0; i < types.length; i++) {
      _this.loadRankData(types[i], function (res) {
        // console.log(res);
      }, function (err) {
        // console.log(err);
      });
    }
  }
};