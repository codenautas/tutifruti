"use strict";
/*jshint eqnull:true */
/*jshint globalstrict:true */
/*jshint node:true */

// APP

var _ = require('lodash');
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Promises = require('best-promise');
var fs = require('fs-promise');
var pg = require('pg-promise-strict');
var readYaml = require('read-yaml-promise');
var extensionServeStatic = require('extension-serve-static');
var jade = require('jade');
var MiniTools = require('mini-tools');
var loginPlus = require('login-plus');
var changing=require('best-globals').changing;
var html=require('js-to-html').html;

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

loginPlus.init(app,{
    unloggedPath:'client/unlogged', 
    successRedirect: '/hoja',
    // loginPagePath:'client/login'
});

var validExts=[
    'html',
    'jpg','png','gif',
    'css','js','manifest'
];

// app.use('/unlogged',extensionServeStatic('./client2/unlogged', {
//     index: [''], 
//     extensions:[''], 
//     staticExtensions:validExts
// }));

// app.use(session({ secret: 'keyboard cat', resave:false, saveUninitialized:true }));

// probar con http://localhost:12348/ajax-example
app.use('/',MiniTools.serveJade('client',true));
app.use('/',MiniTools.serveStylus('client',true));

var serveErr = MiniTools.serveErr;

var mime = extensionServeStatic.mime;

app.use('/',extensionServeStatic('./node_modules/ajax-best-promise/bin', {staticExtensions:'js'}));

app.use('/',extensionServeStatic('./client', {
    index: ['index.html'], 
    extensions:[''], 
    staticExtensions:validExts
}));

var actualConfig;

var clientDb;

Promises.start(function(){
    return readYaml('global-config.yaml',{encoding: 'utf8'});
}).then(function(globalConfig){
    actualConfig=globalConfig;
    return readYaml('local-config.yaml',{encoding: 'utf8'}).catch(function(err){
        if(err.code!=='ENOENT'){
            throw err;
        }
        return {};
    }).then(function(localConfig){
        _.merge(actualConfig,localConfig);
    });
}).then(function(){
    return new Promises.Promise(function(resolve, reject){
        var server=app.listen(actualConfig.server.port, function(event) {
            console.log('Listening on port %d', server.address().port);
            resolve();
        });
    });
}).then(function(){
    return pg.connect(actualConfig.db);
}).then(function(client){
    console.log("CONECTED TO", actualConfig.db.database);
    clientDb=client;
    clientDb.query(
        "DELETE FROM tuti.jugadas WHERE partida IN (SELECT partida FROM tuti.partidas WHERE estado_partida<>'fin') RETURNING *"
    ).fetchAll().then(function(data){
        console.log('jugadas borradas',data.rows);
    }).catch(function(err){
        console.log(err);
    });
    loginPlus.setValidator(function(username, password, done) {
        clientDb.query(
            "SELECT jugador, partida FROM tuti.jugadores j WHERE jugador=$1 AND j.partida=$2",
            [username, password]
        ).fetchUniqueRow().then(function(data){
            console.log('datos traidos',data.row);
            done(null, changing(data.row,{username:data.row.jugador}));
            console.log('datos enviados',changing(data.row,{username:data.row.jugador}));
        }).catch(function(err){
            console.log('err',err);
            if(err.code==='54011!'){
                done('Error en usuario o clave');
            }else{
                throw err;
            }
        }).catch(function(err){
            console.log('error logueando',err);
            console.log('stack',err.stack);
        }).catch(done);
    });
}).then(function(){
    app.get('/hoja',function(req,res){
        var filaCategorias=[];
        var filaInputs=[];
        var filaControles=[];
        clientDb.query('SELECT categoria, cate_desc FROM tuti.categorias WHERE partida = $1 ORDER BY categoria',[req.user.partida]).fetchAll().then(function(result){
            result.rows.forEach(function(categoria){
                var pk_Json=JSON.stringify({
                    jugador: req.user.jugador,
                    partida: req.user.partida,
                    letra: 'A',
                    categoria: categoria.categoria,
                });
                filaCategorias.push(html.th(categoria.cate_desc));
                filaInputs.push(html.td({"class": "tutifruti-palabra", id:'categoria_'+categoria.categoria, contenteditable:true, 'tutifruti-pk':pk_Json}));
                filaControles.push(html.td([
                    html.label({"for":'listo_'+categoria.categoria}, "Listo"),
                    html.input({"class": "tutifruti-listo", id:'listo_'+categoria.categoria, type:'checkbox', 'tutifruti-pk':pk_Json}),
                    html.span({id:'status_'+categoria.categoria, 'tutifruti-pk':pk_Json}),
                ]));
            })
            var pagina=html.html([
                html.head([
                    html.link({href:'tutifruti.css', rel:'stylesheet', type:"text/css"})
                ]),
                html.body([
                    html.h1('tutifruti'),
                    html.div({"class":'encabezado'},[
                        html.label("partida"), html.span({"class":'partida'},req.user.partida),
                        html.label("jugador"), html.span({"class":'jugador'},req.user.jugador),
                        html.label("letra"), html.span({"class":'letra'},"?"),
                    ]),
                    html.div({"class":'grilla'},[
                        html.table([
                            html.tr(filaCategorias), 
                            html.tr(filaInputs    ), 
                            html.tr(filaControles )
                        ])
                    ]),
                    html.pre({id:"consola"}),
                    html.script({src:'tutifruti.js'}),
                    html.script({src:'ajax-best-promise.js'})
                ])
            ])
            res.end(pagina.toHtmlDoc({title:'tutifruti', pretty:true}));
        }).catch(function(err){
            console.log('error',err);
            throw err;
        }).catch(serveErr);
    });
    app.post('/service',function(req,res){
        res.send(req.body.palabra);
    });
}).catch(function(err){
    console.log('ERROR',err);
    console.log('STACK',err.stack);
    console.log('quizas las partes que dependen de la base de datos no fueron instaladas en su totalidad');
    console.log('***************');
    console.log('REVISE QUE EXISTA LA DB');
});

