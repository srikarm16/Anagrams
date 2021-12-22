const getServerOffset = (onDone) => {
  let serverOffset = 0;
  var clientTimestamp = (new Date()).valueOf();
  $.getJSON(`${backend_website}/getdatetimejson/?ct=`+clientTimestamp, function( data ) {
      var nowTimeStamp = (new Date()).valueOf();
      var serverClientRequestDiffTime = data.diff;
      var serverTimestamp = data.serverTimestamp;
      var serverClientResponseDiffTime = nowTimeStamp - serverTimestamp;
      var responseTime = (serverClientRequestDiffTime - nowTimeStamp + clientTimestamp - serverClientResponseDiffTime )/2

      serverOffset = responseTime;
      console.log("server offset: ", serverOffset);
      console.log(responseTime);
      if (onDone) 
        onDone(serverOffset);
  });
  return serverOffset;
}


const timeRemaining = (endTime) => {
  const time = luxon.DateTime.now().until(luxon.DateTime.fromMillis(+endTime)).length('seconds');
  if (!time) {
    return 0;
  }
  return time;
}