/**
 * Created by Administrator on 2016/5/27.
 */
window.onload = function () {
    var isStart = false;
    cc.game.onStart = function () {
        cc.LoaderScene.preload(gameConfig.resource, function () {
            var gameScene = cc.Scene.extend({
                    ctor: function () {
                        this._super();
                        this.schedule(function () {
                            cc.log("update事件。。。")
                        });
                    },
                    onEnter: function () {
                        this._super();

                        var thiss = this;
                        var delay = 5;
                        var taskold = [{'x': 240, 'y': 360}, "Q", "W"];
                        var task = taskold.slice(0, taskold.length);
                        var size = cc.director.getWinSize();
                        var bg = cc.Sprite.create("img/map.jpg");
                        bg.setPosition(size.width / 2, size.height / 2);
                        bg.setScale(1);
                        this.addChild(bg, 0);

                        var helloLabel = new cc.LabelTTF("时间剩余：" + delay, "Arial", 38);
                        helloLabel.x = size.width / 2;
                        helloLabel.y = 50;
                        this.addChild(helloLabel, 1);


                        var start = new cc.LabelTTF("start", "Arial", 38);
                        start.x = size.width / 2;
                        start.y = 150;
                        this.addChild(start, 1);

                        var text = new cc.LabelTTF("任务显示牌", "Arial", 38);
                        text.x = size.width / 2;
                        text.y = 100;
                        this.addChild(text, 1);

                        var position = cc.Sprite.create("2.png");
                        position.setPosition(0, 0);
                        position.setScale(1);
                        this.addChild(position, 2);


                        function isThisStageShouldDo(action) {
                            var shouldDo = task[0];
                            var type = typeof shouldDo;
                            switch (action) {
                                case "move":
                                    return type == "object" ? true : false;
                                case "key":
                                    return type == "string" ? true : false;
                            }
                        }

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
                                cc.log("----移动------" + isStart)
                                if (isStart) {
                                    if (isThisStageShouldDo("move")) {
                                        cc.log("移动。。。nowX" + nowX + "==oldX" + oldX + "===nowY" + nowY + "===oldY" + oldY + "isStart" + isStart);
                                        if ((nowX > oldX) && (nowY > oldY)) {
                                            //两个都大于
                                            var ok = task.shift();
                                            text.setString("已经完成移动" + ok);
                                        }
                                    }
                                }
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
                                    if (isThisStageShouldDo("key")) {
                                        var shouldDo = task[0];
                                        var keyN = getKeyNum(shouldDo);
                                        //两个都大于
                                        if (keyN == key) {
                                            var ok = task.shift();
                                            text.setString("已经完成键盘点击事件" + ok)
                                        }
                                    }
                                }
                            }
                        }, bg);


                        function checker() {
                            cc.log("定时器开始执行。。。还剩" + delay)
                            --delay;

                            helloLabel.setString("时间剩余：" + delay)
                            if (task == 0) {
                                alert("ok......")
                                isStart = false;
                                delay = 0;
                                thiss.unschedule(checker);
                                return;
                            }

                            if (delay == 0) {
                                if (task.length > 0) {
                                    alert("失败")
                                } else {
                                    alert("成功！")
                                }
                            }
                        }

                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
                                isStart = true;
                                if (delay <= 0) {
                                    //还原配置
                                    delay = 5;
                                    isStart = true;
                                    task = taskold.slice(0, taskold.length);
                                    cc.log("重置配置！")
                                }
                                thiss.schedule(checker, 1, 5, 1);
                            }
                        }, bg);
                    }
                }
            );
            cc.director.runScene(new gameScene());
        }, this);
    }
    cc.game.run("gameCanvas");
};