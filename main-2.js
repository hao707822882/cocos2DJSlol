/**
 * Created by Administrator on 2016/5/27.
 */
window.onload = function () {

    var taskManager = new TaskManager({
        "name": '训练小游戏一',
        "continue": 5,
        tasks: [{"type": "click", data: {x: 100, y: 100, "continue": 5}},
            {"type": "click", data: {x: 100, y: 100, "continue": 5}}, {
                "type": "click",
                data: {x: 100, y: 100, "continue": 5}
            }, {"type": "click", data: {x: 100, y: 100, "continue": 5}}]
    }).setTaskFinishCallback(function (task) {
            console.log("恭喜你，完成一个任务！")
        }).setAllTaskFinishCallback(function () {
            console.log("恭喜你，都成功啦！")
            isStart = false;
        }).setFailCallback(function () {
            alert("失败")
            isStart = false;
        })

    var startTime = null;
    var isStart = false;
    cc.game.onStart = function () {
        cc.LoaderScene.preload(gameConfig.resource, function () {
            var gameScene = cc.Scene.extend({
                    ctor: function () {
                        this._super();
                        this.schedule(function () {
                            //cc.log("update事件。。。")
                            if (isStart) {
                                taskManager.receive({
                                    type: "noop",
                                    data: {before: null, now: (new Date()).getTime(), begin: startTime, type: "beat"}
                                })
                            }
                        });
                    },
                    onEnter: function () {
                        this._super();

                        var thiss = this;
                        var size = cc.director.getWinSize();
                        var bg = cc.Sprite.create("img/map.jpg");
                        bg.setPosition(size.width / 2, size.height / 2);
                        bg.setScale(1);
                        this.addChild(bg, 0);


                        var start = new cc.LabelTTF("start", "Arial", 38);
                        start.x = size.width / 2;
                        start.y = 150;
                        this.addChild(start, 1);


                        function getKeyNum(key) {
                            switch (key) {
                                case "Q":
                                    return 81;
                                case "W":
                                    return 87;
                                case "E":
                                    return 69;
                                case "R":
                                    return 82;

                            }
                        }


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
                                cc.log("----移动------")

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
                            }
                        }, bg);


                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                console.log("x:" + event.x + " y:" + event.y)
                                if (isStart) {
                                    taskManager.receive({
                                        type: "click",
                                        data: {x: event.x, y: event.y}
                                    })
                                }
                            }
                        }, bg);

                        //游戏启动
                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                startTime = new Date().getTime();
                                isStart = true;
                            }
                        }, start);
                    }
                }
            );
            cc.director.runScene(new gameScene());
        }, this);
    }
    cc.game.run("gameCanvas");
};