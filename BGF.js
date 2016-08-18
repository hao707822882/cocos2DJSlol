//综述:Boom任务类型游戏处理框架


//目前支持游戏的初级和高级
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


BGFUtil.keyMap = {"Q": 81, "W": 87, "E": 69, "R": 82};

/**
 * 事件监听处理区
 * @constructor
 */
function EventManager(taskManager) {

    this.taskManager = taskManager;

    this.receive = function (event) {
        //将event封装成action
        var action = this.eventToAction(event);
        this.taskManager.receive(action)
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
    this.finish = false;
    this.task = task;
    this.doneTask = [];
    this.taskCopy = BGFUtil.clone(task.tasks);


    //获取游戏难度，如果task，没有设置那么为普通模式，如果设置了，那么为严格模式
    this.getGameMode = function () {
        return this.task.mode ? this.task.mode : 0;
    }

    this.allFinishCallback = function () {
        this.logger.log("default allFinishCallback invoke........")
    }

    this.taskFinishCallback = function (task) {
        this.logger.log("default taskFinishCallback invoke........")
    }

    this.failCallback = function () {
        this.logger.log("default failCallback invoke........")
    }

    this.timeUseCallback = function (useTime) {
        this.logger.log("use........." + useTime)
    }

    this.setTimeUseCallback = function (fn) {
        this.timeUseCallback = fn
        return this;
    }

    this.fail = function (reason, task, action) {
        this.finish = true;
        console.trace()
        console.log(JSON.stringify(task) + JSON.stringify(action))
        this.failCallback(reason, task, action);
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

    //设置fail call back
    this.setFailCallback = function (fn) {
        this.failCallback = fn;
        return this;
    }

    //获取任务
    this.getTask = function () {
        return this.taskCopy[0];
    }


    //创建点击任务
    this.createClick = function (x, y) {
        return {
            type: "click",
            data: {x: x, y: y}
        }
    }

    //创建noop beat任务
    this.createNoopBeat = function (startTime) {
        return {
            type: "noop",
            data: {before: null, now: (new Date()).getTime(), begin: startTime, type: "beat"}
        }
    }
    //创建noop action任务
    this.createNoopAction = function (before, startTime) {
        return {
            type: "noop",
            data: {before: before, now: (new Date()).getTime(), begin: startTime, type: "action"}
        }
    }
    //键盘事件
    this.createKey = function (key) {
        return {
            type: "key",
            data: {key: key}
        }
    }


    //结束一个任务
    this.finishTask = function (canDelete) {
        if (this.finish) {
            //如果当前已经结束，就不需要处理了
            return;
        }
        var temp
        if (canDelete) {
            console.trace();
            this.logger.log("now left task " + JSON.stringify(this.taskCopy))
            //可删除的
            temp = this.taskCopy.shift();
            this.logger.log("now left task " + JSON.stringify(this.taskCopy))
            this.doneTask.push(temp)
            this.taskFinishCallback(temp);
            this.logger.log("has done " + JSON.stringify(this.doneTask) + " left " + JSON.stringify(this.taskCopy))
            if (this.doneTask.length == this.task.tasks.length) {
                this.allFinishCallback(this.doneTask)
                this.finish = true;
            }
        }
        this.logger.log(((canDelete ? "Finish" : "unFinish") + " task " + JSON.stringify(temp ? temp : this.taskCopy[0])))
    }

    this.logger = new BGFLogger(task.name);


    this.logger.log("create taskManager for task" + JSON.stringify(task));

    this.checkers = {
        "move": new MoveChecker(),
        "click": new ClickChecker(),
        "noop": new NoopChecker(),
        "key": new KeyChecker()
    };

    this.receive = function (action) {
        console.trace();
        //action有类型区别
        if (!this.checkers[action.type]) {
            this.logger.log("warring!  task: " + JSON.stringify(action) + "  not found checker and now pass")
            return;
        }
        var task = this.getTask();
        var checkResult = this.checkers[action.type] && this.checkers[action.type].check(action, task, this, this.task)
        if (checkResult) {
            this.logger.log("receive action" + JSON.stringify(action));
        }
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

    this.logger = new BGFLogger("ClickChecker");

    this.square = function (num) {
        return num * num;
    }

    this.check = function (action, task, taskManager) {

        if (taskManager.finish) {
            this.logger.log("task has finish and noop loop break");
            return;
        }

        //对类型进行检测
        if (task.type != action.type) {
            if (taskManager.getGameMode()) {//如果是在严格模式下
                taskManager.fail("按键错误！", task, action)
            }
            return false;
        }


        //进行action与task的比对
        if (!task.data.r) {
            task.data.r = 10;
        }
        if (task.data.r) {
            //计算距离
            var dis = Math.sqrt(this.square(action.data.x - task.data.x) + this.square(action.data.y - task.data.y))
            if (dis < task.data.r) {
                return true;
            } else {
                if (taskManager.getGameMode()) {
                    taskManager.fail("点击位置错误", task, action);
                    return false;
                } else {
                    return false;
                }
            }
        }

        console.log("---Click checker")
        if (action.data.x && action.data.y && task.data.x && task.data.y) {
            //判断范围，这边是直接相等
            return (action.data.x == task.data.x ) && (action.data.y == task.data.y);
        }
        return false;
    }
}


/**
 * 按键检测器
 * @constructor
 */
function KeyChecker() {
    this.logger = new BGFLogger("KeyChecker");


    this.check = function (action, task, taskManager) {

        if (taskManager.finish) {
            this.logger.log("task has finish and noop loop break");
            return;
        }

        //80/81/82/83
        var actionKey = action.data.key;
        var taskKey = BGFUtil.keyMap[task.data.key]
        if (taskManager.getGameMode()) {//严格模式
            if (task.type != action.type) {//类型不匹配
                taskManager.fail("按键错误！", task, action)
                return false;
            } else {
                if (actionKey == taskKey) {
                    return true;
                } else {
                    taskManager.fail("按键错误！", task, action)
                    return false;
                }
            }
        } else {
            if (actionKey == taskKey) {
                return true;
            } else {
                return false;
            }
        }
    }
}

/**
 * 移动检测器
 * @constructor
 */
function MoveChecker() {

    this.logger = new BGFLogger("MoveChecker");

    //
    this.check = function (action, task, taskManager) {
        //进行action与task的比对
        console.log("---Move checker")
        return true;
    }
}

/**
 * 空操作检测器
 *
 * 空操作分类型：beat，时间监测的监测
 *               action，事件之后触发的，任务相关
 *
 * @constructor
 */
function NoopChecker() {

    this.logger = new BGFLogger("NoopChecker");

    this.check = function (action, task, taskManager, taskOrigin) {

        if (taskManager.finish) {
            this.logger.log("task has finish and noop loop break");
            return;
        }

        //对类型进行检测
        if (action.data.type == "action") {
            //不是action的，不执行，但是不会错误
            if (task.type != action.type) {
                return false;
            }

            var howLong = action.data.now - action.data.before
            if (howLong / 1000 > task.data.continue) {
                taskManager.fail("操作超时，失败！", task, action)
                return false;
            } else {
                return true;
            }
        } else if (action.data.type == "beat") {
            var howLong = action.data.now - action.data.begin
            taskManager.timeUseCallback(howLong);
            if (howLong / 1000 > taskOrigin.continue) {
                taskManager.fail("总时长超时，失败！", task, action)
                return false;
            } else {
                return false;
            }
        }
    }
}


function BGFLogger(name) {

    this.name = name;

    this.log = function (data) {
        if (BGFLogger.logShow)
            console.log("BGFLog " + this.name + "-----info-----    " + data);
    }

}
BGFLogger.logShow = true;
BGFLogger.showLog = function (show) {
    BGFLogger.logShow = show;
}

//var taskManager = new TaskManager({
//    "name": '训练小游戏一',
//    "continue": 5,
//    tasks: [{"type": "click", data: {x: 100, y: 100, "continue": 5}},
//        {"type": "click", data: {x: 100, y: 100, "continue": 5}}, {
//            "type": "click",
//            data: {x: 100, y: 100, "continue": 5}
//        }, {"type": "click", data: {x: 100, y: 100, "continue": 5}}]
//}).setTaskFinishCallback(function (task) {
//        console.log("恭喜你，完成一个任务！")
//    }).setAllTaskFinishCallback(function () {
//        console.log("恭喜你，都成功啦！")
//    }).setFailCallback(function () {
//        alert("失败")
//    })


//console.log(taskManager)
//var now = (new Date()).getTime();
//setInterval(function () {
//    taskManager.receive({type: "noop", data: {before: now, now: (new Date()).getTime(), begin: now, type: "action"}})
//}, 3000)