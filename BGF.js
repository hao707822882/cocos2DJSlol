//综述:Boom任务类型游戏处理框架

/**
 * Created by Administrator on 2016/8/17.
 *
 *
 * 事件监听核心js
 *
 *
 * 监听事件，封装事件，传递事件
 *
 *
 */

var BGFUtil = {}
BGFUtil.clone = function clone(obj) {
    var o;
    if (typeof obj == "object") {
        if (obj === null) {
            o = null;
        } else {
            if (obj instanceof Array) {
                o = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    o.push(clone(obj[i]));
                }
            } else {
                o = {};
                for (var j in obj) {
                    o[j] = clone(obj[j]);
                }
            }
        }
    } else {
        o = obj;
    }
    return o;
}


/**
 * 事件监听处理区
 * @constructor
 */
function EventManager() {

    this.taskManager = new TaskManager();

    this.receive = function (event) {
        //将event封装成action
        var action = this.eventToAction(event);
        taskManager.receive(action)
        return this;
    }
    this.eventToAction = function (event) {
        //数据转换
        return {"type": "click", date: {x: 100, y: 100}};
    }
}


/**
 * Created by Administrator on 2016/8/17.
 *
 * 任务处理核心js
 *
 * 重置task
 *
 * task正确性比对
 *
 * 各中回调
 *
 * 面向对象
 *
 * @param task  taskManager处理的任务
 * @param checker  clickChecker，moveChecker，focusChecker，NoopChecker
 * @constructor
 */

function TaskManager(task, checker) {
    this.task = task;
    this.doneTask = [];
    this.taskCopy = BGFUtil.clone(task.tasks);

    this.allFinishCallback = function () {
        this.logger.log("default allFinishCallback invoke........")
    }

    this.taskFinishCallback = function (task) {
        this.logger.log("default taskFinishCallback invoke........")
    }

    //设置task finish call back
    this.setTaskFinishCallback = function (fn) {
        this.taskFinishCallback = fn;
        return this;
    }

    //设置task all finish call back
    this.setAllTaskFinishCallback = function (fn) {
        this.allFinishCallback = fn;
        return this;
    }

    //获取任务
    this.getTask = function () {
        return this.taskCopy[0];
    }
    //结束一个任务
    this.finishTask = function (canDelete) {
        var temp
        if (canDelete) {
            //可删除的
            temp = this.taskCopy.shift();
            this.doneTask.push(temp)
            this.taskFinishCallback(temp);
            if (this.doneTask.length == this.task.tasks.length) {
                this.allFinishCallback(this.doneTask)
            }
        }
        this.logger.log(((canDelete ? "Finish" : "unFinish") + " task " + JSON.stringify(temp ? temp : this.taskCopy[0])))
    }

    this.logger = new BGFLogger(task.name);


    this.logger.log("create taskManager for task" + JSON.stringify(task));

    this.checkers = {"move": new MoveChecker(), "click": new ClickChecker(), "noop": new NoopChecker()};

    this.receive = function (action) {
        //action有类型区别
        if (!this.checkers[action.type]) {
            this.logger.log("warring!  task: " + JSON.stringify(action) + "  not found checker and now pass")
            return;
        }
        var task = this.getTask();
        var checkResult = this.checkers[action.type] && this.checkers[action.type].check(action, task)
        this.finishTask(checkResult)
        return this;
    }

    return this;
}

/**
 * 点击检测器
 * @constructor
 */
function ClickChecker() {
    this.check = function (action, task) {
        //进行action与task的比对
        console.log("---Click checker")
        if (action.data.x && action.data.y && task.data.x && task.data.y) {
            //判断范围，这边是直接相等
            return (action.data.x == task.data.x ) && (action.data.y == task.data.y);
        }
        return false;
    }
}


/**
 * 移动检测器
 * @constructor
 */
function MoveChecker() {
    this.check = function (action, task) {
        //进行action与task的比对
        console.log("---Move checker")
        return true;
    }
}

/**
 * 空操作检测器
 * @constructor
 */
function NoopChecker() {
    this.check = function (action, task) {
        //进行action与task的比对
        console.log("---Noop checker")
        return true;
    }
}


function BGFLogger(name) {

    this.name = name;

    this.log = function (data) {
        console.log("BGFLog " + this.name + "-----info-----    " + data);
    }

}


var taskManager = new TaskManager({
    "name": '训练小游戏一',
    tasks: [{"type": "click", data: {x: 100, y: 100}},
        {"type": "click", data: {x: 100, y: 100}}, {
            "type": "click",
            data: {x: 100, y: 100}
        }, {"type": "click", data: {x: 100, y: 100}}]
}).setTaskFinishCallback(function (task) {
        console.log("恭喜你，完成一个任务！")
    }).setAllTaskFinishCallback(function () {
        console.log("恭喜你，都成功啦！")
    }).receive({type: "click", data: {x: 100, y: 100}}).receive({
        type: "click",
        data: {x: 100, y: 100}
    }).receive({type: "click", data: {x: 100, y: 100}})