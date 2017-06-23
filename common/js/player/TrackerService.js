// JScript File

var isIpad = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
var g_Packets = [];

function RequestHeader(Command, DataPacket) {
    this.Command = Command;
    this.Data = DataPacket;
}

window.onError = function () {
    console.log("Window Error");
}

function ServiceBase() {
    this.XmlHttp = new XMLHttpRequest();
    this.URL = "";
}

function ServiceException(errorCode, errorMessage) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
}

// Ajax data request post to server
ServiceBase.prototype.Execute = function (PostData) {
    try {
        if (navigator.onLine) {
            return null;
        }
        else {
            if (isIpad) {
                SavePacket(PostData);
            }
        }
    }
    catch (e) {
        if (isIpad)
            SavePacket(PostData);
    }
}

function SavePacket(obj) {
    g_Packets.push(obj);
    if (g_Packets.length == 1) {
        setTimeout(function () {
            PacketSaved();
        }, 1000);
    }
}

function PacketSaved() {
    try {
        if (isIpad) {
            var data = g_Packets.pop();
            if (data == null) {
                return;
            } 

            var iframe = document.createElement("IFRAME");
            iframe.setAttribute("src", "app://" + JSON.stringify(data));
            document.documentElement.appendChild(iframe);
        }
    } catch (e) { }
}

function getQueryParams() {
    var qs = document.location.hash;
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[#&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}