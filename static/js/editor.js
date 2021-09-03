var canvas;
var blocks = {};
var blockSize = 100;
var counter = 0;

var trigger_types = {
    rss: {
        name: "RSS Update",
        inputs: {
            'url': {
                name: "RSS Feed URL",
                type: "url"
            }
        },
        outputs: [
            'url', 'title', 'text', 'time'
        ]
    },
    time: {
        name: "Time Event",
        inputs: {
            'time': {
                name: "Trigger Time",
                type: "datetime"
            }
        },
        outputs: [
            'time'
        ]
    },
    twitter: {
        name: "New Tweet",
        inputs: {
            "handle": {
                name: "Twitter Handle",
                type: "text"
            }
        },
        outputs: [
            "handle", "body", "date"
        ]
    }
};

var event_types = {
    sms: {
        name: "Send SMS",
        inputs: {
            'phone': {
                name: "Phone Number",
                type: "phone"
            },
            'message': {
                name: "Text Message",
                type: "text"
            }
        },
        outputs: [
        ]
    },
    email: {
        name: "Send Email",
        inputs: {
            'address': {
                name: "Email Address",
                type: "email"
            },
            'subject': {
                name: "Email Subject",
                type: "text"
            },
            'message': {
                name: "Email Message",
                type: "text"
            }
        },
        outputs: []
    }
};

var conditional_types = {
    'if': {
        name: "IF",
        inputs: {
            'left': {
                name: "Left Side",
                type: "text"
            }, 'operation': {
                name: "Operation",
                type: "operation"
            }, 'right': {
                name: "Right Side",
                type: "text"
            }
        },
        outputs: [
            'boolean'
        ]
    },
    "for": {
        name: "FOR",
        inputs: {
            "iterations": {
                name: "Iterations",
                type: "number"
            }
        },
        outputs: []
    },
    "stop": {
        name: "STOP",
        inputs: {},
        outputs: []
    }
};

var type_lookup = {
    "trigger": trigger_types,
    "event": event_types,
    "conditional": conditional_types
};

var if_operations = [
    {'eq': 'equals'}, {'ne': 'not equals'}, {'in': "in"}, {'gt': "is greater than"}, {'lt': "is less than"}
];

var colors = {
    "conditional": { // orange
        fg: "#FF9800",
        bg: "#F57C00"
    },
    "trigger": { // red
        fg: "#F44336",
        bg: "#D32F2F"
    },
    "event": { // blue
        fg: "#2196F3",
        bg: "#1976D2"
    },
    "none": { // green
        fg: "#4CAF50",
        bg: "#388E3C"
    }
};

function genOptionString(block, gen_type, type) {
    var type_var = null;
    switch(gen_type) {
        case 'conditional':
            type_var = conditional_types;
            break;
        case 'trigger':
            type_var = trigger_types;
            break;
        case 'event':
            type_var = event_types;
            break;
    }
    if(!type_var) {
        return "<option value='null'>Bad genOptionString arguments</option>"
    }
    var ret = "";
    type_var[type].outputs.forEach(function(output) {
        ret += "<option value='"+output+"'>"+block.name + ":" +output+"</option>";
    });
    return ret;
}

function openInformation(block) {
    var $bod = $("#conditional-modal .modal-body");
    $bod.html("");
    var current_types = event_types;
    if (block.automate_general_type == "trigger") {
        current_types = trigger_types;
    }
    if (block.automate_general_type == "conditional") {
        current_types = conditional_types;
    }
    if(block.automate_general_type == "trigger" || block.automate_general_type == "event") {
        $("#conditional-modal .modal-body").html("");
        $.each(current_types[block.automate_type].inputs, function(input, details) {
            curr_val = "";
            if(block.inputs[input]) curr_val = block.inputs[input];
            var item = $('<div class="form-group"><div class="input-group"><input id="id_' + input + '" name="' + input + '" type="text" class="form-control" placeholder="' + details.name + '" value="' + curr_val + '" /></div></div>');
            $("#conditional-modal .modal-body").append(item);
        });
        $(".save-modal").attr("data-id", block.id);
    } else if(block.automate_general_type == "conditional") {
        if (block.automate_type == "if") {
            $op1 = $bod.append("<div class='operand1 form-group'><input type='text' placeholder='Operand 1' class='form-control'></div>").find(".operand1 input");
            $oper = $bod.append("<div class='operation form-group'><select class='form-control'></select></div>").find(".operation select");
            $op2 = $bod.append("<div class='operand2 form-group'><input type='text' placeholder='Operand 2' class='form-control'></div>").find(".operand2 input");
            /* Used for drop downs
            var append = function(blk) {
                blk.connectionsFrom.forEach(function(from) {
                    append(from);
                });
                $op1.append(genOptionString(blk, blk.automate_general_type, blk.automate_type));
                $op2.append(genOptionString(blk, blk.automate_general_type, blk.automate_type));
            };
            $other = "<option value='other'>Other</option>"
            block.connectionsFrom.forEach(function(from) {
                append(from);
            });
            */
            if_operations.forEach(function(oper) {
                Object.keys(oper).forEach(function(op) {
                    $oper.append("<option value='" + op + "'>" + oper[op] + "</option>");
                });
            });
            $op1.val(block.inputs["left"]);
            $oper.val(block.inputs["operation"]);
            $op2.val(block.inputs["right"]);
        }
        else {
            $("#conditional-modal .modal-body").html("");
            $.each(current_types[block.automate_type].inputs, function(input, details) {
                curr_val = "";
                if(block.inputs[input]) curr_val = block.inputs[input];
                var item = $('<div class="form-group"><div class="input-group"><input id="id_' + input + '" name="' + input + '" type="text" class="form-control" placeholder="' + details.name + '" value="' + curr_val + '" /></div></div>');
                $("#conditional-modal .modal-body").append(item);
            });
        }
        $(".save-modal").attr("data-id", block.id);
    }
    $("#conditional-modal").modal();
    $("#conditional-modal .save-modal").off("click").click(function(){
        block = blocks[$(this).attr("data-id")];
        Object.keys(current_types[block.automate_type].inputs).forEach(function(input) {
            block.inputs[input] = $("#id_" + input).val();
        });
        block.inputs["left"] = $bod.find('.operand1 input').val();
        block.inputs["operation"] = $bod.find('.operation select').val();
        block.inputs["right"] = $bod.find('.operand2 input').val();
        $("#conditional-modal").modal("hide");
    });
};

function addBlock(name, type, noOffset, displayName) {
    displayName = displayName || type_lookup[type][name].name;
    var rect = new fabric.Rect({
        fill: colors[type || "none"].fg,
        width: blockSize,
        height: blockSize
    });
    rect.stroke = colors[type || "none"].bg;
    rect.strokeWidth = 1;
    var text = new fabric.Text(displayName, {
        left: blockSize / 2,
        top: blockSize / 2,
        fontSize: 16,
        textAlign: "center",
        originX: "center",
        originY: "center",
        fontFamily: "sans-serif"
    });
    var block = new fabric.Group([rect, text], {
        left: $(window).width() / 2 - blockSize / 2 + (!noOffset ? Object.keys(blocks).length * 6 : 0),
        top: $(window).height() / 2 - blockSize / 2 - $("nav").height() + (!noOffset ? Object.keys(blocks).length * 6 : 0),
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true
    });
    block.type = "block";
    block.automate_general_type = type;
    block.automate_type = name;
    block.id = counter;
    counter++;
    block.name = name;
    block.inputs = {}
    block.connections = [];
    block.connectionsTo = [];
    block.connectionsFrom = [];
    block.mouseDownCoordinates = null;
    block.on('mousedown', function(e) {
        if($("#default.active").length)
            block.mouseDownCoordinates = [e.e.clientX, e.e.clientY];
    });
    block.on('mouseup', function(e) {
        c = block.mouseDownCoordinates;
        if(c == null) {
            return;
        }
        if((e.e.clientX - c[0])**2 + (e.e.clientY - c[1])**2 == 0) {
            openInformation(block);
        }
        block.mouseDownCoordinates = null;
    });
    block.setControlsVisibility({"mtr": false});
    canvas.add(block);
    blocks[block.id] = block;
    return block;
}

function connectBlocks(a, b) {
    if (a == b) {
        return null;
    }
    var flag = false;
    $.each(a.connections, function(k, v) {
        if (v.from == b || v.to == b) {
            flag = true;
            return false;
        }
    });
    if (flag) {
        return null;
    }
    var line = new fabric.Line([0, 0, 1, 1], {
        stroke: "red",
        strokeWidth: 2,
        originX: "left",
        originY: "top"
    });
    line.type = "line";
    var triangle = new fabric.Triangle({
        angle: 0,
        fill: "red",
        top: 0,
        left: 0,
        height: 25,
        width: 25,
        originX: "center",
        originY: "center",
        selectable: false
    });
    line.triangle = triangle;
    line.from = a;
    line.to = b;
    a.connectionsTo.push(b);
    b.connectionsFrom.push(a);
    a.connections.push(line);
    b.connections.push(line);
    recalculateConnection(line);
    canvas.add(line);
    canvas.add(triangle);
    return line;
}

function serialize() {
    var starting_block = null;
    $.each(blocks, function(k, v) {
        if (v.automate_general_type == "trigger") {
            starting_block = v;
            return false;
        }
    });
    if (!starting_block) {
        return false;
    }
    return recur_serialize(starting_block);
}

var offset = blockSize + 25;

function recur_load(p, i, oX, oY) {
    var SoX = oX;
    var last = p;
    $.each(i.outer, function(k, v) {
        if (v.inner || v.outer) {
            recur_load(last, v, oX, oY);
        }
        else {
            var b = addBlock(v.name, v.type, true);
            b.inputs = v.values;
            b.left += oX * offset;
            b.top += oY * offset;
            oX++;
            connectBlocks(last, b);
            last = b;
        }
    });
    oY++;
    SoX--;
    last = p;
    $.each(i.inner, function(k, v) {
        if (v.inner || v.outer) {
            recur_load(last, v, SoX + 1, oY);
        }
        else {
            var b = addBlock(v.name, v.type, true);
            b.inputs = v.values;
            b.left += SoX * offset;
            b.top += oY * offset;
            oX++;
            connectBlocks(last, b);
            last = b;
        }
    });
}

function load(pgrm) {
    canvas.clear();
    blocks = {};
    var oX = 0;
    var oY = 0;
    var last = false;
    $.each(pgrm, function(k, v) {
        var b = addBlock(v.name, v.type, true);
        b.inputs = v.values;
        b.left += oX * offset;
        oX++;
        if (last) {
            connectBlocks(last, b);
        }
        last = b;
        if (v.inner || v.outer) {
            recur_load(last, v, oX, oY);
        }
    });
    canvas.renderAll();
    canvas.calcOffset();
}

function serialize_and_save() {
    var flag = false;
    $.each(blocks, function(k, v) {
        var current = Object.keys(v.inputs).length;
        var required = Object.keys(type_lookup[v.automate_general_type][v.name].inputs).length;
        if (current < required) {
            flag = true;
            return false;
        }
    });
    if (flag) {
        Messenger().error("You must enter required parameters for all blocks!");
        return;
    }
    var out = serialize();
    if (out) {
        $.post(save_endpoint, { program: JSON.stringify(out), name: $("#name").val() }, function(data) {
            Messenger().success("Program saved!");
        });
    }
    else {
        Messenger().error("Invalid program! You must have a trigger.");
    }
}

function block_serialize(b) {
    return { id: b.id, name: b.name, type: b.automate_general_type, values: b.inputs };
}

function recur_serialize(b) {
    var out = [];
    var next = b;
    var prev = b;
    while (true) {
        if (next.automate_general_type == "conditional") {
            out.push({ name: next.name, type: "conditional", inner: recur_serialize(next.connectionsTo[0]), outer: recur_serialize(next.connectionsTo[1]), values: next.inputs });
            break;
        }
        prev = next;
        out.push(block_serialize(next));
        next = next.connectionsTo;
        if (!next.length) {
            break;
        }
        next = next[0];
    }
    return out;
}

function recalculateConnection(v) {
    var angle = Math.atan2(v.from.top - v.to.top, v.to.left - v.from.left)*180/Math.PI;
    var fPos = "bottom";
    var tPos = "top";
    if (angle >= -45 && angle <= 45) {
        fPos = "right";
        tPos = "left";
    }
    else if (angle > 0 && angle <= 135) {
        fPos = "top";
        tPos = "bottom";
    }
    else if (Math.abs(angle) > 135) {
        fPos = "left";
        tPos = "right";
    }
    v.left = v.from.left + v.from.width / 2;
    v.top = v.from.top + v.from.height / 2;
    v.width = (v.to.left + v.to.width / 2) - v.left;
    v.set("flipX", v.width < 0);
    if (fPos == "left") {
        v.left += blockSize / 2;
    }
    if (fPos == "right") {
        v.left += blockSize / 2;
    }
    if (fPos == "top") {
        v.top -= blockSize / 2;
    }
    if (fPos == "bottom") {
        v.top += blockSize / 2;
    }
    v.triangle.left = v.left + v.width;
    if (tPos == "left") {
        v.triangle.left -= blockSize;
    }
    if (v.width < 0) {
        v.left += v.width;
    }
    v.width = Math.abs(v.width);
    v.height = (v.to.top + v.to.height / 2) - v.top;
    v.set("flipY", v.height < 0);
    if (tPos == "left") {
        v.width -= blockSize;
    }
    if (tPos == "right") {
        v.width -= blockSize;
    }
    if (tPos == "top") {
        v.height -= blockSize / 2;
    }
    if (tPos == "bottom") {
        v.height += blockSize / 2;
    }
    v.triangle.top = v.top + v.height;
    if (v.height < 0) {
        v.top += v.height;
    }
    v.height = Math.abs(v.height);
    v.triangle.angle = 90 - angle;
}

$(document).ready(function() {
    canvas = new fabric.Canvas("editor", { preserveObjectStacking: true });
    canvas.on("object:moving", function(e) {
        if (e.target.type == "block") {
            $.each(e.target.connections, function(k, v) {
                recalculateConnection(v);
            });
        }
    });
    var lastClick = null;
    var prevBlock = null;
    canvas.on("mouse:down", function(e) {
        lastClick = new Date();
    });
    canvas.on("mouse:up", function(e) {
        if (lastClick) {
            var time = new Date().getTime() - lastClick.getTime();
            if (time < 100) {
                var obj = canvas.getActiveObject();
                if (obj && obj.type == "block" && $("#arrow.active").length) {
                    if (prevBlock) {
                        connectBlocks(prevBlock, obj);
                        prevBlock = null;
                    }
                    else {
                        prevBlock = obj;
                    }
                }
                else if ($("#delete.active").length) {
                    deleteSelected();
                }
            }
        }
    });
    canvas.on("object:removed", function(e) {
        if (e.target.type == "block") {
            $.each(e.target.connections, function(k, v) {
                try {
                    canvas.remove(v);
                }
                finally {
                    if (v) {
                        v.from.connections.splice(v.from.connections.indexOf(v), 1);
                        v.to.connections.splice(v.to.connections.indexOf(v), 1);
                        v.from.connectionsTo.splice(v.from.connectionsTo.indexOf(v), 1);
                        v.to.connectionsFrom.splice(v.to.connectionsFrom.indexOf(v), 1);
                    }
                }
            });
            canvas.deactivateAll();
        }
        if (e.target.type == "line") {
            try {
                var fi = e.target.from.connections.indexOf(e.target);
                if (fi != -1) {
                    e.target.from.connections.splice(fi, 1);
                }
                fi = e.target.from.connectionsTo.indexOf(e.target);
                if (fi != -1) {
                    e.target.from.connectionsTo.splice(fi, 1);
                }
                var ti = e.target.to.connections.indexOf(e.target);
                if (ti != -1) {
                    e.target.to.connections.splice(ti, 1);
                }
                ti = e.target.to.connectionsFrom.indexOf(e.target);
                if (ti != -1) {
                    e.target.to.connectionsFrom.splice(ti, 1);
                }
            }
            finally {
                canvas.remove(e.target.triangle);
            }
        }
    });
    $(window).on("resize", function() {
        var width = window.innerWidth;
        var height = window.innerHeight - $("nav").height();
        $("#content").css("width", width + "px").css("height", height + "px");
        canvas.setWidth(width);
        canvas.setHeight(height);
    });
    function deleteSelected() {
        var group = canvas.getActiveGroup();
        if (group) {
            $.each(group._objects, function(k, v) {
                if (v.type == "block") {
                    try {
                        canvas.remove(v);
                        $.each(v.connections, function(kt, vt) {
                            try {
                                canvas.remove(vt);
                            } catch (e) {  }
                        });
                    }
                    catch (e) { }
                    delete blocks[v.id];
                }
                if (v.type == "line") {
                    canvas.remove(v);
                }
            });
        }
        else {
            var obj = canvas.getActiveObject();
            canvas.remove(obj);
            if (obj.type == "block") {
                delete blocks[obj.id];
            }
        }
        try {
            $("#conditional-modal").modal("hide");
        }
        catch (e) {}
    }
    $(window).on("keydown", function(e) {
        if (e.keyCode == 46) {
            deleteSelected();
        }
        if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            serialize_and_save();
        }
    });
    $(window).resize();

    type_div_map = {
        "#triggers": trigger_types,
        "#events": event_types,
        "#conditionals": conditional_types
    };

    Object.keys(type_div_map).forEach(function(key) {
        types = Object.keys(type_div_map[key]);
        types.forEach(function(t) {
            $(key).append("<div class='" + t + "'>" + type_div_map[key][t].name + "</div>");
        });
    });

    $("#triggers div").each(function(i,el) {
        el.onclick = function() {
            addBlock(el.className, "trigger", false, el.innerHTML);
        };
    });
    $("#events div").each(function(i,el) {
        el.onclick = function() {
            addBlock(el.className, "event", false, el.innerHTML);
        };
    });
    $("#conditionals div").each(function(i,el) {
        el.onclick = function() {
            addBlock(el.className, "conditional", false, el.innerHTML);
        };
    });
    $(".tool").click(function(e) {
        e.preventDefault();
        if ($(this).attr("id") == "filter") {
            var a = serialize();
            if (a) {
                load(a);
            }
            else {
                Messenger().error("You have an invalid program! Make sure you have a trigger block.");
            }
        }
        else {
            $(".tool").removeClass("active");
            $(this).addClass("active");
        }
    });

    $("#picker-close").click(function(el) {
        $("#picker").toggleClass("closed");
    });

    $("#save").click(function(e) {
        e.preventDefault();
        serialize_and_save();
    });
    $("canvas").mousedown(startPan);
    function startPan(event) {
        if (event.button != 2) {
            return;
        }
        var x0 = event.screenX,
        y0 = event.screenY;
        function continuePan(event) {
            var x = event.screenX,
            y = event.screenY;
            canvas.relativePan({ x: x - x0, y: y - y0 });
            x0 = x;
            y0 = y;
        }
        function stopPan(event) {
            $(window).off('mousemove', continuePan);
            $(window).off('mouseup', stopPan);
        };
        $(window).mousemove(continuePan);
        $(window).mouseup(stopPan);
        $(window).contextmenu(cancelMenu);
    };
    function cancelMenu() {
        $(window).off('contextmenu', cancelMenu);
        return false;
    }
    $("#conditional-modal .modal-body").on("keydown", "input", function(e) {
        if (e.keyCode == 13) {
            $("#conditional-modal .save-modal").click();
        }
    });

    if (program_save) {
        try {
            load(JSON.parse(program_save));
        }
        catch (e) {
            Messenger().error("Failed to load existing program!");
        }
    }
});
