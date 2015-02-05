// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var fs = require('fs');
var partials = require('express-partials');
var avosExpressCookieSession = require('avos-express-cookie-session');
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
app.get('/', function(req, res) {
    console.log('获取当前用户: %j', AV.User.current());

    var currentUser =AV.User.current();
    var username=null;
    if(currentUser)
    {
        console.log(currentUser);
        username=AV.User.current().getUsername();
    }

    res.render('index', { title: 'Express' ,user:username, layout: 'share/layout' });
});

app.get('/users/login', function(req, res) {
    var currentUser = AV.User.current();
    var username=null;
    if(currentUser)
    {
        console.log(currentUser.getUsername());
        username=currentUser.getUsername();
    }
    res.render('users/login', { title: 'Express',user:username ,  layout: 'share/layout' });
});



app.post('/users/login',function(req, res){
    var currentUser = AV.User.current();
    var username=null;
    if(currentUser)
    {
        console.log(currentUser.getUsername());
        username=currentUser.getUsername();
    }
    AV.User.logIn(req.body.username, req.body.password).then(function() {
        //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
        //跳转到profile页面。
        console.log(req.body.username+"登陆成功")

        console.log('signin successfully: %j', AV.User.current());
        res.redirect('/');
    },function(error) {
        //登录失败，跳转到登录页面
        console.log("登录失败"+error)
        res.render('index',{ message:'登录失败，请重新登录',user:username,layout:'share/layout'});

    });


});
app.get('/users/register', function(req, res) {
    var currentUser = AV.User.current();
    var username=null;
    if(currentUser)
    {
        console.log(currentUser.getUsername());
        username=currentUser.getUsername();
    }
    res.render('users/register', { title: 'Express',message:"",user:username ,  layout: 'share/layout' });
});



app.post('/users/register',function(req, res){
    var user=new AV.User();
    user.set("username",req.body.username);
    user.set("password",req.body.password);
    user.set("email", req.body.email);
    user.signUp(null, {
            success: function(user) {
                res.redirect('/');
            },
            error: function(user, error) {
                // Show the error message somewhere and let the user try again.
                res.render('users/register',{ message:error.message});
            }}
    );
});

app.get('/users/logoff', function(req, res) {
    AV.User.logOut();
    res.redirect('/');
});


app.post('/login', function(req, res) {

    AV.User.logIn(req.body.username, req.body.password).then(function() {
        //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
        //跳转到profile页面。
        console.log("成哥")

        console.log('signin successfully: %j', AV.User.current());
        res.redirect('/');
    },function(error) {
        //登录失败，跳转到登录页面
        console.log("shibai")
        res.render('index',{ message:'登录失败，请重新登录',layout:'share/layout'});

    });
});



app.get('/roads/list', function (req, res) {
    var currentUser = AV.User.current();
    var username=null;
    if(currentUser)
    {
        console.log(currentUser.getUsername());
        username=currentUser.getUsername();
    }
    if(currentUser)
    {
        var roads = new Array();

        var Road = AV.Object.extend("Road");
        var query = new AV.Query(Road);
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
                res.render('roads/list', {roads: roads,user:username , layout: 'share/layout'});
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }
    else
    {
        res.redirect('/users/login');
    }





});


app.get('/roads/index', function (req, res) {
    res.render('roads/index', {title: '路线', layout: 'share/layout'});
});

app.get('/roads/details/:id', function (req, res) {
    var currentUser = AV.User.current();
    var username;
    if(currentUser)
    {
        username=currentUser.getUsername();
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
                query.find({
                    success: function (results) {
                        //alert("Successfully retrieved " + results.length + " scores.");
                        // Do something with the returned AV.Object values
                        for (var i = 0; i < results.length; i++) {
                            var object = results[i];

                            var point = new Object();
                            point.id = object.id;
                            point.title = object.get('Title');
                            point.content = object.get('Content');
                            points.push(point);
                            //console.log(points);


                        }
                        res.render('roads/details', {
                            title: title,
                            user:username ,
                            content: content,
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
    else
    {
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
            query.find({
                success: function (results) {
                    //alert("Successfully retrieved " + results.length + " scores.");
                    // Do something with the returned AV.Object values
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];

                        var point = new Object();
                        point.id = object.id;
                        point.title = object.get('Title');
                        point.content = object.get('Content');
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
    road.set("RoadTitle", req.body.title);
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
    road.set("Title", req.body.InputTitle);
    road.set("Content", req.body.InputContent);
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
            road.set("Title", req.body.Title);
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
            road.set("Content", req.body.Content);
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

app.post('/roads/uploadroadimage', function(req, res) {


    console.log(req.body.RoadID);

    var files = [].concat(req.files);

    // console.log(files[0].file.path);



    for(var i = 0; i < files.length; i++){
        var  file = files[i].file;

        var data=fs.readFileSync(file.path);
        // console.log(data);
        //var base64Data = data.toString('base64');
        //var theFile = new AV.File(file.originalFilename, {base64: base64Data});
        var theFile = new AV.File(file.originalFilename,data);




        theFile.save();

        var Road_Image = AV.Object.extend("Road_Image");
        var road_img=new Road_Image();
        road_img.set("RoadId",req.body.RoadID);
        road_img.set("Image",theFile);
        road_img.save();


    }

    //var data=fs.readFileSync(req.files.username.path);
    //console.log(data);
    res.send("true");
});
app.get('/roads/getroadfirstimage/:id', function(req, res) {


    var Road_Image = AV.Object.extend("Road_Image");
    var queryimg = new AV.Query(Road_Image);
    queryimg.equalTo("RoadId",req.params.id);
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
app.post('/points/pointadd', function(req, res) {

    var Point = AV.Object.extend("Point");
    var point=new Point();


    point.set("RoadId",req.body.RoadId);
    point.set("Title",req.body.InputTitle);
    point.set("Content",req.body.InputContent);
    point.save(null, {
            success: function(point) {
                //res.send('true');
                res.redirect("/roads/details/"+req.body.RoadId);
            },
            error: function(point, error) {
                res.send('添加失败');
            }}
    );
});

/* 修改站点标题 */
app.post('/points/editpointtitle', function(req, res) {

    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointID, {
        success: function(point) {
            // The object was retrieved successfully.
            point.set("Title", req.body.Title);
            point.save();
            res.send('true');
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});

/* 修改站点内容 */
app.post('/points/editpointcontent', function(req, res) {

    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointID, {
        success: function(point) {
            // The object was retrieved successfully.
            point.set("Content", req.body.Content);
            point.save();
            res.send('true');
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});



app.post('/points/uploadpointimage', function(req, res) {

    // var aaaa=req.query.pointid;
    console.log(req.body.PointID);

    var files = [].concat(req.files);

    // console.log(files[0].file.path);



    for(var i = 0; i < files.length; i++){
        var  file = files[i].file;

        var data=fs.readFileSync(file.path);
        // console.log(data);
        //var base64Data = data.toString('base64');
        //var theFile = new AV.File(file.originalFilename, {base64: base64Data});
        var theFile = new AV.File(file.originalFilename,data);




        theFile.save();

        var Point_Image = AV.Object.extend("Point_Image");
        var point_img=new Point_Image();
        point_img.set("PointId",req.body.PointID);
        point_img.set("Image",theFile);
        point_img.save();


    }

    //var data=fs.readFileSync(req.files.username.path);
    //console.log(data);
    res.send("true");
});


app.get('/points/getpointimage/:id', function(req, res) {


    //var imgid=req.params.id;
    var pointimgs=new Array();
    var Point_Image = AV.Object.extend("Point_Image");
    var query = new AV.Query(Point_Image);
    query.equalTo("PointId",req.params.id);
    query.find({
        success: function(results) {
            //alert("Successfully retrieved " + results.length + " scores.");
            // Do something with the returned AV.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                var pointimage=new Object();
                pointimage.id=object.id;
                pointimage.image=object.get('Image');
                pointimgs.push(pointimage);


                console.log(pointimage.image.url())

            }

        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });

});
app.get('/points/getpointfirstimage/:id', function(req, res) {


    var Point_Image = AV.Object.extend("Point_Image");
    var queryimg = new AV.Query(Point_Image);
    queryimg.equalTo("PointId",req.params.id);
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
app.post('/points/setpositon', function(req, res) {

    console.log(req.body.pointpositionpointid);
    console.log(req.body.pointpositionlongitude);
    console.log(req.body.pointpositionlatitude);
    console.log(req.body.pointpositioninput);

    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.pointpositionpointid, {
        success: function(point) {
            // The object was retrieved successfully.
            console.log(point)
            point.set("Longitude", req.body.pointpositionlongitude);
            point.set("Latitude", req.body.pointpositionlatitude);
            point.set("Address", req.body.pointpositioninput);
            point.save();
            res.send('true');
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a AV.Error with an error code and description.
            res.send('false');
        }
    });
});
/* 删除站点 */
app.post('/points/deletepoint', function(req, res) {
    var Point = AV.Object.extend("Point");
    var query = new AV.Query(Point);
    query.get(req.body.PointID, {
        success: function(point) {
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
                success: function(myObject) {
                    res.send('true');
                },
                error: function(myObject, error) {
                    res.send('false');
                }});

        },
        error: function(object, error) {

            res.send('false');
        }
    });
});

/* 删除路线*/
app.post('/roads/deleteroad', function(req, res) {

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
        success: function(road) {

            road.destroy({
                success: function(myObject) {
                    res.send('true');
                },
                error: function(myObject, error) {
                    res.send('false');
                }});
        },
        error: function(object, error) {

            res.send('false');
        }
    });
});


// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
