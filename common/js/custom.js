var QuestionNumber = 1;
var NumberofQ = 3;
var CorrectAnswer = 0;
var g_total = {};
var right_wrong_flag = false;
var flag_answer = false;
var transcriptState = true;
var _optArray = ['', 'One', 'Two', 'Three'];
var _gchance = 0;
var glowing = false;

$(document).ready(function () {
    $('body').attr('oncontextmenu', 'return false');
    /* To hide tooltip when click on document */
    $(document).click(function (event) {
        var target = event.target;
        if (target.id != "showHelp")
            $('img').tooltip('hide');
    });
});

function GetUTCTime(now) {
    var utc = now.toUTCString();
    return utc;
}

/* Show tooptip when clicked help icon */
function ShowHelp() {
    $('img').tooltip('show');
    coursePlayer.pause();
}

/* Hide tooltip on icon hover */
function HideToolTip(ele) {
    $(ele).tooltip('hide');
}

/* Hide transcript */
function onclickHideTranscription(ele) {
    transcriptState = false;
    var transcript = $(ele).parent().parent().parent().find('#transcript-hide');

    $(transcript).hide("drop", { direction: "right" }, "slow", function () {
        $(ele).parent().parent().parent().find('.slidecontent').css("width", "100%");
        $(".frame").css("margin-left", "130px");
        $(ele).parent().parent().parent().find('#stickyContent').show();
    });
}

/* Show transcript */
//function onclickShowTranscription(ele) {
//    $(".frame").css("margin-left", "0px");
//    $(ele).hide();
//    transcriptState = true;
//    var transcript = $(ele).parent().find('#transcript-hide');
//    $(transcript).show();
//    $(transcript).attr('class', 'box a_normal').addClass("flipInRight");
//    window.setTimeout(function () {
//        $(transcript).attr('class', 'box a_normal');
//    }, 200);
//    $(ele).parent().find('.slidecontent').css("width", "70%");
//}


function onclickShowTranscription(ele) {
    var a = $(ele).parent().find('.frame').css("margin-left");
    // var b = $(".frame").css("margin-left");
    if (a == "0px") {
        $(ele).parent().find('#sh_trn').attr("src", "../common/img/showTrans.png");
        $(ele).parent().find('#stickyContent').css("right", "0px");
        transcriptState = true;
        var transcript = $(ele).parent().find('#transcript-hide');
        $(transcript).hide();
        $(ele).parent().find('.slidecontent').css("width", "99%");
        $(".frame").css("margin-left", "130px");
        $(ele).parent().find('#stickyContent').show();
    }
    else {
        $(ele).parent().find('#sh_trn').attr("src", "../common/img/hideTrans.png");
        $(ele).parent().find('#stickyContent').css("right", "0px");
        document.getElementById("transcript-hide").style.display = "block";
        // $(ele).hide();
        transcriptState = false;
        var transcript = $(ele).parent().find('#transcript-hide');
        $(transcript).show();
        $(".frame").css("margin-left", "0px");
        $(transcript).attr('class', 'box a_normal').addClass("flipInRight");
        $(transcript).attr('class', 'box a_normal');
        $(ele).parent().find('.slidecontent').css("width", "70%");
    }
}

/* To play slide according to playlist click*/
function onClickPlayList(slideIndex, ele) {
    transcriptState = true;
    $('#PlayListDiv').hide("scale", 1000);
    onclickClosePlaylist();
    coursePlayer.LoadbySlide(slideIndex);

    $('#curslide').hide();
    $('#slideLabel').hide();
    var elements = $(ele).parent().find('div');
    for (var index = 0; index < elements.length; index++) {
        elements[index].className = "list-items";
    }
    $(ele).attr('class', 'list-items active');
    mySlide = coursePlayer.slideIndex;
}

/* Show playlist */
function onclickPlaylistImg() {
    document.getElementById("NxtImg").style.pointerEvents = "initial";
    $('#GlossaryDiv').hide();
    coursePlayer.pause();
    $('#curslide').hide("drop", { direction: "left" }, "slow", function () {
        $('#PlayListDiv').show("drop", { direction: "right" }, 1000, function () {
            $('#GlossaryDiv').hide();
        });
    });

}

/* Hide playlist */
function onclickClosePlaylist() {
    $('#PlayListDiv').hide("scale", 1000, function () {
        $('#GlossaryDiv').hide();
        $('#curslide').show();
    });
}

function onclickClosereference() {
    $('#dropdown-6').hide("scale", 1000, function () {
        $('#curslide').show();
    });
}

function onclickCloseglossary() {
    $('#GlossaryDiv').hide("scale", 1000, function () {
        $('#PlayListDiv').hide();
        $('#curslide').show();
    });
}

function onclickGlossaryImg() {
    coursePlayer.pause();
    if ($('#PlayListDiv').is(":visible")) {
        $('#PlayListDiv').hide("drop", { direction: "left" }, "slow", function () {
            $('#GlossaryDiv').show();
            $('#GlossaryDiv').attr('class', 'box a_normal').addClass("zoomInRight");
            window.setTimeout(function () {
                $('#GlossaryDiv').attr('class', 'box a_normal');
            }, 1000);
        });
    }
    else {
        $('#curslide').hide("drop", { direction: "left" }, "slow", function () {
            $('#GlossaryDiv').show();
            $('#GlossaryDiv').attr('class', 'box a_normal').addClass("zoomInRight");
            window.setTimeout(function () {
                $('#GlossaryDiv').attr('class', 'box a_normal');
            }, 1000);
        });
    }
}

// Onclick answer
function onclickRadio(ele) {
    //if (g_i == 5) {
    //    $('#curslide').find("#button").hide();
    //    $('#curslide').find("#finish_button").show();
    //}
    //else {
    //    $('#curslide').find("#button").show();
    //    $('#curslide').find("#finish_button").hide();
    //}
    $('#curslide').find("#button").show();
}

function onclickAnswer(ele) {
    disableAll = false;
    var status = false;
    var answer = 0;
    var flag = false;
    var Node = $(ele).parent().parent().parent();
    var answerText = $(Node).find('#AnswerText').val();
    var elements = $(Node).find('input');
    var checkAns = false;
    var ans = $(Node).find('#Answer').val();
    var score = $(Node).find('#totalscore').val();
    var optionCount = parseInt($(Node).find('#OptionCount').val());
    var userOptCount = 0;

    for (var i = 0; i < elements.length ; i++) {
        if (elements[i].type == 'radio') {
            if (elements[i].checked) {
                answer = elements[i].value;
                flag = true;
                status = true;
            }
        }
        else if (elements[i].type == 'checkbox') {
            if (elements[i].checked) {
                answer += parseInt(elements[i].value);
                userOptCount += 1;
                status = true;
            }
        }
    }
    _gchance++;

    if (!status) {
        alert("select an option");
    }
    else {
        if (parseInt(answer) == parseInt($(Node).find('#Answer').val())) {
            CorrectAnswer += 1;
            g_total[$(Node).find('#Answer').attr('qid')] = parseInt($(Node).find('#Percentage').val());
            var total = 0;
            for (var key in g_total) {
                if (g_total.hasOwnProperty(key)) {
                    total += parseInt(g_total[key]);
                }
            }
            QuestionNumber += 1;
            $(ele).attr('disabled', 'disabled');
            $('#AnswerModal').modal('show');
            $('#AnswerModal').find('.modal-body').html('<h4>Congratulations! <i><img src="../common/img/right.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Correct answer. Please click <strong>continue</strong> to proceed.");
            _gchance = 0;

        }
        else if (_gchance == 1) {
            $('#DragDropModal').modal('show');
            $('#DragDropModal').find('.modal-body').html('<h4>Sorry! <i><img src="../common/img/wrong.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Incorrect answer. Please try again.");

            //var indexofOpt = optionCount - userOptCount;
            //var errMsg = "";
            //if (indexofOpt == 0) {
            //    errMsg = "Wrong answer. Please try again";
            //}
            //else if (indexofOpt > 0) {
            //    errMsg = "Wrong answer. Multiple answers can be selected.";
            //}
            //else {
            //    errMsg = "Wrong answer. Multiple answers can be selected.";
            //}
            //if (flag) {
            //    errMsg = "Wrong answer. Please try again.";
            //}

            //$('#ddans').html(errMsg);
            //$(elements).prop('checked', false);
        }
        else {
            $('#DragDropModal').modal('show');
            $('#DragDropModal').find('.modal-body').html('<h4>Sorry! <i><img src="../common/img/wrong.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Incorrect answer. Please try again.");

            $(elements).prop('checked', false);
        }
    }
}

function onclickAnswerContinue() {
    disableAll = false;
    $('#AnswerModal').modal('hide');
    Next();
}

function LoadGlossaryFRomXML(xmlFilePath) {
    try {
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        }
        else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.open("GET", xmlFilePath, false);
        xhttp.send();
        if (window.DOMParser) {
            parser = new DOMParser();
            LoadXMLdataToHTML(xhttp.responseXML);
        }
    }
    catch (ex) {
    }
}

function LoadXMLdataToHTML(data) {
    var elements = data.getElementsByTagName("content");
    var htmlTitle = "";
    var htmlData = "";
    for (var contentIndex = 0; contentIndex < elements.length ; contentIndex++) {
        var content = elements[contentIndex];
        var contentName = content.getAttribute("name");
        var contentData = content.getAttribute("content");
        if (contentIndex == 0) {
            htmlTitle += "<p data-value='" + contentIndex + "' class='active'>" + contentName + "</p>";
            htmlData += "<div id='data" + contentIndex + "' ><h3>" + contentName + "</h3>" + contentData + "</div>"
        }
        else {
            htmlTitle += "<p data-value='" + contentIndex + "'>" + contentName + "</p>";
            htmlData += "<div id='data" + contentIndex + "'  style='display:none;'> <h3>" + contentName + "</h3>" + contentData + "</div>"
        }
    }
    $('#GlossaryTitle').html(htmlTitle);
    $('#GlossaryData').html(htmlData);
}

$(document).ready(function () {
    if (document.getElementById("module1")) {
        LoadGlossaryFRomXML("../common/content/glossary.xml");
    }
    else if (document.getElementById("module2")) {
        LoadGlossaryFRomXML("../common/content/glossary.xml");
    }
    else if (document.getElementById("module3")) {
        LoadGlossaryFRomXML("../common/content/glossary3.xml");
    }
    else if (document.getElementById("module4")) {
        LoadGlossaryFRomXML("../common/content/glossary4.xml");
    }
    else if (document.getElementById("module5")) {
        LoadGlossaryFRomXML("../common/content/glossary.xml");
    }
    else if (document.getElementById("module6")) {
        LoadGlossaryFRomXML("../common/content/glossary.xml");
    }

    $("#GlossaryTitle p").click(function () {
        var elements = $(this).parent().find("p");
        for (var index = 0; index < elements.length; index++) {
            elements[index].className = "";
        }
        $(this).attr('class', 'active');

        var Dataelement = $('#GlossaryData').find("div");
        for (var index = 0; index < Dataelement.length; index++) {
            Dataelement[index].style.display = "none";
        }
        document.getElementById("data" + $(this).data("value")).style.display = "";
    });
});

function callImageZoom(ele) {
    var img = $(ele).attr('src');
    var ImgTag = $(ele).parent().parent().parent().parent().parent().parent().parent();

    $(ImgTag).find('.zoomedDiv').show();
    $(ImgTag).find("#imgZoom").find('#zoomShowImg').attr("src", img);

    $(ImgTag).find('.zoomImg').attr("src", img);
    $(ImgTag).find('#imgZoom').attr("class", "zoom");

    $(ImgTag).find(".helper").html("click to zoom in");

    $(ImgTag).find('#imgZoom').zoom({
        on: 'click', onZoomIn: function () {
            $(ImgTag).find(".helper").html("click to zoom out");
            $(ImgTag).find('#imgZoom').css("cursor", " -webkit-zoom-out");
            $(ImgTag).find('#imgZoom').css("cursor", " -moz-zoom-out;");
        }, onZoomOut: function () {
            $(ImgTag).find(".helper").html("click to zoom in");
            $(ImgTag).find('#imgZoom').css("cursor", " -webkit-zoom-in");
            $(ImgTag).find('#imgZoom').css("cursor", " -moz-zoom-in;");
        }
    });
}

function playVid() {
    var myVideo = document.getElementById("VidePlay");
    myVideo.play();
}

function hideBtn() {
    document.getElementById('play_Btn').style.display = 'none';
}

function referncepop() {
    if ($('#PlayListDiv').is(":visible")) {
        $('#PlayListDiv').hide("scale", 1000, function () {
            $('#GlossaryDiv').hide();
            $('#curslide').show();
        });
    }
    else {
        $('#GlossaryDiv').hide("scale", 1000, function () {
            $('#PlayListDiv').hide();
            $('#curslide').show();
        });
    }
}

function onclickAnswerpost(ele) {
    disableAll = false;
    var status = false;
    var answer = 0;
    var flag = false;
    var Node = $(ele).parent().parent().parent();
    var answerText = $(Node).find('#AnswerText').val();
    var elements = $(Node).find('input');
    var checkAns = false;
    var ans = $(Node).find('#Answer').val();
    var score = $(Node).find('#totalscore').val();
    var optionCount = parseInt($(Node).find('#OptionCount').val());
    var userOptCount = 0;

    for (var i = 0; i < elements.length ; i++) {
        if (elements[i].type == 'radio') {
            if (elements[i].checked) {
                answer = elements[i].value;
                flag = true;
                status = true;
            }
        }
        else if (elements[i].type == 'checkbox') {
            if (elements[i].checked) {
                answer += parseInt(elements[i].value);
                userOptCount += 1;
                status = true;
            }
        }
    }
    _gchance++;

    if (!status) {
        alert("select an option");
    }
    else {
        if (parseInt(answer) == parseInt($(Node).find('#Answer').val())) {
            CorrectAnswer += 1;
            g_total[$(Node).find('#Answer').attr('qid')] = parseInt($(Node).find('#Percentage').val());
            var total = 0;
            for (var key in g_total) {
                if (g_total.hasOwnProperty(key)) {
                    total += parseInt(g_total[key]);
                }
            }
            QuestionNumber += 1;
            g_tracker.setQuizResult(data);
            correctanswer();
            _gchance = 0;
            g_totalscore += 20;
            post_test_nxtslide();
        }
        else {
            wronganswer();
            g_totalscore += 0;
            post_test_nxtslide();
        }
    }
}

function correctanswer() {
    $('#viewedframe').modal('show');
    $('#view').html('Correct answer');
}

function wronganswer() {
    $('#viewedframe').modal('show');
    $('#view').html('Incorrect answer');
}

var idleCount = 0;

$(document).ready(function () {

    var html = '<div class="modal" id="sessionAlertModal" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"> \
            <div class="modal-dialog" style="width:700px;"> \
                <div class="modal-content" style="margin-top:40px;"> \
                    <div class="modal-header"> \
                        <h4 class="modal-title" id="myModalLabel">Session Expired</h4> \
                    </div> \
                    <div class="modal-body" id="disclaimer"> \
                      <span>Your session is expired. Please close this window and reopen the Course again</span> \
                    </div> \
                </div> \
            </div> \
        </div>';

    $('body').append(html);
    $('body').attr('onmouseover', 'resetIdleTime()');

    var standalone = window.navigator.standalone;
    var userAgent = window.navigator.userAgent.toLowerCase();
    var safari = /safari/.test(userAgent);
    var ios = navigator.userAgent.match(/iPad/i);

    var isiPadWebApp = false;

    if (ios) {
        if (!standalone && !safari) {
            isiPadWebApp = true;
        }
    }

    if (!isiPadWebApp) {
        window.setInterval(function () {
            idleCount++;
        }, 1000);

        window.setInterval(function () {
            checkIdleTime();
        }, 1000);
    }
});

function resetIdleTime() {
    idleCount = 0;
}

function checkIdleTime() {
    if (idleCount > 1200) {
        $('#sessionAlertModal').modal('show');
    }
}

function openFeedbackLink() {
    var standalone = window.navigator.standalone;
    var userAgent = window.navigator.userAgent.toLowerCase();
    var safari = /safari/.test(userAgent);
    var ios = navigator.userAgent.match(/iPad/i);

    var isiPadWebApp = false;

    if (ios) {
        if (!standalone && !safari) {
            isiPadWebApp = true;
        }
    }

    var link = "http://survey.decipherinc.com/survey/selfserve/53b/1606282";

    if (isiPadWebApp) {
        window.location = "nav://?url?" + link;
    }
    else {
        window.open(link, '_blank');
    }
}
