/*var map;
    
function initMap() {
  map = new AMap.Map('map',{
    resizeEnable: true,
    zoom: 5,
                    // center: [116.480983, 40.0958]
  });
            
  var scale = new AMap.Scale({});
  map.addControl(scale);
};
    
initMap();

// 添加小标记
function addSmallMarkers(pois) {
  var _markers = [];
  if (!pois) return [];
  
  for (var i = 0; i < pois.length; i++) {
    var marker = new AMap.Marker({
      position: [pois[i].longitude, pois[i].latitude],//marker所在的位置
      map: map, //创建时直接赋予map属性
      offset: new AMap.Pixel(-13, -13), //相对于基点的偏移位置
      content: '<div class="marker-container small-marker"><div class="text">'+ pois[i].platecount +'</div></div>',
      extData: { level: 9 },
    });
    marker.on('click', function(e) {
      var _marker = e.target;
      var _map = _marker.getMap();
      var newLevel = _marker.getExtData().level;
      var level = _map.getZoom();
      if (level < newLevel) {
        _map.setZoomAndCenter(newLevel, _marker.getPosition());
      }
    });
    _markers.push(marker);
  }
  // for (var i = 0; i<pois.length; i++) {
  //   // console.log(pois[i]);
  // }                                                                                             }
  return _markers;
}

// 添加大标记
function addLargeMarkers(pois) {
  var markers = [];
    for (var i = 0; i<pois.length; i++) {
      var marker = new AMap.Marker({
        position: [pois[i].lng, pois[i].lat],//marker所在的位置
        map: map, //创建时直接赋予map属性
        offset: new AMap.Pixel(-42, -42), //相对于基点的偏移位置
        content: '<div class="marker-container large-marker"><div class="text">' +
                    '<p class="title">'+ pois[i].cityname +'</p>' + 
                    '<p>当前存量: '+ pois[i].curr_stock +'</p>' +
                    '<p>去化周期: '+ pois[i].sell_length +'</p>' + 
                    '<p>年销量: '+ pois[i].year_sale +'</p>' +
                    '</div></div>',
        extData: { level: 13 },
      });
                                         
      marker.on('click', function(e) {
        var _marker = e.target;
        var _map = _marker.getMap();
        var newLevel = _marker.getExtData().level;
        var level = _map.getZoom();
        if (level < newLevel) {
           _map.setZoomAndCenter(newLevel, _marker.getPosition());
        }});
                                                     
      markers.push(marker);
    }      
    return markers;
}

var markers;

// 监听地图缩放事件
AMap.event.addListener(map,'zoomend',function(){
  console.log(map.getZoom());
  map.remove(markers);
  if ( map.getZoom() >= 13 ) {
    markers = addLargeMarkers(points2);
  } else if (map.getZoom() >= 9) {
    // markers = addLargeMarkers(points);
    loadCityMapData(function (res) {
      console.log(res);
      markers = addLargeMarkers(res.data);
    }, function (error) {
      console.log(error);
    });
    
    // 显示指标面板
    $("#stat-panel").animate({left: '10px'});
  } else {
    markers = addSmallMarkers(points);
    // 隐藏指标面板
    $("#stat-panel").animate({ left: '-300px'});
  }
});    

$(document).ready(function() {
  // console.log(1111);
  
  loadCityMapData(function (res) {
    console.log(res);
    markers = addSmallMarkers(res.data);
  }, function (error) {
    console.log(error);
  });
});*/

window.CM_Map = {
  markers: [],
  map: null,
  originCenter: [104.057651,30.67383],
  originZoom: 5,
  cityName: '全国',
  isLoading: false,
  resetToOrigin: function() {
    this.map.setZoomAndCenter(this.originZoom, this.originCenter);
  },
  _handleZoomOrMove: function() {
    
    if (this.isLoading) return;
    
    // console.log('loading');
    this.isLoading = true;
    
    $('#search-breadcrumb').html('拼命获取数据中...');
    
    if (this.map.getZoom() >= 9) {
      // this.map.getCity((res) => {
        // console.log(res);
        var city = this.cityName;//res.city;
        if (city.indexOf('市') >= 0) {
          city = city.substr(0, city.length - 1);
        }
        console.log(city);
        CM_Network.cityMapDataParams.cityID = city;
        
        if (this.map.getZoom() >= 13) {
          CM_Network.cityMapDataParams.level = '3';
        } else {
          CM_Network.cityMapDataParams.level = '2';
        }
        
        CM_Network.loadCityMapData((res) => {
          // console.log(res.data);
          this.isLoading = false;
          if (!res.data || res.data.length === 0) {
            this.map.remove(this.markers);
            $('#search-breadcrumb').html('未获取到数据！');
          } else {
            if (this.map.getZoom() >= 13) {
              $('#search-breadcrumb').html('在“'+ city +'”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条版块数据');
              this.addPlateMarkers(res.data);
            } else {
              $('#search-breadcrumb').html('在“'+ city +'”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条数据');
              this.addCityDetailMarkers(res.data);
            }
          }
        }, (err) => {
          this.isLoading = false;
          this.map.remove(this.markers);
          $('#search-breadcrumb').html('<span style="color:red;">获取数据失败！</span>');
        });
      // });
    } else {
      
      // $('#city').val('全国').change();
      
      CM_Network.cityMapDataParams.cityID = '-1';
      CM_Network.cityMapDataParams.level = '1';
      CM_Network.loadCityMapData((res) => {
        console.log(res.data);
        this.isLoading = false;
        if (!res.data || res.data.length === 0) {
          this.map.remove(this.markers);
          
          $('#search-breadcrumb').html('未获取到数据！');
          
        } else {
          this.addCityListMarkers(res.data);
          
          $('#city').selectpicker('val', '-1');
          
          $('#search-breadcrumb').html('在“全国”下找到<span style="color: red;padding: 0 5px;">'+ res.data.length +'</span>条城市数据');
        }
      }, (err) => {
        this.isLoading = false;
        
        $('#search-breadcrumb').html('<span style="color:red;">获取数据失败！</span>');
      });
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
    console.log(this.map.getCenter);
    // 监听地图移动事件
    AMap.event.addListener(this.map,'moveend', () => {
      // CM_UIUtil.hideSearchBar();
      // console.log('ddddddd');
        // console.log('move end');
        // console.log(this.map.getZoom());
        
        this._handleZoomOrMove();
    });
    
    // 监听地图缩放事件
    AMap.event.addListener(this.map,'zoomend',() => {
      // console.log(this.map.getZoom().toString() + ' zoom end');
      
      this._handleZoomOrMove();
        
      // map.remove(markers);
      // if ( map.getZoom() >= 13 ) {
      //   markers = addLargeMarkers(points2);
      // } else if (map.getZoom() >= 9) {
      //   // markers = addLargeMarkers(points);
      //   loadCityMapData(function (res) {
      //     console.log(res);
      //     markers = addLargeMarkers(res.data);
      //   }, function (error) {
      //     console.log(error);
      //   });
      //     
      //   // 显示指标面板
      //   $("#stat-panel").animate({left: '10px'});
      // } else {
      //   markers = addSmallMarkers(points);
      //   // 隐藏指标面板
      //   $("#stat-panel").animate({ left: '-300px'});
      // }
    });  
  },
  removeAllMarkers: function() {
    this.map.remove(this.markers);
    this.markers = [];
  },
  addCityListMarkers: function(markerDataArr, extData = { level: 9 }) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    this.map.remove(this.markers);
    
    this.markers = [];
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[i];
      
      var tmpData = { level: extData.level, cityName: markerData.cityname };
      
      var marker = new AMap.Marker({
        position: [markerData.longitude, markerData.latitude],//marker所在的位置
        map: this.map, //创建时直接赋予map属性
        offset: new AMap.Pixel(-35, -35), //相对于基点的偏移位置
        content: '<div class="marker-container small-marker"> ' +
                    '<div class="marker-content"> ' + 
                      '<p class="cityname">'+ markerData.cityname +'</p>' + 
                      '<p class="platecount">' + (markerData.platecount > 99 ? '99+' : markerData.platecount) + '个版块</p> ' + 
                    '</div></div>',
        extData: tmpData,
      });
      marker.on('click', (e) => {
        var _marker = e.target;
        var _map = _marker.getMap();
        var newLevel = _marker.getExtData().level;
        var level = _map.getZoom();
        this.cityName = _marker.getExtData().cityName;
        
        if (level < newLevel) {
          _map.setZoomAndCenter(newLevel, _marker.getPosition());
        }
        
        $(document).trigger('marker:click', _marker.getExtData());
        
      });
      this.markers.push(marker);
    } // done add markers
  },
  addPlateMarkers: function(markerDataArr, extData = { level: 13 }) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    this.map.remove(this.markers);
    
    this.markers = [];
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[i];
      // console.log(markerData);
      var money = markerData.dealmoney > 100000000 ? (markerData.dealmoney / 100000000).toFixed(1).toString() + '亿' 
      : (markerData.dealmoney / 10000.00).toFixed(1).toString() + '万';
      
      var saleNum = markerData.dealnum > 10000 ? (markerData.dealnum / 10000).toFixed(1).toString() + '万套' 
      : markerData.dealnum.toString() + '套';
      
      var area = markerData.dealarea > 100000 ? (markerData.dealarea / 100000).toFixed(1).toString() + '万㎡' 
      : markerData.dealarea.toString() + '㎡';
      
      // extData.cityName = markerData.cityname;
      
      var tmpData = { level: extData.level, cityName: markerData.cityname };
      
      var marker = new AMap.Marker({
        position: [markerData.longitude, markerData.latitude],//marker所在的位置
        map: this.map, //创建时直接赋予map属性
        offset: new AMap.Pixel(-60, -60), //相对于基点的偏移位置
        content: '<div class="marker-container large-marker"><div class="text">' +
                    '<p class="title">'+ markerData.platename + '</p>' + 
                    '<p>成交金额:'+ money +'</p>' +
                    '<p>成交套数:'+ saleNum +'</p>' + 
                    '<p>成交面积:'+ area +'</p>' +
                    '</div></div>',
        extData: tmpData,
      });
      marker.on('click', (e) => {
        var _marker = e.target;
        var _map = _marker.getMap();
        var newLevel = _marker.getExtData().level;
        var level = _map.getZoom();
        
        this.cityName = _marker.getExtData().cityName;
        
        if (level < newLevel) {
          _map.setZoomAndCenter(newLevel, _marker.getPosition());
        }
        
        // this.cityName = markerData.cityname;
        $(document).trigger('marker:click', _marker.getExtData());
        // $(document).trigger('marker:click', [this.cityName, newLevel]);
        
      });
      this.markers.push(marker);
    } // done add markers
  },
  addCityDetailMarkers: function(markerDataArr, extData = { level: 13 }) {
    if (!markerDataArr || markerDataArr.length === 0) return;
    
    this.map.remove(this.markers);
    
    this.markers = [];
    for (var i=0; i<markerDataArr.length; i++) {
      var markerData = markerDataArr[i];
      console.log(markerData);
      // extData.cityName = markerData.cityname;
      
      var tmpData = { level: extData.level, cityName: markerData.cityname };
      
      var marker = new AMap.Marker({
        position: [markerData.longitude, markerData.latitude],//marker所在的位置
        map: this.map, //创建时直接赋予map属性
        offset: new AMap.Pixel(-42, -42), //相对于基点的偏移位置
        content: '<div class="marker-container large-marker"><div class="text">' +
                    '<p class="title">'+ markerData.cityname +'</p>' + 
                    '<p>当前存量: '+ markerData.storenum +'</p>' +
                    '<p>去化周期: '+ markerData.cycle +'</p>' + 
                    '<p>&emsp;年销量: '+ markerData.dealsalecount +'</p>' +
                    '</div></div>',
        extData: tmpData,
      });
      marker.on('click', (e) => {
        var _marker = e.target;
        var _map = _marker.getMap();
        var newLevel = _marker.getExtData().level;
        var level = _map.getZoom();
        
        this.cityName = _marker.getExtData().cityName;
        
        if (level < newLevel) {
          _map.setZoomAndCenter(newLevel, _marker.getPosition());
        }
        
        // this.cityName = markerData.cityname;
        
        $(document).trigger('marker:click', _marker.getExtData());
        
        // $(document).trigger('marker:click', [this.cityName, newLevel]);
        
      });
      this.markers.push(marker);
    } // done add markers
  },
};
           