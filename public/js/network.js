window.CM_Network = {
  cityMapDataParams: {
    cityID: '-1',
    plateID: '-1',
    plateName: '',
    paramType: '-1',
    paramValues: '',
    dateType: '6',
    bDate: '',
    eDate: '',
  },
  loadCityMapData: function(successCallback, errorCallback) {
    var params = [this.cityMapDataParams.cityID, 
                  this.cityMapDataParams.plateID,
                  this.cityMapDataParams.plateName,
                  this.cityMapDataParams.paramType,
                  this.cityMapDataParams.paramValues,
                  this.cityMapDataParams.dateType,
                  this.cityMapDataParams.bDate,
                  this.cityMapDataParams.eDate,
                  ];
    this.sendReq('城市地图APP', params, successCallback, errorCallback);
  },
  sendReq: function(apiName, paramsArr, successCallback, errorCallback) {
    params = {};
    params.dotype = 'GetData';
    params.funname = apiName;
    
    for (var i = 0; i < paramsArr.length; i++) {
      var key = 'param' + (i+1).toString();
      params[key] = paramsArr[i];
    }
    
    var body = JSON.stringify(params);
    console.log('请求参数：' + body);
    
    $.ajax({
      url: 'http://erp20-app.heneng.cn:16681/',
      type: 'POST',
      data: body,
      contentType: "application/json; charset=utf-8",  
      dataType: "json",
      success: successCallback,
      error: errorCallback
    });
  }
}