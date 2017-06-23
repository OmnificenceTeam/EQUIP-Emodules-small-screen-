
var startTime = new Date();
var _gTime = "";
var totalSpendTime = "00:00:00";

function GetTimeDifference(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    
    var s = Math.floor((diff / 1000) % 60);
    var m = Math.floor(((diff / 1000) / 60) % 60);
    var h = Math.floor((((diff / 1000) / 60) / 60) % 24);

    h = (h > 9) ? h : '0' + h;
    m = (m > 9) ? m : '0' + m;
    s = (s > 9) ? s : '0' + s;

    return h + ":" + m + ":" + s;
}

function SetSessionTime(sessionTime) {
    var _gSessionTime = g_scromManager.doLMSGetValue("cmi.core.session_time");
    var time = SetTime(_gSessionTime, sessionTime);
    g_scromManager.doLMSSetValue("cmi.core.session_time", time);
    g_scromManager.doLMSCommit();
}

function SetTotalTime(sessionTime) {
    var time = SetTime(totalSpendTime, sessionTime);
    totalSpendTime = time;
    g_scromManager.doLMSSetValue("cmi.core.total_time", totalSpendTime);
    g_scromManager.doLMSCommit();

    startTime = new Date();
}

function SetTime(oldTime, newTime) {
    oldTime = oldTime.split(':');
    newTime = newTime.split(':');
    var h = parseInt(oldTime[0]) + parseInt(newTime[0]);
    var m = parseInt(oldTime[1]) + parseInt(newTime[1]);
    var s = parseInt(oldTime[2]) + parseInt(newTime[2]);

    var date = new Date();
    date.setHours(h, m, s, 0);

    h = date.getHours();
    m = date.getMinutes();
    s = date.getSeconds();

    h = (h > 9) ? h : '0' + h;
    m = (m > 9) ? m : '0' + m;
    s = (s > 9) ? s : '0' + s;

    return h + ":" + m + ":" + s;
}