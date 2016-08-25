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
var msg = "";


var taskManager;


var gameConfig = {
    title: task.name,
    resource: task.resource
}

function reCreateTaskManager() {
    var taskManager = new TaskManager(task).setTaskFinishCallback(function (task) {
        console.log("恭喜你，完成一个任务！" + JSON.stringify(task))
        $("#info").append($("<p>").text(JSON.stringify(task) + "√"))
    }).setAllTaskFinishCallback(function () {
        isStart = false;
        msg = "成功" + (new Date().getTime() - startTime)
        cc.director.runScene(new endScene());
    }).setFailCallback(function (m, task, action) {
        isStart = false;
        msg = "失败" + m + (new Date().getTime() - startTime)
        $("#info").append($("<p>").text(JSON.stringify(task) + "×"))
        cc.director.runScene(new endScene());
    }).setTimeUseCallback(function () {

    })
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
                        var start = new cc.LabelTTF("start", "Arial", 38);
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
                        var start = new cc.LabelTTF(msg, "Arial", 38);
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
                            }
                        }, start);

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
                            }
                        }, start);

                    }
                }
            );


            var gameScene = cc.Scene.extend({
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

                        function drowCompontent(compontents, page) {
                            for (var a = 0; a < compontents.length; a++) {
                                var c = compontents[a];
                                var bg = cc.Sprite.create(c.img);
                                bg.setPosition(c.x, c.y);
                                bg.setScale(1);
                                page.addChild(bg, 0);
                            }
                        }

                        var bg = cc.Sprite.create(task.view.bg);
                        bg.setPosition(bg.width / 2, bg.height / 2);
                        bg.setScale(1);
                        this.addChild(bg, 0);
                        drowCompontent(task.view.compontents, thiss)

                        cc.eventManager.addListener({
                            event: cc.EventListener.MOUSE,
                            onMouseDown: function (event) {
                            },
                            onMouseMove: function (event) {
                                var pos = event.getLocation(), target = event.getCurrentTarget();
                                var nowX = pos.x;
                                var nowY = pos.y;
                                var oldX = target.getPositionX();
                                var oldY = target.getPositionY();
                                //检测移动的位置
                                //console.log("location:  x" + nowX + "y" + nowY)
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