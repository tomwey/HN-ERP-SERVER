window.CM_Map = {
  markers: [],
  map: null,
  originCenter: [104.057651,30.67383],
  originZoom: 5,
  cityName: '全国',
  isLoading: false,
  cityNames: [],
  resetToOrigin: function() {
    this.map.setZoomAndCenter(this.originZoom, this.originCenter);
  },
  _formatCityName: function(city) {
    var cityname = city;
    if (cityname.indexOf('市') >= 0) {
      cityname = cityname.substr(0, cityname.length - 1);
    }
    return cityname;
  },
  _handleZoomOrMove: function() {
    
    if (CM_Map.isLoading) return;
    
    // console.log('loading');
    this.isLoading = true;
    
    // console.log(CM_Network.lastCityMapParams);
    // console.log(CM_Network.cityMapDataParams);
    
    if (this.map.getZoom() >= 9) {
        
        // $('#show-rank-cb').show();
        /*this.map.getCity((res) => {
          // console.log(res);
          // console.log(this.map.getBounds());
          var currentCity = this._formatCityName(res.city);
          // console.log(this.cityNames);
          if (this.cityNames.indexOf(currentCity) >= 0) {
            console.log('限制到当前城市');
            
            this.limitMapShowToBounds();
          } else {
            
          }
        });*/
        
        var city = this._formatCityName(this.cityName);
        
        console.log(city);
        
        CM_Network.cityMapDataParams.cityID = city;
        
        if (this.map.getZoom() >= 12) {
          CM_Network.cityMapDataParams.level = '3';
        } else {
          CM_Network.cityMapDataParams.level = '2';
        }
        
        if (!CM_Network.canLoadData()) {
          this.isLoading = false;
          return;
        } 
        
        $('#search-breadcrumb').html('拼命获取数据中...');
        
        CM_Network.loadCityMapData(function(res) {
          console.log(res.data);
          CM_Map.isLoading = false;
          if (!res.data || res.data.length === 0) {
            CM_Map.map.remove(CM_Map.markers);
            $('#search-breadcrumb').html('未获取到数据！');
            $("#stat-panel").animate({left: '-300px'});
          } else {
            if (CM_Map.map.getZoom() >= 12) {
              $('#search-breadcrumb').html('在“'+ city +'”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条板块数据');
              CM_Map.addPlateMarkers(res.data);
            } else {
              $('#search-breadcrumb').html('在“'+ city +'”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条数据');
              CM_Map.addCityDetailMarkers(res.data);
            }
          }
        }, function(err) {
          CM_Map.isLoading = false;
          CM_Map.map.remove(CM_Map.markers);
          $('#search-breadcrumb').html('<span style="color:red;">获取数据失败！</span>');
        });
      // });
    } else {
      
      // $('#city').val('全国').change();
      
      // $('#show-rank-cb').hide();
      
      // 清除地图显示限制
      this.clearLimitMapShowToBounds();
      
      CM_Network.cityMapDataParams.cityID = '-1';
      CM_Network.cityMapDataParams.level = '1';
      
      if (!CM_Network.canLoadData()) {
        this.isLoading = false;
        return;
      } 
      
      $("#stat-panel").animate({left: '-300px'});
      
      $('#search-breadcrumb').html('拼命获取数据中...');
      
      CM_Network.loadCityMapData(function(res) {
        // console.log(res.data);
        CM_Map.isLoading = false;
        if (!res.data || res.data.length === 0) {
          CM_Map.map.remove(CM_Map.markers);
          
          $('#search-breadcrumb').html('未获取到数据！');
          
        } else {
          CM_Map.addCityListMarkers(res.data);
          
          $('#city').selectpicker('val', '-1');
          
          $('#search-breadcrumb').html('在“全国”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条城市数据');
        }
      }, function(err) {
        CM_Map.isLoading = false;
        
        $('#search-breadcrumb').html('<span style="color:red;">获取数据失败！</span>');
      });
    }
    
    // 加载排名数据
    if ( $('#show-rank').is(':checked') ) {
      // 只有在打开了显示排名的时候才加载数据
      CM_UIUtil.loadAllRankData();
    }
  },
  init: function() {
    this.map = new AMap.Map('map',{
      resizeEnable: true,
      zoom: this.originZoom,
      center: this.originCenter,
                      // center: [116.480983, 40.0958]
    });
    var scale = new AMap.Scale({});
    this.map.addControl(scale);
    // console.log(this.map.getCenter());
    
    // 监听地图移动事件
    AMap.event.addListener(this.map,'moveend', function() {
        
        CM_Map._handleZoomOrMove();
    });
    
    // 监听地图缩放事件
    AMap.event.addListener(this.map,'zoomend',function() {
      // console.log(this.map.getZoom().toString() + ' zoom end');
      
      CM_Map._handleZoomOrMove();
    });  
  },
  limitMapShowToBounds: function() {
    this.map.setLimitBounds(this.map.getBounds());
  },
  clearLimitMapShowToBounds: function() {
    this.map.clearLimitBounds();
  },
  removeAllMarkers: function() {
    this.map.remove(this.markers);
    this.markers = [];
  },
  addCityListMarkers: function(markerDataArr) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    this.map.remove(this.markers);
    
    this.markers = [];
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[i];
      
      var tmpData = { level: 9, cityName: markerData.cityname };
      
      var marker = new AMap.Marker({
        position: [markerData.longitude, markerData.latitude],//marker所在的位置
        map: this.map, //创建时直接赋予map属性
        offset: new AMap.Pixel(-35, -35), //相对于基点的偏移位置
        content: '<div class="marker-container small-marker"> ' +
                    '<div class="marker-content"> ' + 
                      '<p class="cityname">'+ markerData.cityname +'</p>' + 
                      '<p class="platecount">' + (markerData.platecount > 99 ? '99+' : markerData.platecount) + '个板块</p> ' + 
                    '</div></div>',
        extData: tmpData,
      });
      marker.on('click', function(e) {
        var _marker = e.target;
        var _map = _marker.getMap();
        var newLevel = _marker.getExtData().level;
        var level = _map.getZoom();
        
        CM_Map.cityName = _marker.getExtData().cityName;
        
        if (level < newLevel) {
          _map.setZoomAndCenter(newLevel, _marker.getPosition());
        }
        
        $(document).trigger('marker:click', _marker.getExtData());
        
      });
      this.markers.push(marker);
    } // done add markers
  },
  addPlateMarkers: function(markerDataArr) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    this.map.remove(this.markers);
    
    this.markers = [];
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[i];
      // console.log(markerData);
      var money = markerData.dealmoney >= 100000000 ? (markerData.dealmoney / 100000000).toFixed(1).toString() + '亿' 
      : (markerData.dealmoney / 10000.00).toFixed(1).toString() + '万';
      
      var saleNum = markerData.dealnum >= 10000 ? (markerData.dealnum / 10000).toFixed(1).toString() + '万套' 
      : markerData.dealnum.toString() + '套';
      
      var area = markerData.dealarea >= 100000 ? (markerData.dealarea / 100000).toFixed(1).toString() + '万㎡' 
      : markerData.dealarea.toString() + '㎡';
      
      // extData.cityName = markerData.cityname;
      
      // var tmpData = { level: extData.level, cityName: markerData.cityname };
      
      var dataArr = [{
          label: '成交金额',
          value: money,
        },{
          label: '成交套数',
          value: saleNum,
        },{
          label: '成交面积',
          value: area,
        },];
      
      var marker = this._createLargeMarkerForData(markerData.platename, dataArr, 12, markerData);
      
      this.markers.push(marker);
    } // done add markers
  },
  _createLargeMarkerContentFromData: function(title, dataArr) {
    // console.log(dataArr);
    html = '<div class="marker-container large-marker"><div class="marker-content"><p class="title">'+ title +'</p><table class="table">';
    for (var i = 0; i < dataArr.length; i++) {
      var item = dataArr[i];
      html += '<tr><td class="label"><p>' + item.label + ':</p></td><td class="value">'+ item.value +'</td></tr>';
    }
    html += '</table></div></div>';
    return html;
  },
  _createLargeMarkerForData: function(title, dataArr, level, markerData) {
    var tmpData = { level: level, cityName: markerData.cityname, plateid: markerData.plateid, platename: markerData.platename };
    
    var marker = new AMap.Marker({
      position: [markerData.longitude, markerData.latitude],//marker所在的位置
      map: this.map, //创建时直接赋予map属性
      offset: new AMap.Pixel(-60, -60), //相对于基点的偏移位置
      content: this._createLargeMarkerContentFromData(title, dataArr),
      extData: tmpData,
    });
    
    marker.on('click', function(e) {
      var _marker = e.target;
      var _map = _marker.getMap();
      var newLevel = _marker.getExtData().level;
      var level = _map.getZoom();
      
      CM_Map.cityName = _marker.getExtData().cityName;
      
      if (level < newLevel) {
        _map.setZoomAndCenter(newLevel, _marker.getPosition());
      }
      
      // this.cityName = markerData.cityname;
      
      $(document).trigger('marker:click', _marker.getExtData());
      
      // $(document).trigger('marker:click', [this.cityName, newLevel]);
      
    });
    return marker;
  },
  addCityDetailMarkers: function(markerDataArr) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    // 显示指标数据
    $("#stat-panel").animate({left: '10px'});
    
    $("#stat-panel #panel-heading").html(this.cityName + '指标数据');
    
    this.map.remove(this.markers);
    this.markers = [];
    
    // for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[0];
      // console.log(markerData);
      // extData.cityName = markerData.cityname;
      
      var storeNum = parseFloat(markerData.storenum);
      storeNum = storeNum >= 10000 ? (storeNum / 10000).toFixed(0).toString() + '万㎡' : 
      storeNum.toFixed(0).toString() + '㎡';
      
      var cycle = parseFloat(markerData.cycle) <= 0.0 ? 0 : parseFloat(markerData.cycle).toFixed(0).toString() + '%';
      
      var saleCount = parseInt(markerData.dealsalecount);
      saleCount = saleCount >= 10000 ? (saleCount / 10000).toFixed(0).toString() + '万套' : 
      saleCount.toString() + '套';
      
      var dataArr = [{
          label: '当前存量',
          value: storeNum,
        },{
          label: '去化周期',
          value: cycle,
        },{
          label: '年销量',
          value: saleCount,
        },
      ];
      
      // 设置指标数据
      
      // var dealsalecount = parseInt(markerData.dealsalecount);
      // saleCount = saleCount >= 10000 ? (saleCount / 10000).toFixed(0).toString() + '万套' : 
      // saleCount.toString() + '套';
      
      $('#stat-panel #plateCount').html(markerData.platecount);
      
      $('#stat-panel #storeNum').html(storeNum);
      $('#stat-panel #cycle').html(cycle);
      
      // $('#stat-panel #saleCount').html(saleCount);
      $('#stat-panel #saleAvgPrice').html(markerData.dealavgprice);
      $('#stat-panel #dealSaleCount').html(saleCount);
      
      var marker = this._createLargeMarkerForData(markerData.cityname, dataArr, 12, markerData);
      
      this.markers.push(marker);
    // } // done add markers
  },
};
           