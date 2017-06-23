
var _gdroppableArray = new Array();
var _gmaxCount = 2;
var _gcorrectAns = new Array();
var _gwrongAns = new Array();
var g_drag_question = null;
var g_question = 0;
var flag_drag = false;

function initDragDropScript(maindiv) {
    g_drag_question = ($('#Question4').find('.droppable').length);
    $(".draggable").draggable({
        start: function (event, ui) {
            if (this.getAttribute("data-x") == undefined) {
                this.setAttribute("data-x", ui.position.top);
            }
        },
        stop: function (event, ui) {
            if (this.getAttribute("data-dropped") == "false" || this.getAttribute("data-dropped") == undefined) {
                this.style.top = this.getAttribute("data-x");
                this.style.left = this.getAttribute("data-y");
            }
        }
    });

    $(".droppable").droppable({
        drop: function (event, ui) {
            var showAnswerFlag = true;
            var lastcorrectAns = false;
            var myslideIndexId = null;
            var totalQuestion = null;
            totalQuestion = ($('#curslide').find('.droppable').length);
            var mySlide = null;
         //   mySlide = coursePlayer.slideIndex;

            /* Check its maximum dropping count */
            if (_gdroppableArray[this.id] == undefined)
                _gdroppableArray[this.id] = 1;
            else if ($(this).css('background-color') === "rgb(0, 128, 0)") {
                return;
            }
            else if (_gdroppableArray[this.id] >= 1) {
                _gdroppableArray[this.id] = _gdroppableArray[this.id] + 1;
            }

            var finaltxt = '';
            var index = _gcorrectAns.indexOf(this.id);
            if (index > -1) { _gcorrectAns.splice(index, 1); }
            var wrongIndex = _gwrongAns.indexOf(this.id);
            if (wrongIndex > -1) { _gwrongAns.splice(wrongIndex, 1); }

            if ((_gcorrectAns.length) == (totalQuestion - 1))
                showAnswerFlag = false;
            if (mySlide <= g_end_slide) {
                if (this.id == ui.helper[0].getAttribute("data-ans")) {
                    this.style.backgroundImage = "url('../common/img/options.png')";
                    this.innerHTML = ui.helper[0].innerHTML;
                    this.style.backgroundColor = "green";
                    this.style.textIndent = "0px";
                    _gcorrectAns.push(this.id);
                    var number = parseInt(ui.helper[0].getAttribute("data-marks"));
                    finaltxt = '<h4>Congratulations! <i><img src="../common/img/right.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Correct answer";
                    if ((_gcorrectAns.length) == (totalQuestion)) {
                        lastcorrectAns = true;
                        showAnswerFlag = false;
                    }
                    if (showAnswerFlag) {
                        $('#DragDropModal').modal('show');
                        $('#ddans').html('<h4>Congratulations! <i><img src="../common/img/right.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Correct answer. Please click <strong>continue</strong> to proceed.");
                    }

                    g_totalscore += number;
                    flag_drag = true;
                }
                else {
                    this.style.backgroundImage = "url('../common/img/options.png')";
                    this.innerHTML = ui.helper[0].innerHTML;
                    this.style.backgroundColor = "red";
                    this.style.textIndent = "0px";
                    _gwrongAns.push(this.id);
                    finaltxt = '<h4>Sorry ! <i><img src="../common/img/wrong.png" style="color:#00718e; width:24px; height:24px; margin-top:-6px;" /></i></h4> ' + "Wrong answer, the correct answer is '" + $('div[data-ans="' + this.id + '"]').html();
                    if (showAnswerFlag || !showAnswerFlag) {
                        if (_gdroppableArray[this.id] < 2) {
                            $('#DragDropModal').modal('show');
                            $('#ddans').html('Wrong answer. Please try again.');
                        }
                        else {
                            $('#DragDropModal').modal('show');
                            $('#ddans').html('Wrong answer. Please try again.');
                        }
                    }

                    g_totalscore += 0;
                    flag_drag = false;
                }

                if (totalQuestion == (_gcorrectAns.length) && ((_gdroppableArray[this.id] >= _gmaxCount) || lastcorrectAns)) {
                    /* Re-initialize */
                  //  $('#AnswerModal').modal('show');
                   // $('#AnswerModal').find('.modal-body').html(finaltxt + '. Please click <strong>continue</strong> to next slide.');
                    _gdroppableArray = new Array();
                    _gcorrectAns = new Array();
                    _gwrongAns = new Array();
                    return;
                }
            }
            else {
                if (_gdroppableArray[this.id] > 1) {
                    $('#viewedframe').modal('show');
                    $('#view').html('Sorry, only one attempt is permitted');
                    return;
                }

                var number = parseInt(ui.helper[0].getAttribute("data-marks"));
                if (this.id == ui.helper[0].getAttribute("data-ans")) {
                    this.innerHTML = ui.helper[0].innerHTML;
                    this.style.textIndent = "0px";
                    g_totalscore += number;
                    _gcorrectAns.push(this.id);
                   
                }
                else {
                    g_totalscore += 0;
                    this.innerHTML = ui.helper[0].innerHTML;
                    this.style.textIndent = "0px";
                    _gwrongAns.push(this.id);
                   
                }

                if (totalQuestion == (_gcorrectAns.length) && ((_gdroppableArray[this.id] >= _gmaxCount) || lastcorrectAns)) {
                    /* Re-initialize */
                    _gdroppableArray = new Array();
                    _gcorrectAns = new Array();
                    _gwrongAns = new Array();
                    return;
                }
            }

            g_drag_question--;

            if (g_drag_question <= 0) {
			
                $('#Question4').find("#button").show();
            }

        },
        out: function (event, ui) {
            this.setAttribute("data-accept", true);
            ui.helper[0].setAttribute("data-dropped", false);
        }
    });
}


