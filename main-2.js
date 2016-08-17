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
                        var size = cc.director.getWinSize();
                        var bg = cc.Sprite.create("img/map.jpg");
                        bg.setPosition(bg.width / 2, bg.height / 2);
                        bg.setScale(1);
                        this.addChild(bg, 0);


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



                        //游戏启动
                        cc.eventManager.addListener({
                            event: cc.EventListener.TOUCH_ONE_BY_ONE,//单击
                            swallowTouches: true,
                            onTouchBegan: function (touch, event) {
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