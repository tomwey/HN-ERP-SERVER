window.CM_Map = {
  markers: [],
  map: null,
  originCenter: [104.057651,30.67383],
  originZoom: 5,
  cityName: '全国',
  isLoading: false,
  cityNames: [],
  currentMarkerData: null,
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
    
    // CM_UIUtil.hideStatPanel();
    // CM_UIUtil.hideRankPanel();
    // CM_UIUtil.hideJPPanel();
    
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
            CM_UIUtil.hideStatPanel();
          } else {
            if (CM_Map.map.getZoom() >= 12) {
              $('#search-breadcrumb').html('共找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条板块数据');
              CM_Map.addPlateMarkers(res.data);
            } else {
              $('#search-breadcrumb').html('共找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条数据');
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
      
      // $("#stat-panel").animate({left: '-300px'});
      CM_UIUtil.hideStatPanel();
      
      $('#search-breadcrumb').html('拼命获取数据中...');
      
      CM_Network.loadCityMapData(function(res) {
        console.log(res.data);
        CM_Map.isLoading = false;
        if (!res.data || res.data.length === 0) {
          CM_Map.map.remove(CM_Map.markers);
          
          $('#search-breadcrumb').html('未获取到数据！');
          
        } else {
          CM_Map.addCityListMarkers(res.data);
          
          $('#city').selectpicker('val', '-1');
          
          $('#search-breadcrumb').html('共找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条城市数据');
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
      
      var tmpData = markerData;
      tmpData.level = 9;
      tmpData.cityName = markerData.cityname;
      //{ level: 9, cityName: markerData.cityname };
      
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
      
      marker.on('mouseover', function(e) {
        var _marker = e.target;
        _marker.setTop(true);
        // console.log(_marker.getOffset());
        // console.log('移入：' + _marker.getExtData());
        // CM_UIUtil.showStatPanel();
        // CM_UIUtil.showStatData2(_marker.getExtData());
      });
      marker.on('mouseout', function(e) {
        var _marker = e.target;
        _marker.setTop(false);
        // CM_UIUtil.hideStatPanel();
        // console.log('移出：' + _marker.getExtData());
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
    
    // console.log(markerDataArr);
    
    this.map.remove(this.markers);
    this.markers = [];
    
    // 显示指标数据
    
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[i];
      var marker = this._createLargeMarkerForData(markerData.platename, 12, markerData);
      
      this.markers.push(marker);
    } // done add markers
  },
  addCityDetailMarkers: function(markerDataArr) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    this.map.remove(this.markers);
    this.markers = [];
    
    // 显示指标数据
    var tmpData = markerDataArr[0];
    tmpData.level = 9;
    CM_UIUtil.showStatData2(tmpData);
    
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[0];
      
      var marker = this._createLargeMarkerForData(markerData.cityname, 12, markerData);
      
      this.markers.push(marker);
    } // done add markers
  },
  _createLargeMarkerContentFromData: function(title, dataArr) {
    // console.log(dataArr);
    html = '<div class="marker-container large-marker"><div class="marker-content"><p class="title">'+ title +'</p><table class="table">';
    for (var i = 0; i < dataArr.length; i++) {
      var item = dataArr[i];
      html += '<tr><td class="label" width="45%"><p>' + item.label + ':</p></td><td class="value" width="55%">'+ item.value +'</td></tr>';
    }
    html += '</table></div></div>';
    return html;
  },
  _createLargeMarkerForData: function(title, level, markerData) {
    var tmpData = markerData;//{ level: level, cityName: markerData.cityname, plateid: markerData.plateid, platename: markerData.platename };
    tmpData.level = level;
    tmpData.cityName = markerData.cityname;
    
    var dealMoney = markerData.dealmoney;
    var dealNum   = markerData.dealnum;
    var dealArea  = markerData.dealarea;
    
    var dataArr;
    if (dealMoney === 'NULL' && dealNum === 'NULL' && dealArea === 'NULL') {
      // 显示当前存量，去化周期，年销量
      var storeNum = CM_UIUtil.formatValue(markerData.storenum, 1, { value: 10000, suffix: '万' },'套','--');
    
      var cycle = CM_UIUtil.formatValue(markerData.cycle, 0, null,'月','--');

      var saleCount = CM_UIUtil.formatValue(markerData.dealsalecount, 1, { value: 10000, suffix: '万' },'套','--');
    
      dataArr = [{
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
    } else {
      // 显示成交面积，成交套数，成交金额
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
      v3 = CM_UIUtil.formatValue(markerData.dealarea, 1, { value: 100000, suffix: '万' },'㎡','--');
      
      dataArr = [{
                label: '成交金额',
                value: v1,
              },{
                label: '成交套数',
                value: v2,
              },{
                label: '成交面积',
                value: v3,
              },];
    }
    
    var marker = new AMap.Marker({
      position: [markerData.longitude, markerData.latitude],//marker所在的位置
      map: this.map, //创建时直接赋予map属性
      offset: new AMap.Pixel(-60, -60), //相对于基点的偏移位置
      content: this._createLargeMarkerContentFromData(title, dataArr),
      extData: tmpData,
    });
    
    marker.on('mouseover', function(e) {
      var _marker = e.target;
      _marker.setTop(true);
      // console.log(_marker.getExtData());
      // 
      // CM_UIUtil.showStatData2(_marker.getExtData());
      // 
      // if (CM_Network.cityMapDataParams.level === '3') {
      //   CM_UIUtil.showJPData(_marker.getExtData());
      // }
    });
    
    marker.on('mouseout', function(e) {
      var _marker = e.target;
      _marker.setTop(false);
      
      // CM_UIUtil.hideStatPanel();
      // CM_UIUtil.hideJPPanel();
    });
    
    marker.on('click', function(e) {
      var _marker = e.target;
      var _map = _marker.getMap();
      var newLevel = _marker.getExtData().level;
      var level = _map.getZoom();
      
      CM_Map.cityName = _marker.getExtData().cityName;
      // CM_Map.currentMarkerData = _marker.getExtData();
      
      if (level < newLevel) {
        _map.setZoomAndCenter(newLevel, _marker.getPosition());
      }
      
      // this.cityName = markerData.cityname;
      
      $(document).trigger('marker:click', _marker.getExtData());
      
      // $(document).trigger('marker:click', [this.cityName, newLevel]);
      
    });
    return marker;
  },
};
           