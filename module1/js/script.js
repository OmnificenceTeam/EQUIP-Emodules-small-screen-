var g_end_slide = "22";
var g_totalSlides = g_end_slide;
var random = new Array();
var slideIndex = new Array();
var coursePlayer = null;
var mySlide = null;
var g_i = 0;
var g_iflag = false;
var g_flag_course = false;

$(document).ready(function () {
    $("#extruderLeft2").buildMbExtruder({
        position: "left",
        width: 200,
        positionFixed: false,
        top: 125,
        extruderOpacity: .8,
        onExtOpen: function () { },
        onExtContentLoad: function () { },
        onExtClose: function () { }
    });
});

function Init() {
    coursePlayer = new CoursePlayer("moduleAudio", new PlayEvents());
    coursePlayer.initialize("module.xml");
    coursePlayer.play();
    coursePlayer.tracker.isAllFramesViewed;
}

function PlayEvents() {

}

PlayEvents.prototype.onAudioFailed = function () {
    alert("Failed to load audio.");
}

function disable_all() {
    //document.getElementById("NxtImg").style.pointerEvents = "none";
    //document.getElementById("PrevImg").style.pointerEvents = "none";
    //document.getElementById("showHelp").style.pointerEvents = "none";
    //document.getElementById("toggelbutton").style.pointerEvents = "none";
    // document.getElementById("PrevImg").style.pointerEvents = "none";
    //document.getElementById("slideCount").style.display = "none";
    // document.getElementById("head_right_side").style.pointerEvents = "none";
    // document.getElementById("trns_script").style.pointerEvents = "none";
}

function loadPostTest() {
    shuffle();
    post_test_nxtslide();
}

function shuffle() {
    for (var i = 0; i < 5;) {
        var x = Math.floor((Math.random() * 10) + 1);
        var flag = true;
        for (var k = 0; k < random.length; k++) {
            if (random[k] == x) {
                flag = false;
            }
        }
        if (flag) {
            random.push(x)
            i++;
        }
    }
}

function post_test_nxtslide() {
    if (g_i == 5) {
        return;
    }

    if (g_i == 4) {
        coursePlayer.LoadbySlide(slideIndex[g_i] + (parseInt(g_totalSlides) + 1));
        g_iflag = true;
        g_i++;
    }

    else if (g_i < 4) {
        coursePlayer.LoadbySlide(slideIndex[g_i] + (parseInt(g_totalSlides) + 1));
        g_flag_course = true;
        g_i++;

    }
    $("#curslide").find("#qID").html(g_i);
}

function onclick_submite(ele) {
    coursePlayer.customonclickAnswerpost(ele);
    coursePlayer.LoadbySlide(60);

    if (g_totalscore >= 80) {
        $("#curslide").find("#total_result").html('Congratulations! You have scored <span style="color:green;">' + g_totalscore + '%</span> and successfully completed the learning module.');
    }
    else {
        $("#curslide").find("#total_result").html('You have scored <span style="color:red;">' + g_totalscore + '%</span>. Request you to go through the learning module once again and re-attempt the post assessment for successful completion. You have to score 80% to complete the course');
    }
    coursePlayer.setCourseStatus();
    scrom_fail();
}


function onclick_finish() {
    g_scromManager.doLMSFinish();
}

function scrom_fail() {
    var a = coursePlayer.tracker.isAllFramesViewed();
    if (g_iflag && g_totalscore <= 80) {

        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "failed");
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", "0");
        g_scromManager.doLMSCommit();
    }
    if (g_iflag && g_totalscore >= 80) {

        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "passed");
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", "0");
        g_scromManager.doLMSCommit();
    }
}

function play() {
    if (!coursePlayer.getPlayerStatus()) {
        document.getElementById("toggelbutton").src = "../../img/pauseBtn.png";
        coursePlayer.play();
        mySlide = coursePlayer.currentSlide.id;
    }
    else {
        document.getElementById("toggelbutton").src = "../../img/playBtn.png";
        coursePlayer.pause();
    }
}

function Next() {
    if (disableAll)
        return;

    transcriptState = true;
    onOpenNClose();
    mySlide = coursePlayer.slideIndex;
    var a = coursePlayer.tracker.isAllFramesViewed();


    if (coursePlayer.nextSlide()) {
        coursePlayer.play();
        mySlide = coursePlayer.slideIndex;
    }

    disableAll = true;
}

function Prev() {
    if (disableAll)
        return;

    transcriptState = true;
    onOpenNClose();
    if (coursePlayer.prevSlide()) {
        coursePlayer.play();
    }

    mySlide = coursePlayer.slideIndex;
    document.getElementById("NxtImg").style.pointerEvents = "initial";
    disableAll = true;
}

$(document).ready(function () {
    $('img').tooltip({ trigger: "disable" });
    initDragDropScript(null);
});

function onclickRadio_question(ele) {
    $(".frame_Question").find("#button").show();
    $(".P_Radio").change(function () {
        $(".P_Radio").prop('checked', false);
        $(this).prop('checked', true);
    });
}



var QuestionID = ["Question1", "Question2", "Question3", "Question4", "Question5","Question6", "Question7", "Question8", "Question9", "Question10", "pretest_score"]
var i_Q = 0;
var i_Qno = 1;
var QuestionID_pst = ["Question1", "Question2", "Question3", "Question4", "Question5", "Question6", "Question7", "Question8", "Question9", "Question10", "pretest_score"]

function Next_Question_psttest() {
    $('#' + QuestionID_pst[i_Q]).css("display", "none");
    i_Q++;
    $('#' + QuestionID_pst[i_Q]).css("display", "block");
    if (QuestionID_pst[i_Q] == "pretest_score") {
        if (g_totalscore >= 80) {
            $("#pretest_score").find("#total_result").html('Congratulations! You have scored <span style="color:white;">' + g_totalscore + '%</span> and successfully completed the learning module.');
        }
        else {
            $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span>. Request you to go through the learning module once again and re-attempt the post assessment for successful completion. You have to score 80% to complete the course');
        }
    }
}

function onclickpretestAnswerContinue() {
    i_Qno++;
    $('#AnswerModal').modal('hide');
    $(".frame_Question").find("#button").hide();
    $("#footer").find("#qqNumber").html(i_Qno)
    Next_Question();
}

function onclickposttestAnswerContinue() {
    i_Qno++;
    $('#AnswerModal').modal('hide');
    $(".frame_Question").find("#button").hide();
    $("#footer").find("#qqNumber").html(i_Qno)
    Next_Question_pst();
}

var current_slide_prtst = 0;
var current_g_totalscore = 0;

var element;
var elementQid;

function nxt_pre_tst(ele) {
    element = $(ele).parents(".frame_Question").attr("id");
    elementQid = $("#" + element).attr('data-qid');
}

function initPreTest() {
    g_scromManager.doLMSInitialize();
    var status = g_scromManager.doLMSGetValue("cmi.core.lesson_status");
    if (status != "completed") {
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "incomplete");
        g_scromManager.doLMSCommit("");
    }
    onloadpretest();
}

function onloadpretest() {
    _gTime = g_scromManager.doLMSGetValue("cmi.core.total_time");
    totalSpendTime = _gTime;
    current_slide_prtst = g_scromManager.doLMSGetValue("cmi.core.lesson_location");
    var i = current_slide_prtst;
    for (var j = 0; j < i; j++) {
        $('#' + QuestionID[j]).css("display", "none");
    }

    if (current_slide_prtst == undefined || current_slide_prtst == i) {
        $('#' + QuestionID[0]).css("display", "block");
    }
    else {
        $('#' + QuestionID[i]).css("display", "block");
    }
}

function onclickAnswer_pretst(ele) {
    var totalQuestions = 10;
    element = $(ele).parents(".frame_Question").attr("id");
    elementQid = $("#" + element).attr('data-qid');
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

    var qNumber = parseInt(ele.getAttribute('qnumber'));

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
            g_totalscore += 10;
            onclickpretestAnswerContinue();
        }

        else {
            g_totalscore += 0;
            onclickpretestAnswerContinue();
        }
    }
    var isLastSlide = false;
    var isFirstSlide = false;

    if (qNumber == 1) {
        isFirstSlide = true;
    }

    if (qNumber == totalQuestions) {
        isLastSlide = true;
    }
    status_update(qNumber, isLastSlide, isFirstSlide, "pre");
}
function onclickAnswer_postst(ele) {
    var totalQuestions = 10;
    element = $(ele).parents(".frame_Question").attr("id");
    elementQid = $("#" + element).attr('data-qid');
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

    var qNumber = parseInt(ele.getAttribute('qnumber'));

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
           // $('#AnswerModal').modal('show');
            //$('#AnswerModal').find('.modal-body').html('<h4 style="font-family:Arial;">Congratulations! <i><img src="../common/img/right.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Correct answer. Please click <strong>continue</strong> to proceed.");
            g_totalscore += 10;
            onclickposttestAnswerContinue();
        }

        else {
            $(ele).attr('disabled', 'disabled');
            //$('#AnswerModal').modal('show');
           // $('#AnswerModal').find('.modal-body').html('<h4 style="font-family:Arial;">Sorry ! <i><img src="../common/img/wrong.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Incorrect answer, Please click <strong>continue</strong> to proceed.");
            g_totalscore += 0;
            onclickposttestAnswerContinue();
        }
    }
    var isLastSlide = false;
    var isFirstSlide = false;

    if (qNumber == 1) {
        isFirstSlide = true;
    }

    if (qNumber == totalQuestions) {
        isLastSlide = true;
    }
    status_update(qNumber, isLastSlide, isFirstSlide, "post");
}

function status_update(slideId, isLastSlide, isFirstSlide, testType) {
    var status = false;
    if (g_totalscore >= 80) {
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "passed");
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", slideId);
        g_scromManager.doLMSSetValue("cmi.core.score.raw", g_totalscore);
        if (testType == "post" && isLastSlide) {
            try {
                g_scromManager.doSendCourseCompletionMail("", g_totalscore);
            }
            catch (e) { }
        }
        g_scromManager.doLMSCommit();
        status = true;
        current_slide_prtst = g_scromManager.doLMSGetValue("cmi.core.lesson_location");
        current_g_totalscore = g_scromManager.doLMSGetValue("cmi.core.score.raw");
    }
    else {
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", "inprogress");
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", slideId);
        g_scromManager.doLMSSetValue("cmi.core.score.raw", g_totalscore);
        g_scromManager.doLMSCommit();
        current_slide_prtst = g_scromManager.doLMSGetValue("cmi.core.lesson_location");
        current_g_totalscore = g_scromManager.doLMSGetValue("cmi.core.score.raw");

    }

    if (isFirstSlide) {
        g_scromManager.doLMSSetValue("cmi.core.lesson_location", "0");
        g_scromManager.doLMSCommit();
    }

    if (isLastSlide) {
        status = (status == false) ? "failed" : "passed";
        g_scromManager.doLMSSetValue("cmi.core.lesson_status", status);
        g_scromManager.doLMSCommit();

    }

    var sessionTime = GetTimeDifference(startTime, new Date());
    if (sessionTime != undefined) {
        SetSessionTime(sessionTime);
        SetTotalTime(sessionTime);
    }
}

function Next_Question() {
    if (element == undefined) {
        $('#' + QuestionID[i_Q]).css("display", "none");
        i_Q++;
        $('#' + QuestionID[i_Q]).css("display", "block");
        if (QuestionID[i_Q] == "pretest_score") {
            $('#num_footer').css("display", "none");
            if (g_totalscore >= 80) {
                $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span> on the pre-module quiz! Kindly go through the learning module.');
            }
            else {
                $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span> on the pre-module quiz! Kindly go through the learning module.');
            }
        }
    }
    else {
        $('#' + QuestionID[elementQid]).css("display", "none");
        elementQid++;
        $('#' + QuestionID[elementQid]).css("display", "block");
        if (QuestionID[elementQid] == "pretest_score") {
            $('#num_footer').css("display", "none");
            if (g_totalscore >= 80) {
                $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span> on the pre-module quiz! Kindly go through the learning module.');
            }
            else {
                $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span> on the pre-module quiz! Kindly go through the learning module.');
            }
        }
    }
}

function Next_Question_pst() {
    if (element == undefined) {
        $('#' + QuestionID_pst[i_Q]).css("display", "none");
        i_Q++;
        $('#' + QuestionID_pst[i_Q]).css("display", "block");
        if (QuestionID_pst[i_Q] == "pretest_score") {
            $('#num_footer').css("display", "none");
            if (g_totalscore >= 80) {
                $("#pretest_score").find("#total_result").html('Congratulations! You have scored <span style="color:white;">' + g_totalscore + '%</span> on the post-module quiz! Kindly provide us with your feedback to complete the learning module.');
            }
            else {
                $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span>. Kindly go through the learning module once again and re-attempt the post-assessment for successful completion. You have to score 80% to complete the course.');
            }
        }
    }
    else {
        $('#' + QuestionID_pst[elementQid]).css("display", "none");
        elementQid++;
        $('#' + QuestionID_pst[elementQid]).css("display", "block");
        if (QuestionID_pst[elementQid] == "pretest_score") {
            $('#num_footer').css("display", "none");
            if (g_totalscore >= 80) {
                $("#pretest_score").find("#total_result").html('Congratulations! You have scored <span style="color:white;">' + g_totalscore + '%</span> on the post-module quiz! Kindly provide us with your feedback to complete the learning module.');
            }
            else {
                $("#pretest_score").find("#total_result").html('You have scored <span style="color:white;">' + g_totalscore + '%</span>. Kindly go through the learning module once again and re-attempt the post-assessment for successful completion. You have to score 80% to complete the course.');
            }
        }
    }
}


function A_Type_Checkbox(ele) {
    onclickRadio(ele);
    $(".P_Radio").change(function () {
        $(".P_Radio").prop('checked', false);
        $(this).prop('checked', true);
    });
}


function Disclaimer_Onload() {

    mySlide = coursePlayer.slideIndex;
    if (mySlide == 0) {
        $('#disclaimer').modal('show');
        coursePlayer.pause();
    }
}


function onClickDisclaimerContinue() {
    $('#disclaimer').modal('hide');
    coursePlayer.LoadbySlide(1);
    coursePlayer.play();
}



function onOpenNClose() {
    var a = $('#curslide').css("display");
    if (a == "none") {
        onclickClosePlaylist();
    }
}

function onClickPdf() {
    coursePlayer.pause();
    window.open('pdf/Transcript.pdf', '_blank');

}

function onloadposttest() {
    $('#posttestdisclaimer').modal('show');
}


function onClickPosttstMdlBtn() {
    $('#posttestdisclaimer').modal('hide');
    initPreTest();
}