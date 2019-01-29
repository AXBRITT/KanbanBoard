//functions to handle drag and drop
function allowDrop(event) {
    event.stopPropagation()
    if($(event.target).hasClass("lane-body")){
        event.preventDefault()
    }
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id)
}

function drop(event) {
    event.stopPropagation()
    event.preventDefault()
    var data = event.dataTransfer.getData("text");
    event.target.appendChild(document.getElementById(data));
    var mergeCallback = function(data){
        console.log("Lane Changed");
    };
    MERGE("KanbanBoardProjects",{"Lane": event.target.id }, data, mergeCallback);
}
//function to DELETE a list item from a SharePoint List
function DELETE(listName, itemID, callback){
    var webURL = _spPageContextInfo.webAbsoluteUrl;
    var contextURL = "/_api/contextinfo";
    var listURL = "/_api/web/lists/GetByTitle('" + listName + "')/Items(" + itemID + ")/";
    var fullURL = webURL + contextURL;
    $.ajax({
        url: fullURL,
        type: "POST",
        headers: { "Accept": "application/json;odata=verbose"},
        success: function(context){
            fullURL = webURL + listURL;
            $.ajax({
                url: fullURL,
                type: "POST",
                headers: { "Accept": "application/json;odata=verbose", "X-RequestDigest": context.d.GetContextWebInformation.FormDigestValue, "content-Type": "application/json;odata=verbose", "X-HTTP-Method":"DELETE", "If-Match":"*" },
                success: function(reply){
                    callback(reply);
                },
                error: function(response){
                    console.log("error during POST: " + JSON.stringify(response));
                }
            });
        },
        error: function(response){
            console.log("error getting context: " + JSON.stringify(response));
        }
    });
}
//function to MERGE changes to existing sharepoint items
function MERGE(listName, thisData, itemID, callback){
    var webURL = _spPageContextInfo.webAbsoluteUrl;
    var listTypeURL = "/_api/web/lists/GetByTitle('" + listName + "')/ListItemEntityTypeFullName";
    var contextURL = "/_api/contextinfo";
    var listURL = "/_api/web/lists/GetByTitle('" + listName + "')/Items(" + itemID + ")/";
    var fullURL = webURL + listTypeURL;
    $.ajax({
        url: fullURL,
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        success: function(data){
            var metaData = {
                "__metadata": {
                    "type": data.d.ListItemEntityTypeFullName
                }
            };
            var fullData = $.extend(metaData, thisData);
            fullURL = webURL + contextURL;
            $.ajax({
                url: fullURL,
                type: "POST",
                headers: { "Accept": "application/json;odata=verbose"},
                success: function(context){
                    fullURL = webURL + listURL;
                    $.ajax({
                        url: fullURL,
                        type: "POST",
                        headers: { "Accept": "application/json;odata=verbose", "X-RequestDigest": context.d.GetContextWebInformation.FormDigestValue, "content-Type": "application/json;odata=verbose", "X-HTTP-Method":"MERGE", "If-Match":"*" },
                        data: JSON.stringify(fullData),
                        success: function(reply){
                            callback(reply);
                        },
                        error: function(response){
                            console.log("error during POST: " + JSON.stringify(response));
                        }
                    });
                },
                error: function(response){
                    console.log("error getting context: " + JSON.stringify(response));
                }
            });
        },
        error: function(response){
            console.log("error getting list type: " + JSON.stringify(response));
        }
    });
}
//function to GET data from a sharepoint list
function GET(apiURL, callback){
    var webURL = _spPageContextInfo.webAbsoluteUrl;
    var fullURL = webURL + apiURL;
    var results = [];
    function loadData(){
        $.ajax({
            url: fullURL,
            type: "GET",
            headers: { "Accept": "application/json;odata=verbose" },
            success: function(data){
                if(data.d.results){
                    results = results.concat(results, data.d.results);
                    if(data.d.__next){
                        fullURL = data.d.__next;
                        loadData();
                    }else{
                        callback(results);
                    }
                }else{
                    callback(data.d);
                }
            },
            error: function(response){
                console.log("error: " + JSON.stringify(response));
            }
        });
    }
    loadData();
}
//function to POST new data to a sharepoint list
function POST(listName, thisData, callback){
    var webURL = _spPageContextInfo.webAbsoluteUrl;
    var listTypeURL = "/_api/web/lists/GetByTitle('" + listName + "')/ListItemEntityTypeFullName";
    var contextURL = "/_api/contextinfo";
    var listURL = "/_api/web/lists/GetByTitle('" + listName + "')/Items";
    var fullURL = webURL + listTypeURL;
    $.ajax({
        url: fullURL,
        type: "GET",
        headers: { "Accept": "application/json;odata=verbose" },
        success: function(data){
            var metaData = {
                "__metadata": {
                    "type": data.d.ListItemEntityTypeFullName
                }
            };
            var fullData = $.extend(metaData, thisData);
            fullURL = webURL + contextURL;
            $.ajax({
                url: fullURL,
                type: "POST",
                headers: { "Accept": "application/json;odata=verbose"},
                success: function(context){
                    fullURL = webURL + listURL;
                    $.ajax({
                        url: fullURL,
                        type: "POST",
                        headers: { "Accept": "application/json;odata=verbose", "X-RequestDigest": context.d.GetContextWebInformation.FormDigestValue, "content-Type": "application/json;odata=verbose" },
                        data: JSON.stringify(fullData),
                        success: function(reply){
                            callback(reply);
                        },
                        error: function(response){
                            console.log("error during POST: " + JSON.stringify(response));
                        }
                    });
                },
                error: function(response){
                    console.log("error getting context: " + JSON.stringify(response));
                }
            });
        },
        error: function(response){
            console.log("error getting list type: " + JSON.stringify(response));
        }
    });
}

function showMyProjects(){
    var myID = _spPageContextInfo.userId;
    $(".project").each(function(index,project){
        var personObject = $(project).find(".project-person");
        if ($(personObject).hasClass(myID) && $(project).parent().hasClass("lane-body")){
            //$(project).show();
        }else{
            $(project).hide();
        }
    });
}

function showTheirProjects(PersonID){
    $(".project").each(function(index,project){
        var personObject = $(project).find(".project-person");
        if ($(personObject).hasClass(PersonID) && $(project).parent().hasClass("lane-body")){
            //$(project).show();
        }else{
            $(project).hide();
        }
    });
}

function showDueProjects(){
    $(".project").each(function(index,project){
        var projectTitle = $(project).find(".project-title");
        if($(projectTitle).children(".dueNotifier").length > 0 && $(project).parent().hasClass("lane-body")){
            //$(project).show();
        }else{
            $(project).hide();
        }
    });
}

function showSoonProjects(){
    $(".project").each(function(index,project){
        var projectTitle = $(project).find(".project-title");
        if($(projectTitle).children(".dueNotifier").hasClass("badge-warning") && $(project).parent().hasClass("lane-body")){
            //$(project).show();
        }else{
            $(project).hide();
        }
    });
}

function showLateProjects(){
    $(".project").each(function(index,project){
        var projectTitle = $(project).find(".project-title");
        if($(projectTitle).children(".dueNotifier").hasClass("badge-danger") && $(project).parent().hasClass("lane-body")){
            //$(project).show();
        }else{
            $(project).hide();
        }
    });
}

function showAllProjects(){
    $(".project").each(function(index, project){
        if($(project).parent().hasClass("lane-body")){
            $(project).show();
        }
    });
}

function showAllProjectDetails(){
    $(".project").each(function(index,project){
        var projectBody = $(project).find(".project-body");
        if(!$(projectBody).hasClass("show") && $(project).parent().hasClass("lane-body")){
            $(projectBody).addClass("show");
        }
    });
}

function hideAllProjectDetails(){
    $(".project").each(function(index,project){
        var projectBody = $(project).find(".project-body");
        if($(project).parent().hasClass("lane-body")){
            $(projectBody).removeClass("show");
        }
    });
}

//Code below is to handle all events for the Kanban Board.
$(document).ready(function(){
//Some initial setup and removal of default style choices that are disruptive
    $("head").append('<meta charset="utf-8">');
    $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">');
    $(".ms-rtestate-field").find("br").remove();
    $('.ms-rtestate-field div').each(function(index,element)  {
        var exp = new RegExp(String.fromCharCode(8203),"g");
        var editor= jQuery(element);
        var txt = editor.html();
        txt = txt.replace(exp,'');
        txt = txt.replace(/&nbsp;/g,' ')
        txt = txt.replace(/ {2,}/g,' ');
        editor.html(txt);
    });
    //$(".ms-rtestate-field").removeClass("ms-rtestate-field");

    function LoadEverything(){
//Remove old DOM objects first
        $("#lane-holder").children().remove();

//Load swim lanes and cards on to lane holder by nesting the loading of the cards inside the callback of the loading of the lanes.
        var listLanes = "/_api/web/lists/getbytitle('KanbanBoardLanes')/items";
        var listProjects = "/_api/web/lists/getbytitle('KanbanBoardProjects')/items";
        var listTasks = "/_api/web/lists/getbytitle('KanbanBoardTasks')/items";
        var listCategories = "/_api/web/lists/getbytitle('KanbanBoardCategories')/items";
        var listUsers = "/_api/web/lists/getbytitle('KanbanBoardUsers')/items";
        var callbackLanes = function(data){
            $("#Lane").children().remove();
            for(var i=1; i<data.length+1; i++){
                $.each(data, function(index,datapoint){
                    if(i == datapoint.LaneOrder){
                        $("#lane-holder").append('<div class="lane" id="lane-' + datapoint.Id + '"><div class="lane-header"><h4 class="lane-title text-white">' + datapoint.Title + '</h4></div><div class="lane-body" id="' + datapoint.Title.replace(/\s/g, '_') +'" ondrop="drop(event)" ondragover="allowDrop(event)"></div></div>');
                        $("#Lane").append('<option value="' + datapoint.Title + '">' + datapoint.Title + '</option>');
                    };
                });
            };
            var callbackProjects = function(data){
                $.each(data, function(index,datapoint){
                    if($("#"+datapoint.Lane.replace(/\s/g, '_')).length>0){
                        var thisProject = $(".project-holder").find(".project").clone();
                        thisProject.attr("id",datapoint.ID);
                        thisProject.find(".project-body").prop("id", "body-" + datapoint.ID);
                        thisProject.find(".project-collapse").prop("href", "#body-" + datapoint.ID);
                        thisProject.find(".project-header").addClass("project-" + datapoint.Category.replace(/\s/g, '_'));
                        thisProject.find(".project-title").text(datapoint.Title);
                        thisProject.find(".project-category").text(datapoint.Category);
                        thisProject.find(".project-btn").data("id",datapoint.ID);
                        thisProject.find(".project-person").addClass(datapoint.ResponsiblePersonStringId);
                        thisProject.show();
                        $("#"+datapoint.Lane.replace(/\s/g, '_')).append(thisProject);
                    };
                });
// Load tasks and check if any due soon or overdue
                var callbackTasks = function(data){
                    $(".dueNotifier").remove();
                    var dueSoon = '<span class="badge badge-warning dueNotifier"><i class="fas fa-exclamation-triangle"></i></span>';
                    var duePast = '<span class="badge badge-danger dueNotifier"><i class="fas fa-skull-crossbones"></i></span>';
                    var overdueData = {};
                    $.each(data, function(index,datapoint){
                        if(datapoint.Completed == "false"){
                            if(datapoint.DueDate){
                                var thisDueDate = moment(datapoint.DueDate);
                                var thisWarningDate = moment(datapoint.DueDate).subtract(7,"days");
                                if(moment().isAfter(thisDueDate, "day")){
                                    overdueData[datapoint.Project] = duePast;
                                }else{
                                    if(moment().isAfter(thisWarningDate, "day")){
                                        if(overdueData[datapoint.Project] != duePast){
                                            overdueData[datapoint.Project] = dueSoon;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    $.each(overdueData, function(index, datapoint){
                        $("#" + index).find(".project-title").prepend(datapoint);
                    });
// Load the users into the edit project modal form for a dropdown selection.
                    var callbackUsers = function(data){
                        $("#ResponsiblePersonId").children().remove();
                        $(".people-menu").children().remove();
                        $.each(data, function(index,datapoint){
                            $("#ResponsiblePersonId").append('<option value="' + datapoint.PersonId + '">' + datapoint.Title + '</option>');
                            $(".people-menu").append('<button class="dropdown-item" type="button" onclick="showTheirProjects(' + datapoint.PersonId + ')">' + datapoint.Title + '</button>');
                            var callbackUserHTML = function(html){
                                $("." + datapoint.PersonId).append(html.Person);
                            };
                            var htmlURL = datapoint.FieldValuesAsHtml.__deferred.uri.replace(_spPageContextInfo.webAbsoluteUrl,"");
                            GET(htmlURL, callbackUserHTML);
                        });
                    };
                    GET(listUsers,callbackUsers);
                };
                GET(listTasks, callbackTasks);
            };
            GET(listProjects,callbackProjects);
        };
        GET(listLanes, callbackLanes);

// Load categories into the edit project modal form for dropdown selection.
        var callbackCategories = function(data){
            $("#Category").children().remove();
            $.each(data, function(index, datapoint){
                $("#Category").append('<option value="' + datapoint.Title + '">' + datapoint.Title + '</option>');
                $("head").append('<style>.project-' + datapoint.Title.replace(/\s/g, '_') + '{background-color: ' + datapoint.Colour + ' !important}</style>')
            });
        };
        GET(listCategories, callbackCategories);
    };
    LoadEverything();
//function to add a task to a project
    function taskAdd(addEvent){
        var taskObject = $(".addtask-holder").find(".task").clone();
        taskObject.find(".form-control").each(function(index, formControl){
            $(formControl).prop("required", $(formControl).hasClass("required"));
        });
        taskObject.find(".task-edit").html('<i class="far fa-save"></i>');
        $("#projectTasks").append(taskObject);
        taskObject.find("textarea").on("input",function(){
            var maxlength = $(this).attr("maxlength");
            var currentLength = $(this).val().length;
            $(this).siblings(".input-group-append").find(".countdown").text(maxlength - currentLength);
            if( currentLength >= maxlength ){
                $(this).val($(this).val().substr(0,maxlength));
            }
        });
        taskObject.show();
        taskObject.find(".task-edit").one("click",function(event){
            taskPost(event, taskObject);
        });
        taskObject.find(".task-delete").one("click",function(event){
            taskObject.remove();
        });
    }
//function to change a task already on a project
    function taskChange(changeEvent){
        var btn = $(changeEvent.target);
        var taskID = Number(btn.data("id"));
        var projectID = Number(btn.data("project"));
        var taskObject = $("#task-" + taskID);
        taskObject.find(".countdown").show();
        var taskTitle = taskObject.find(".task-title");
        taskTitle.prop("readonly", false);
        taskTitle.removeClass("form-control-plaintext").addClass("form-control");
        var taskDate = taskObject.find(".task-date");
        taskDate.prop("readonly", false);
        taskDate.removeClass("form-control-plaintext").addClass("form-control");
        btn.html('<i class="far fa-save"></i>');
        btn.one("click", function(e){
            btn.trigger("task.save");
        });
    }
//function to delete a task from a project
    function taskDelete(deleteEvent){
        var btn = $(deleteEvent.target);
        var taskID = Number(btn.data("id"));
        var taskObject = $("#task-" + taskID);
        var callbackDelete = function(data){
            console.log(data);
            taskObject.remove();
        };
        DELETE('KanbanBoardTasks', taskID, callbackDelete);
    }
//function to POST a new task to a SharePoint list
    function taskPost(postEvent, taskObject){
        var btn = $(postEvent.target);
        var taskTitle = taskObject.find(".task-title");
        var taskDate = taskObject.find(".task-date");
        var taskCheck = taskObject.find(".task-complete");
        var taskValid = true;
        taskObject.find(".form-control").each(function(index, formControl){
            if($(formControl).prop("required") && !$(formControl).val()){
                taskValid = false;
            }
        });
        if(taskValid){
            var taskData = {};
            taskData["Title"] = taskTitle.val();
            taskData["Project"] = Number($(".modal-number").text());
            taskData["Completed"] = taskCheck.prop("checked").toString();
            taskData["DueDate"] = moment(taskDate.val()).format("YYYY-MM-DDTHH:mm");
            var postCallback = function(data){
                console.log("New Task Created");
                taskTitle.prop("readonly", true);
                taskTitle.addClass("form-control-plaintext").removeClass("form-control");
                taskDate.prop("readonly",true);
                taskDate.addClass("form-control-plaintext").removeClass("form-control");
                taskObject.attr("id", "task-" + data.d.ID);
                btn.data("id", data.d.ID);
                btn.data("project", data.d.Project);
                btn.html('<i class="far fa-edit"></i>');
                btn.off();
                btn.on("task.edit", function(e){
                    taskChange(e);
                });
                btn.on("task.save", function(e){
                    taskSave(e);
                });
                btn.one("click", function(e){
                    btn.trigger("task.edit");
                });
            };
            POST("KanbanBoardTasks", taskData, postCallback);
        }else{
            alert("Task details are not valid. Please check and try again.");
            btn.off("click");
            btn.one("click", function(event){
                taskPost(event, taskObject);
            });
        }
    }
//function to Save changes to an existing task
    function taskSave(saveEvent){
        var btn = $(saveEvent.target);
        var taskID = Number(btn.data("id"));
        var projectID = Number(btn.data("project"));
        var taskObject = $("#task-" + taskID);
        var taskTitle = taskObject.find(".task-title");
        var taskCheck = taskObject.find(".task-complete");
        var taskDate = taskObject.find(".task-date");
        var taskValid = true;
        taskObject.find(".form-control").each(function(index, formControl){
            if($(formControl).prop("required") && !$(formControl).val()){
                taskValid = false;
            }
        });
        if(taskValid){
            var taskData = {};
            taskData["Title"] = taskTitle.val();
            taskData["Project"] = projectID;
            taskData["Completed"] = taskCheck.prop("checked").toString();
            taskData["DueDate"] = moment(taskDate.val()).format("YYYY-MM-DDThh:mm");
            taskTitle.prop("readonly", true);
            taskTitle.addClass("form-control-plaintext").removeClass("form-control");
            taskDate.prop("readonly",true);
            taskDate.addClass("form-control-plaintext").removeClass("form-control");
            btn.html('<i class="far fa-edit"></i>');
            taskObject.find(".countdown").hide();
            var taskCallback = function(data){
                console.log("Task Data Merged");
            };
            MERGE("KanbanBoardTasks", taskData, taskID, taskCallback);
            btn.off("click");
            btn.one("click", function(event){
                btn.trigger("task.edit");
            });
        }else{
            alert("Task details are not valid. Please check and try again.");
            btn.off("click");
            btn.one("click", function(event){
                btn.trigger("task.save");
            });
        }
    }

// functions to handle modal opening
    $("#edit-project").on('show.bs.modal', function(event){
        var button = $(event.relatedTarget);
        var projectID = Number(button.data("id"));
        var modal = $(this);
        modal.find(".modal-body").prop("novalidate", true);
        modal.find(".modal-body").removeClass("was-validated").addClass("was-validated");
        modal.find(".modal-title").text("Create Project");
        modal.find(".modal-number").text("");
        modal.find("#delete-btn").hide();
        modal.find(".form-control").each(function(index, field){
            field.value = "";
            if($(field).hasClass("required")){
                $(field).prop("required",true);
            }
        });
        $("#projectTasks").children().remove();
        $("#tasksHeader").hide();
        if(projectID > -1){
            $("#tasksHeader").show();
            var projectURL = "/_api/web/lists/getbytitle('KanbanBoardProjects')/Items(" + projectID + ")/";
            var thisProjectCallback = function(data){
                modal.find(".form-control").each(function(index,datapoint){
                    if(data[datapoint.id]){
                        if(~datapoint.id.indexOf("Date")){
                            var thisDate = moment(data[datapoint.id]);
                            $(datapoint).val(thisDate.format("YYYY-MM-DD")).change();
                        }else{
                            $(datapoint).val(data[datapoint.id]).change();
                        }
                    }
                });
            };
            GET(projectURL, thisProjectCallback);
            var tasksURL = "/_api/web/lists/getbytitle('KanbanBoardTasks')/Items";
            var tasksCallback = function(data){
                $.each(data,function(index,datapoint){
                    if(datapoint.Project == projectID){
                        var taskObject = $(".addtask-holder").find(".task").clone();
                            taskObject.show();
                            taskObject.attr("id", "task-" + datapoint.ID);
                        var taskComplete = (datapoint.Completed == "true");
                        var taskCheck = taskObject.find(".task-complete");
                            taskCheck.prop("checked", taskComplete);
                        var taskTitle = taskObject.find(".task-title");
                            taskTitle.val(datapoint.Title);
                            taskTitle.removeClass("form-control").addClass("form-control-plaintext");
                            taskTitle.prop("required", taskTitle.hasClass("required"));
                            taskTitle.prop("readonly", true);
                        var taskDate = taskObject.find(".task-date")
                            taskDate.val(moment(datapoint.DueDate).format("YYYY-MM-DD")).change();
                            taskDate.removeClass("form-control").addClass("form-control-plaintext");
                            taskDate.prop("required", taskDate.hasClass("required"));
                            taskDate.prop("readonly", true);
                        var taskEdit = taskObject.find(".task-edit")
                            taskEdit.data("id",datapoint.ID)
                            taskEdit.data("project", datapoint.Project);
                            taskEdit.off();
                            taskEdit.on("task.edit", function(e){
                                taskChange(e)
                            });
                            taskEdit.on("task.save", function(e){
                                taskSave(e)
                            });
                            taskEdit.one("click", function(e){
                                var button = $(e.target);
                                button.trigger("task.edit");
                            });
                        var taskDeleteBtn = taskObject.find(".task-delete");
                            taskDeleteBtn.data("id", datapoint.ID);
                            taskDeleteBtn.off();
                            taskDeleteBtn.one("click", function(e){
                                taskDelete(e);
                            });
                            taskObject.find("textarea").on("input",function(){
                                var maxlength = $(this).attr("maxlength");
                                var currentLength = $(this).val().length;
                                $(this).siblings(".input-group-append").find(".countdown").text(maxlength - currentLength);
                                if( currentLength >= maxlength ){
                                    $(this).val($(this).val().substr(0,maxlength));
                                }
                            });
                            taskObject.find(".countdown").each(function(index, object){
                                var thisTextArea = $(object).parent().siblings("textarea");
                                var maxlength = thisTextArea.attr("maxlength");
                                var currentLength = thisTextArea.val().length;
                                $(object).text(maxlength - currentLength).hide();
                            });
                        $("#projectTasks").append(taskObject);
                   }
               });
            };
            GET(tasksURL, tasksCallback);
            modal.find(".modal-title").text("Edit Project #");
            modal.find(".modal-number").text(projectID);
            $("#task-add").off();
            $("#task-add").on("click", function(e){
                taskAdd(e);
             });
            $("#delete-btn").show();
            $("#delete-btn").off("click");
            $("#delete-btn").one("click", function(event){
                $("#delete-btn").text("Click again to Delete");
                $("#delete-btn").one("click",function(event){
                    var callbackProjectDelete = function(data){
                        console.log("Project Deleted");
                        modal.modal("hide");
                    };
                    DELETE("KanbanBoardProjects", projectID, callbackProjectDelete);
                });
            });
            $("#save-btn").off("click");
            $("#save-btn").on("click", function(event){
                var formValid = true;
                modal.find(".form-control").add(".form-control-plaintext").each(function(index, formControl){
                    if($(formControl).prop("required") && !$(formControl).val()){
                        formValid = false;
                    }
                });
                if(formValid){
                    var mergeData = {};
                    modal.find(".form-control").each(function(index, field){
                        if(field.id){
                            if(field.value.length>0){
                                if(~field.id.indexOf("Date")){
                                    var tempDate = moment(field.value);
                                    mergeData[field.id] = tempDate.format("YYYY-MM-DDThh:mm");
                                }else{
                                    mergeData[field.id] = field.value;
                                }
                            }else{
                                mergeData[field.id] = null;
                            }
                        }
                    });
                    var mergeCallback = function(data){
                        console.log("Project Updated");
                    };
                    MERGE("KanbanBoardProjects", mergeData, projectID, mergeCallback);
                    modal.find("#projectTasks").children().each(function(index,taskObject){
                        var task = $(taskObject);
                        var button = task.find("button");
                        var taskCallback = function(data){
                            console.log("Task Data Saved");
                        };
                        var taskID = Number(button.data("id"));
                        var taskData = {};
                        taskData["Title"] = task.find(".task-title").val();
                        taskData["Project"] = Number(button.data("project"));
                        taskData["Completed"] = task.find(".task-complete").prop("checked").toString();
                        taskData["DueDate"] = moment(task.find(".task-date").val()).format("YYYY-MM-DDThh:mm");
                        MERGE("KanbanBoardTasks", taskData, taskID, taskCallback);
                    });
                    modal.modal("hide");
                }else{
                    alert("One or more required fields have been missed. Please complete all required fields and try again.");
                }
            });
        }else{
            $("#save-btn").off("click");
            $("#save-btn").on("click", function(event){
                var formValid = true;
                modal.find(".form-control").each(function(index, formControl){
                    if($(formControl).prop("required") && !$(formControl).val()){
                        formValid = false;
                    }
                });
                if(formValid){
                    var postData = {};
                    modal.find(".form-control").each(function(index, field){
                        if(field.id){
                            if(field.value.length>0){
                                if(~field.id.indexOf("Date")){
                                    var tempDate = moment(field.value);
                                    postData[field.id] = tempDate.format("YYYY-MM-DDTHH:mm");
                                }else{
                                    postData[field.id] = field.value;
                                }
                            }else{
                                postData[field.id] = null;
                            }
                        }
                    });
                    var postCallback = function(data){
                        console.log("Project Saved");
                    };
                    POST("KanbanBoardProjects",postData,postCallback);
                    modal.modal("hide");
                }else{
                    alert("One or more required fields have been missed. Please complete all required fields and try again.");
                }
            });
        }
    });
// function to handle modal closing
    $("#edit-project").on('hide.bs.modal', function(event){
        LoadEverything();
    });
});