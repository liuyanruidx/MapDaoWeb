// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var fs = require('fs');
var partials = require('express-partials');
var avosExpressCookieSession = require('avos-express-cookie-session');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var dateFormat = require('dateformat');//日期格式化
var crypto = require('crypto');//md5加密

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(partials());
// 启用 cookieParser
app.use(express.cookieParser('klp4e8b4sddjp2'));
// 使用 avos-express-cookie-session 记录登录信息到 cookie
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 },fetchUser :true}));
// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求

app.get('/', function (req, res) {
    console.log('获取当前用户: %j', AV.User.current());

    var currentUser = AV.User.current();
    var username = null;
    if (currentUser) {
        console.log(currentUser);
        username = AV.User.current().getUsername();
    }

    res.render('index', {title: 'Express', user: username, layout: 'share/layout'});
});

app.get('/users/login', function (req, res) {
    var currentUser = AV.User.current();
    var username = null;
    if (currentUser) {
        console.log(currentUser.getUsername());
        username = currentUser.getUsername();
    }
    res.render('users/login', {title: 'Express', user: username, layout: 'share/layout'});
});


app.post('/users/login', function (req, res) {
    var currentUser = AV.User.current();
    var username = null;
    if (currentUser) {
        console.log(currentUser.getUsername());
        username = currentUser.getUsername();
    }
    AV.User.logIn(req.body.username, req.body.password).then(function () {
        //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
        //跳转到profile页面。
        console.log(req.body.username + "登陆成功")

        console.log('signin successfully: %j', AV.User.current());
        res.redirect('/');
    }, function (error) {
        //登录失败，跳转到登录页面
        console.log("登录失败" + error)
        res.render('index', {message: '登录失败，请重新登录', user: username, layout: 'share/layout'});

    });


});
app.get('/users/register', function (req, res) {
    var currentUser = AV.User.current();
    var username = null;
    if (currentUser) {
        console.log(currentUser.getUsername());
        username = currentUser.getUsername();
    }
    res.render('users/register', {title: 'Express', message: "", user: username, layout: 'share/layout'});
});


app.post('/users/register', function (req, res) {
    var user = new AV.User();
    user.set("username", req.body.username);
    user.set("password", req.body.password);
    user.set("email", req.body.email);
    user.signUp(null, {
            success: function (user) {
                res.redirect('/');
            },
            error: function (user, error) {
                // Show the error message somewhere and let the user try again.
                res.render('users/register', {message: error.message});
            }
        }
    );
});

app.get('/users/logoff', function (req, res) {
    AV.User.logOut();
    res.redirect('/');
});


app.post('/login', function (req, res) {

    AV.User.logIn(req.body.username, req.body.password).then(function () {
        //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
        //跳转到profile页面。
        console.log("成哥")

        console.log('signin successfully: %j', AV.User.current());
        res.redirect('/');
    }, function (error) {
        //登录失败，跳转到登录页面
        console.log("shibai")
        res.render('index', {message: '登录失败，请重新登录', layout: 'share/layout'});

    });
});


app.get('/roads/list', function (req, res) {
    var currentUser = AV.User.current();
    var username = null;
    if (currentUser) {
        console.log(currentUser.getUsername());
        username = currentUser.getUsername();
    }
    if (currentUser) {
        var roads = new Array();

        var Road = AV.Object.extend("Road");
        var query = new AV.Query(Road);
        query.descending("createdAt");
        //query.equalTo("RoadId",req.params.id);
        query.find({
            success: function (results) {
                //alert("Successfully retrieved " + results.length + " scores.");
                // Do something with the returned AV.Object values
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];

                    var road = new Object();
                    road.id = object.id;
                    road.title = object.get('Title');
                    road.content = object.get('Content');
                    roads.push(road);

                }

                res.render('roads/list', {roads: roads, user: username, layout: 'share/layout'});
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }
    else {
        res.redirect('/users/login');
    }


});


app.get('/roads/index', function (req, res) {
    res.render('roads/index', {title: '路线', layout: 'share/layout'});
});

app.get('/roads/test', function (req, res) {

    var currentUser = AV.User.current();
    var username = null;
    if (currentUser) {
        console.log(currentUser.getUsername());
        username = currentUser.getUsername();
    }
    if (currentUser) {
        res.render('roads/test', {title: '测试', user: username, layout: 'share/layout'});
    }
    else {
        res.redirect('/users/login');
    }

});

app.post('/roads/getjson', function (req, res) {

    console.info(req.body.roadid)
    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.equalTo("RoadId", req.body.roadid);
    //query.equalTo("RoadId", "54e1ed26e4b01eb12d326495");
    query.find({
        success: function (results) {
            var points = [];
            console.log(results)
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                var lon = object.get('Longitude');
                var lat = object.get('Latitude');

                if (lon != null && lat != null) {
                    var point = new Object();
                    point.id = object.id;
                    point.Longitude = lon;
                    point.Latitude = lat;
                    point.title = object.get('Title');
                    point.content = object.get('Content');
                    points.push(point);
                }


                //console.log(points);

            }
            res.send(points);

        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });

});

//app.get()
app.post('/points/getpointposition', function (req, res) {
    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.id, {
        success: function (point) {

            res.send(point);
        },
        error: function (object, error) {

            res.send('false');
        }
    });

});
app.post('/points/getdetails', function (req, res) {
    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.id, {
        success: function (point) {

            res.send(point);
        },
        error: function (object, error) {

            res.send('false');
        }
    });
});
app.get('/roads/details/:id', function (req, res) {
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();
        var isedit=false;
        if(currentUser.attributes.UserRoleId!="551163fde4b0dbfd5ebdaa23")//普通用户
        {
            isedit=true;
        }

        var Road = AV.Object.extend("Road");
        var query = new AV.Query(Road);
        query.get(req.params.id, {
            success: function (road) {
                var title = road.get("Title");
                var content = road.get("Content");

                var points = new Array();

                var Point = AV.Object.extend("Point");
                var query = new AV.Query(Point);
                query.equalTo("RoadId", req.params.id);
                query.ascending("createdAt");
                query.find({
                    success: function (results) {
                        //alert("Successfully retrieved " + results.length + " scores.");
                        // Do something with the returned AV.Object values
                        for (var i = 0; i < results.length; i++) {
                            var object = results[i];

                            var point = new Object();
                            point.id = object.id;
                            point.type=object.get('Type');
                            point.title = object.get('Title');
                            point.content = object.get('Content');
                            points.push(point);
                            //console.log(points);


                        }
                        res.render('roads/details', {
                            title: title,
                            user: username,
                            content: content,
                            isedit:isedit,
                            roadid: req.params.id,
                            points: points,
                            layout: 'share/layout'
                        });
                    },
                    error: function (error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            },
            error: function (object, error) {
            }
        });
    }
    else {
        res.redirect('/users/login');
    }


});

app.get('/roads/pointlistpart/:id', function (req, res) {
    var Road = AV.Object.extend("Road");
    var query = new AV.Query(Road);
    query.get(req.params.id, {
        success: function (road) {
            var title = road.get("Title");
            var content = road.get("Content");

            var points = new Array();

            var Point = AV.Object.extend("Point");
            var query = new AV.Query(Point);
            query.equalTo("RoadId", req.params.id);
            query.ascending("createdAt");
            query.find({
                success: function (results) {
                    //alert("Successfully retrieved " + results.length + " scores.");
                    // Do something with the returned AV.Object values
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];

                        var point = new Object();
                        point.id = object.id;
                        point.type=object.get('Type');
                        point.title = object.get('Title');
                        point.content = object.get('Content').replace(/<\/?.+?>/g, "");
                        points.push(point);
                        //console.log(points);


                    }
                    res.render('roads/pointlistpart', {
                        points: points,
                        layout: null
                    });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        },
        error: function (object, error) {
        }
    });
});

app.get('/roads/roadtitleadd', function (req, res) {
    var Road = AV.Object.extend("Road");
    var road = new Road();
    road.set("RoadTitle", req.body.title.trim());
    road.save(null, {
            success: function (road) {
                res.send('true');
            },
            error: function (road, error) {
                res.send('添加失败');
            }
        }
    );
});
/* 添加路线 */
app.post('/roads/roadadd', function (req, res) {
    var Road = AV.Object.extend("Road");
    var road = new Road();
    road.set("Title", req.body.InputTitle.trim());
    road.set("Content", req.body.InputContent.trim());
    road.save(null, {
            success: function (road) {
                //res.send('true');
                res.redirect("/roads/list");
            },
            error: function (road, error) {
                res.send('添加失败');
            }
        }
    );
});


/* 修改站点标题 */
app.post('/roads/editroadtitle', function (req, res) {

    var Road = AV.Object.extend("Road");
    var query = new AV.Query(Road);
    query.get(req.body.RoadID, {
        success: function (road) {
            // The object was retrieved successfully.
            road.set("Title", req.body.Title.trim());
            road.save();
            res.send('true');
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});

/* 修改站点内容 */
app.post('/roads/editroadcontent', function (req, res) {

    var Road = AV.Object.extend("Road");
    var query = new AV.Query(Road);
    query.get(req.body.RoadID, {
        success: function (road) {
            // The object was retrieved successfully.
            road.set("Content", req.body.Content.trim());
            road.save();
            res.send('true');
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});

app.post('/roads/uploadroadimage', function (req, res) {


    console.log(req.body.RoadID);

    var files = [].concat(req.files);

    // console.log(files[0].file.path);


    for (var i = 0; i < files.length; i++) {
        var file = files[i].file;

        var data = fs.readFileSync(file.path);
        // console.log(data);
        //var base64Data = data.toString('base64');
        //var theFile = new AV.File(file.originalFilename, {base64: base64Data});
        var theFile = new AV.File(file.originalFilename, data);


        theFile.save();

        var Road_Image = AV.Object.extend("Road_Image");
        var road_img = new Road_Image();
        road_img.set("RoadId", req.body.RoadID);
        road_img.set("Image", theFile);
        road_img.save();


    }

    //var data=fs.readFileSync(req.files.username.path);
    //console.log(data);
    res.send("true");
});
app.get('/roads/getroadfirstimage/:id', function (req, res) {


    var Road_Image = AV.Object.extend("Road_Image");
    var queryimg = new AV.Query(Road_Image);
    queryimg.equalTo("RoadId", req.params.id);
    queryimg.first({
        success: function (queryimg) {
            //console.log(point.id)

            if (queryimg != null) {
                imgurl = queryimg.get('Image').url();
            }
            else {
                imgurl = "/images/img1.png";
            }

            res.redirect(imgurl);

            // Successfully retrieved the object.
            //var pointimage=queryimg.get('Image');
            //point.url= pointimage.url();


        },
        error: function (error) {
            //alert("Error: " + error.code + " " + error.message);
        }
    });

});


/* 添加路线 */
app.post('/points/pointadd', function (req, res) {



    var Point = AV.Object.extend("Point");
    var point = new Point();

    if(req.body.wenbenis=="true")
    {
        point.set("Type", "文本");

    }
    else
    {
        point.set("Type","站点");

    }
    point.set("RoadId", req.body.RoadId);
    point.set("Title", req.body.InputTitle.trim());
    point.set("Content", req.body.InputContent.trim());
    point.save(null, {
            success: function (point) {
                //res.send('true');
                res.redirect("/roads/details/" + req.body.RoadId);
            },
            error: function (point, error) {
                res.send('添加失败');
            }
        }
    );
});

/* 修改站点标题 */
app.post('/points/editpointtitle', function (req, res) {

    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointID, {
        success: function (point) {
            // The object was retrieved successfully.
            point.set("Title", req.body.Title.trim());
            point.save();
            res.send('true');
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});

/* 修改站点内容 */
app.post('/points/editpointcontent', multipartMiddleware, function (req, res) {
    //console.log(req)

    console.log("asdf")
    console.log(req.body)


    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointContentEditID.trim(), {
        success: function (point) {
            // The object was retrieved successfully.
            point.set("Content", req.body.PointContentEditContent.trim());
            point.save();
            res.send('true');
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});


/* 修改站点内容 */
app.post('/points/editpointcontenttext', multipartMiddleware, function (req, res) {
    //console.log(req)

    console.log("asdf")
    console.log(req.body)


    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointID.trim(), {
        success: function (point) {
            // The object was retrieved successfully.
            point.set("Content", req.body.Content.trim());
            point.save();
            res.send('true');
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});


app.post('/points/uploadpointimage', function (req, res) {

    // var aaaa=req.query.pointid;
    console.log(req.body.PointID);

    var files = [].concat(req.files);

    // console.log(files[0].file.path);


    for (var i = 0; i < files.length; i++) {
        var file = files[i].file;

        var data = fs.readFileSync(file.path);
        // console.log(data);
        //var base64Data = data.toString('base64');
        //var theFile = new AV.File(file.originalFilename, {base64: base64Data});
        var theFile = new AV.File(file.originalFilename, data);


        theFile.save();

        var Point_Image = AV.Object.extend("Point_Image");
        var point_img = new Point_Image();
        point_img.set("PointId", req.body.PointID);
        point_img.set("Image", theFile);
        point_img.save();


    }

    //var data=fs.readFileSync(req.files.username.path);
    //console.log(data);
    res.send("true");
});


app.get('/points/getpointimage/:id', function (req, res) {


    //var imgid=req.params.id;
    var pointimgs = new Array();
    var Point_Image = AV.Object.extend("Point_Image");
    var query = new AV.Query(Point_Image);
    query.equalTo("PointId", req.params.id);
    query.find({
        success: function (results) {
            //alert("Successfully retrieved " + results.length + " scores.");
            // Do something with the returned AV.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                var pointimage = new Object();
                pointimage.id = object.id;
                pointimage.image = object.get('Image');
                pointimgs.push(pointimage);


                console.log(pointimage.image.url())

            }

        },
        error: function (error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });

});
app.get('/points/getpointfirstimage/:id', function (req, res) {


    var Point_Image = AV.Object.extend("Point_Image");
    var queryimg = new AV.Query(Point_Image);
    queryimg.equalTo("PointId", req.params.id);
    queryimg.first({
        success: function (queryimg) {
            //console.log(point.id)

            if (queryimg != null) {
                imgurl = queryimg.get('Image').url();
            }
            else {
                imgurl = "/images/img1.png";
            }

            res.redirect(imgurl);

            // Successfully retrieved the object.
            //var pointimage=queryimg.get('Image');
            //point.url= pointimage.url();


        },
        error: function (error) {
            //alert("Error: " + error.code + " " + error.message);
        }
    });

});


/* 修改站点标题 */
app.post('/points/setpositon', function (req, res) {

    console.log(req.body.pointpositionpointid);
    console.log(req.body.pointpositionlongitude);
    console.log(req.body.pointpositionlatitude);
    console.log(req.body.pointpositioninput);

    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.pointpositionpointid, {
        success: function (point) {
            // The object was retrieved successfully.
            console.log(point)
            point.set("Longitude", req.body.pointpositionlongitude);
            point.set("Latitude", req.body.pointpositionlatitude);
            point.set("Address", req.body.pointpositioninput);
            point.save();
            res.send('true');
        },
        error: function (object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});
/* 删除站点 */
app.post('/points/deletepoint', function (req, res) {
    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointID, {
        success: function (point) {
            //console.log(point)
            var Point_Image = AV.Object.extend("Point_Image");
            var query = new AV.Query(Point_Image);
            query.equalTo("PointId", req.body.PointID);
            query.find({
                success: function (pimgresults) {
                    for (var i = 0; i < pimgresults.length; i++) {
                        var pimg = pimgresults[i];
                        var imgfile = pimg.get('Image');
                        imgfile.destroy();
                    }
                    AV.Object.destroyAll(pimgresults);

                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
            point.destroy({
                success: function (myObject) {
                    res.send('true');
                },
                error: function (myObject, error) {
                    res.send('false');
                }
            });

        },
        error: function (object, error) {

            res.send('false');
        }
    });
});

/* 删除路线*/
app.post('/roads/deleteroad', function (req, res) {

    //删除路图片、图片文件

    var Road_Image = AV.Object.extend("Road_Image");
    var queryrimg = new AV.Query(Road_Image);
    queryrimg.equalTo("RoadId", req.body.RoadID);
    queryrimg.find({
        success: function (rimgresults) {
            for (var i = 0; i < rimgresults.length; i++) {
                var rimg = rimgresults[i];
                var imgfile = rimg.get('Image');
                imgfile.destroy();
            }
            AV.Object.destroyAll(rimgresults);

        },
        error: function (error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });
    //删除路上站点

    var Point = AV.Object.extend("Point");
    var querypoint = new AV.Query(Point);
    querypoint.equalTo("RoadId", req.body.RoadID);
    querypoint.find({
        success: function (pointresults) {
            for (var i = 0; i < pointresults.length; i++) {
                var point = pointresults[i];
                var pointid = point.id;


                var Point_Image = AV.Object.extend("Point_Image");
                var querypimg = new AV.Query(Point_Image);
                querypimg.equalTo("PointId", pointid);
                querypimg.find({
                    success: function (pimgresults) {
                        for (var i = 0; i < pimgresults.length; i++) {
                            var pimg = pimgresults[i];
                            var imgfile = pimg.get('Image');
                            imgfile.destroy();
                        }

                        AV.Object.destroyAll(pimgresults);

                    },
                    error: function (error) {
                        console.log("Error: " + error.code + " " + error.message);
                    }
                });

                point.destroy();
            }
            AV.Object.destroyAll(pointresults);
        },
        error: function (error) {
            console.log("Error: " + error.code + " " + error.message);
        }
    });

    //删除路
    var Road = AV.Object.extend("Road");
    var queryroad = new AV.Query(Road);
    queryroad.get(req.body.RoadID, {
        success: function (road) {

            road.destroy({
                success: function (myObject) {
                    res.send('true');
                },
                error: function (myObject, error) {
                    res.send('false');
                }
            });
        },
        error: function (object, error) {

            res.send('false');
        }
    });
});

//邀请码
app.get('/invitation/index', function (req, res) {
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();
        var isedit=false;
        if(currentUser.attributes.UserRoleId!="551163fde4b0dbfd5ebdaa23")//普通用户
        {
            isedit=true;
        }


        var nowdatetime = new Date();
        //dateFormat(nowdatetime, "dddd, mmmm dS, yyyy, h:MM:ss TT");
        var aaa = dateFormat(nowdatetime, "yyyymmddHHMMss");





        //得到自己所有邀请码


        var invitationcodes = new Array();

        var InvitationCode = AV.Object.extend("InvitationCode");
        var query = new AV.Query(InvitationCode);
        query.equalTo("CreateUserId",currentUser.id);
        query.find({
            success: function (results) {
                //alert("Successfully retrieved " + results.length + " scores.");
                // Do something with the returned AV.Object values
                for (var i = 0; i < results.length; i++) {
                    var object = results[i];

                    var invitationcode = new Object();
                    invitationcode.id = object.id;
                    invitationcode.code = object.get('Code');
                    invitationcode.isused = object.get('IsUsed');
                    invitationcodes.push(invitationcode);

                }
                res.render('invitation/index', {
                    datetime: aaa,
                    user: username,
                    isedit:isedit,
                    invitationcodes:invitationcodes,

                    layout: 'share/layout'
                });

            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }
    else {
        res.redirect('/users/login');
    }
});

app.get("/invitation/add", function (req, res) {
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();
        var nowdatetime = new Date();
        //dateFormat(nowdatetime, "dddd, mmmm dS, yyyy, h:MM:ss TT");
        var nowdatestr=   dateFormat(nowdatetime, "yyyymmddHHMMss");

        var codestr=username+nowdatestr;

        var md5 = crypto.createHash('md5');
        md5.update(codestr);
        var md5code = md5.digest('hex');
        console.log(codestr);

        console.log(md5code);

        console.log(currentUser.id);
        var InvitationCode = AV.Object.extend("InvitationCode");
        var invitationcode = new InvitationCode();
        invitationcode.set("Code",md5code );
        invitationcode.set("CreateUserId",currentUser.id );
        invitationcode.set("IsUsed",false );
        invitationcode.save(null, {
                success: function (invitationcode) {
                    //res.send('true');
                    //res.redirect('/invitation/index');
                },
                error: function (invitationcode, error) {
                    //res.send('添加失败');
                   // res.redirect('/invitation/index');
                }
            }
        );



        res.redirect('/invitation/index');

    }







});

app.get("/users/applyforedit",function(req,res){
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();

        console.log(currentUser);
        console.log(currentUser.attributes.UserRoleId);

        var isedit=false;
        if(currentUser.attributes.UserRoleId!="551163fde4b0dbfd5ebdaa23")//普通用户
        {
            isedit=true;
        }



        res.render('users/applyforedit', {

            user: username,
            isedit:isedit,
            layout: 'share/layout'
        });
    }
    else {
        res.redirect('/users/login');
    }
    });


app.post("/users/applyforedit",function(req,res){


    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();


        var InvitationCode = AV.Object.extend("InvitationCode");
        var invitationquery = new AV.Query(InvitationCode);
        invitationquery.equalTo("Code", req.body.invitationcode);
        invitationquery.equalTo("IsUsed", false);
        invitationquery.first({
            success: function (invitationquery) {

                if (invitationquery != null) {
                    //imgurl = queryimg.get('Image').url();
                    invitationquery.set("IsUsed",true);
                    invitationquery.set("UseUserId",currentUser.id);
                    invitationquery.save();
                    currentUser.set("UserRoleId","5855116417e4b0dbfd5ebdaba2");
                    currentUser.save();
                    res.redirect('/users/info');
                }
                else {
                    res.redirect('/users/applyforedit');

                }




            },
            error: function (error) {
                //alert("Error: " + error.code + " " + error.message);
                res.redirect('/users/info');
            }
        });



    }
    else {
        res.redirect('/users/login');
    }


});

app.get("/users/info",function(req,res){
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();
       var useremail=currentUser.attributes.email;
        console.log(currentUser);

        res.render('users/info', {

            user: username,
            useremail:useremail,
            layout: 'share/layout'
        });
    }
    else {
        res.redirect('/users/login');
    }
});

app.get("/users/pwdreset",function(req,res){
    console.log(req.params)
    var  username=req.query.username;
    res.render('users/pwdreset', { user: username, layout: 'share/layout'});
});
app.post("/users/pwdreset",function(req,res){
    var  username=req.body.username;


    var query = new AV.Query(AV.User);
    query.equalTo("username", username);  // find all the women
    query.first({
        success: function(userinfo) {
            // Do stuff
            console.log(userinfo)

            if(userinfo!=null)
            {

                var useremail=userinfo.attributes.email;
                res.render('users/sendpwdresetemail', { user: username,useremail:useremail, layout: 'share/layout'});

            }
            else
            {
                //res.send("<script language='javascript'> alert('该用户不存在');</script>")


             res.send("<script language='javascript'>if(confirm('该用户不存在！')){document.location.replace('/users/pwdreset')}else{document.location.replace('/users/pwdreset')};</script>");
            }
        }
    });

});

app.post("/users/sendpwdresetemail",function(req,res){


    AV.User.requestPasswordReset(req.body.useremail.trim(), {
        success: function() {
            // Password reset request was sent successfully
            res.render('users/sendpwdresetemailresult', {
                user:null,
                resultmessage:"发送重置密码邮件成功！",
                layout: 'share/layout'
            });
        },
        error: function(error) {
            // Show the error message somewhere
            res.render('users/sendpwdresetemailresult', {
                user: null,
                resultmessage:"发送重置密码邮件失败！",
                layout: 'share/layout'
            });
        }
    });
});

app.get("/users/changepassword",function(req,res){
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();

        console.log(currentUser);

        res.render('users/changepassword', {

            user: username,

            layout: 'share/layout'
        });
    }
    else {
        res.redirect('/users/login');
    }
});

app.post("/users/changepassword",function(req,res){
    var currentUser = AV.User.current();
    var username;
    if (currentUser) {
        username = currentUser.getUsername();

        console.log(currentUser);

        currentUser.updatePassword(req.body.oldpassword.trim(),req.body.newpassword.trim(),{
            success: function(){
                //更新成功

                res.render('users/changepwdresult', {
                    user: username,
                    resultmessage:"密码修改成功！",
                    layout: 'share/layout'
                });

            },
            error: function(err){
                //更新失败
               // console.dir(err);
                res.render('users/changepwdresult', {
                    user: username,
                    resultmessage:"密码修改失败！",
                    layout: 'share/layout'
                });

            }
        });
    }
    else {
        res.redirect('/users/login');
    }
});



// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
