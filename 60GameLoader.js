/**
 * Created by Administrator on 2016/5/27.
 */
//不打日志
BGFLogger.showLog(false)

//
var startTime = null;
var isStart = false;
var beforeTime = null;
var startScene = null;
var endScene = null;
var gameScene = null;
var msg = "";


var totalTimeLimit = 20 * 1000;

var totalTime = 0;
var winTimes = 0;

taskManager = null;


var gameConfig = {
    title: task.name,
    resource: ["img/game/start.png", "img/game/end.png", "img/game/bg.jpg"]
}

function reCreateTaskManager() {
    var taskManager = new TaskManager(task).setTaskFinishCallback(function (task, index) {
        console.log("恭喜你，完成一个任务！" + JSON.stringify(task) + "----index " + index)
        //$("#info").append($("<p>").text(JSON.stringify(task) + "√"))
        taskManager.views[index][0].runAction(cc.FadeTo.create(0.1, 0))
        taskManager.views[index][1].runAction(cc.FadeTo.create(0.1, 0))
    }).setAllTaskFinishCallback(function () {
        totalTime += (new Date().getTime() - startTime)
        winTimes++;
        taskManager = reCreateTaskManager();
        startTime = new Date().getTime();
        beforeTime = new Date().getTime();
        isStart = true;
        cc.director.setDisplayStats(false);
        cc.director.runScene(new gameScene());

    }).setFailCallback(function (m, task, action) {

        totalTime += (new Date().getTime() - startTime)
        //$("#info").append($("<p>").text(JSON.stringify(task) + "×"))

        taskManager = reCreateTaskManager();
        startTime = new Date().getTime();
        beforeTime = new Date().getTime();
        isStart = true;
        cc.director.setDisplayStats(false);
        cc.director.runScene(new gameScene());

    }).setTimeUseCallback(function (time) {
        var timeUse = totalTime + time;
        if (timeUse > totalTimeLimit) {
            var e = new endScene();
            e.msg = "赢得：" + winTimes;
            cc.director.setDisplayStats(false);
            cc.director.runScene(e);
            console.log(winTimes)
        }
    })
    window.taskManager = taskManager;
    return taskManager;
}

function getTaskManager() {
    return taskManager;
}

$(function () {
    cc.game.onStart = function () {
        cc.LoaderScene.preload(gameConfig.resource, function () {
            cc.director.setDisplayStats(false);
            startScene = cc.Scene.extend({
                    ctor: function () {
                        this._super();
                        this.schedule(function () {
                            //cc.log("update事件。。。")
                        });
                    },
                    onEnter: function () {
                        this._super();
                        var size = cc.director.getWinSize();

                        var bg = BGFUtil.createImg("img/game/bg.jpg")
                        bg.x = size.width / 2;
                        bg.y = size.height / 2;
                        this.addChild(bg, 0);


                        var start = BGFUtil.createImg("img/game/start.png")
                        start.x = size.width / 2;
                        start.y = size.height / 2;
                        this.addChild(start, 0);
                        //游戏启动
                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                cc.director.runScene(new gameScene());
                                taskManager = reCreateTaskManager();
                                startTime = new Date().getTime();
                                beforeTime = new Date().getTime();
                                isStart = true;
                                totalTime = 0;
                                winTimes = 0;
                            }
                        }, start);
                    }
                }
            );

            endScene = cc.Scene.extend({
                    ctor: function () {
                        this._super();
                        this.schedule(function () {
                            //cc.log("update事件。。。")
                        });
                    },
                    onEnter: function () {
                        this._super();
                        var size = cc.director.getWinSize();


                        var bg = BGFUtil.createImg("img/game/bg.jpg")
                        bg.x = size.width / 2;
                        bg.y = size.height / 2;
                        this.addChild(bg, 0);

                        var end = BGFUtil.createImg("img/game/end.png")
                        end.x = size.width / 2;
                        end.y = size.height / 2 - 50;
                        this.addChild(end, 0);

                        var msg = BGFUtil.createText(this.msg, 20, null, end.x, size.height / 2)
                        this.addChild(msg, 0);


                        //游戏启动
                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                cc.director.runScene(new gameScene());
                                taskManager = reCreateTaskManager();
                                startTime = new Date().getTime();
                                beforeTime = new Date().getTime();
                                isStart = true;
                                //重置计时统计
                                totalTime = 0;
                                winTimes = 0;
                            }
                        }, end);

                        cc.eventManager.addListener({
                            event: cc.EventListener.KEYBOARD,
                            onKeyPressed: function (key, event) {
                                //按键处理
                            },
                            onKeyReleased: function (key, event) {
                                if (key != 32)
                                    return;
                                cc.director.runScene(new gameScene());
                                taskManager = reCreateTaskManager();
                                startTime = new Date().getTime();
                                beforeTime = new Date().getTime();
                                isStart = true;
                                //重置计时统计
                                totalTime = 0;
                                winTimes = 0;
                            }
                        }, end);

                    }
                }
            );


            gameScene = cc.Scene.extend({
                    ctor: function () {
                        this._super();
                        this.schedule(function () {
                            //cc.log("update事件。。。")
                            if (isStart) {
                                getTaskManager().receive({
                                    type: "noop",
                                    data: {before: null, now: (new Date()).getTime(), begin: startTime, type: "beat"}
                                })
                            }
                        });
                    },
                    onEnter: function () {
                        this._super();
                        var thiss = this;


                        //场景控件
                        var taskViews = [];

                        thiss.moveX = 0;
                        thiss.moveY = 0;
                        function drowCompontent(task, tasks, page) {
                            var champion = task.championName;
                            var startX = 50;
                            var startY = 50;
                            for (var a = 0; a < tasks.length; a++) {
                                var c = tasks[a];
                                var nowX = startX + a * 80;

                                var temp = "";
                                if (isNum(c.data.key)) {
                                    temp = c.data.key + ".png";
                                } else {
                                    if (c.data.key == "A" || c.data.key == "a" || c.data.key == "D" || c.data.key == "d" || c.data.key == "F" || c.data.key == "f") {
                                        temp = c.data.key.toUpperCase() + ".png";
                                    } else {
                                        temp = champion + c.data.key.toUpperCase() + ".png";
                                    }
                                }

                                var comImg = BGFUtil.createImg("img/game/" + temp, nowX, startY + 50)
                                var comText = BGFUtil.createText(c.data.key, null, null, nowX, startY, 0.6);
                                taskViews.push([comImg, comText])
                                page.addChild(comImg, 0);
                                page.addChild(comText, 0);
                            }

                            taskManager.views = taskViews;
                        }

                        var reg = new RegExp("^[0-9]*$");

                        function isNum(key) {
                            return reg.test(key);
                        }

                        var bg = cc.Sprite.create("img/game/bg.jpg");
                        console.log(bg.width)
                        bg.setPosition(bg.width / 2, bg.height / 2);

                        var wheight = cc.winSize.height;
                        var wwidth = cc.winSize.width;

                        var comText = BGFUtil.createText(0, null, null, wwidth / 2, wheight / 3 * 2);
                        this.addChild(comText, 10);

                        getTaskManager().setTimeUseCallback(function (time) {
                            comText.string = (time / 1000).toFixed(3) + "/s"
                        })

                        this.addChild(bg, 0);
                        drowCompontent(task, task.tasks, thiss)

                        cc.eventManager.addListener({
                            event: cc.EventListener.MOUSE,
                            onMouseDown: function (event) {
                            },
                            onMouseMove: function (event) {
                                var pos = event.getLocation(), target = event.getCurrentTarget();
                                var nowX = pos.x;
                                var nowY = pos.y;
                                //检测移动的位置
                                thiss.moveX = nowX;
                                thiss.moveY = nowY;
                            },
                            onMouseUp: function (event) {
                            }
                        }, bg);

                        cc.eventManager.addListener({
                            event: cc.EventListener.KEYBOARD,
                            onKeyPressed: function (key, event) {
                                //按键处理
                            },
                            onKeyReleased: function (key, event) {
                                cc.log("press key " + key);
                                if (isStart) {
                                    taskManager.receive(taskManager.createNoopAction(beforeTime))
                                    taskManager.receive(taskManager.createMoveAction(thiss.moveX, thiss.moveY))
                                    taskManager.receive(taskManager.createNoopAction(beforeTime))
                                    taskManager.receive(taskManager.createKey(key))
                                    beforeTime = new Date();
                                }
                            }
                        }, bg);


                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                if (isStart) {
                                    taskManager.receive(taskManager.createNoopAction(beforeTime))
                                    taskManager.receive(taskManager.createMoveAction(thiss.moveX, thiss.moveY))
                                    taskManager.receive(taskManager.createNoopAction(beforeTime))
                                    taskManager.receive(taskManager.createClick(touch._point.x, touch._point.y))
                                    beforeTime = new Date();
                                }
                            }
                        }, bg);
                    }
                }
            );
            cc.director.runScene(new startScene());
        }, this);
    }
    cc.game.run("gameCanvas");
})