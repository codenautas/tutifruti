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


// probar con http://localhost:12348/ajax-example
app.use('/',MiniTools.serveJade('client',true));
app.use('/',MiniTools.serveStylus('client',true));

var serveErr = MiniTools.serveErr;

var mime = extensionServeStatic.mime;

app.use('/',extensionServeStatic('./node_modules/ajax-best-promise/bin', {staticExtensions:'js'}));
app.use('/',extensionServeStatic('./node_modules/es6-promise/dist', {staticExtensions:'js'}));

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
        "DELETE FROM tuti.jugadas WHERE (partida, mano) IN (SELECT partida, mano FROM tuti.manos WHERE estado_mano<>'fin') RETURNING *"
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
        var filaCategorias=[html.th()];
        var filaInputs=[html.td({"class":"letra-grilla", id:'la-letra'})];
        var filaControles=[html.td({"class":"letra-grilla", id:"cantidad-jugadores"})];
        var filaValePalabra=[html.td({"class":"letra-grilla",id:"vale-palabra"})];
        var filasJugadas=[];
        var filasGrilla=[];
        var rowsCategorias;
        var rowsManos;
        var rowsJugadas;
        Promises.start(function(){
            return clientDb.query('SELECT categoria, cate_desc FROM tuti.categorias WHERE partida = $1 ORDER BY categoria',[req.user.partida]).fetchAll();
        }).then(function(resultCategorias){
            rowsCategorias=resultCategorias.rows;
            rowsCategorias.forEach(function(categoria){
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
                filaValePalabra.push(html.td([
                    html.label({"for":'vale_'+categoria.categoria},"vale"),
                    html.input({"class":"tuti-fruti-vale",id:'vale_'+categoria.categoria,type:'checkbox','tutifruti-pk':pk_Json}),
                    html.span({id:'vale_'+categoria.categoria, 'tutifruti-pk':pk_Json}),
                    html.label({"for":'puntosPorPalabra_'+categoria.categoria},"  Puntos:"),
                    html.div({"class":"tutifruti-puntoPorPalabra", id:'puntosPalabra_'+categoria.categoria, contenteditable:false, 'tutifruti-pk':pk_Json}),
                ]));
            });
            filaControles.push(html.td({"class": "fuera-tabla"},[
                html.button({id:'boton-parar'},"parar")
            ]));
            filaValePalabra.push(html.td({"class":"fuera-tabla"},[
                html.button({id:'boton-sumar'},"sumar")
            ]));
            return clientDb.query("SELECT mano, letra, estado_mano FROM tuti.manos WHERE partida = $1 ORDER BY mano",[req.user.partida]).fetchAll();
        }).then(function(resultManos){
            rowsManos=resultManos.rows;
            return clientDb.query(
                "SELECT * FROM tuti.jugadas WHERE partida = $1 AND jugador = $2",
                [req.user.partida, req.user.jugador]
            ).fetchAll()
        }).then(function(resultJugadas){
            var jugadas={};
            var hayUnaManoAbierta=false;
            resultJugadas.rows.forEach(function(jugada){
                jugadas[jugada.mano]=jugadas[jugada.mano]||{};
                jugadas[jugada.mano][jugada.categoria]=jugada.palabra;
            });
            rowsManos.forEach(function(mano){
                if(mano.estado_mano=='fin'){
                    var fila=[html.td({"class":"letra-grilla"},mano.letra)];
                    rowsCategorias.forEach(function(categoria){
                        fila.push(html.td((jugadas[mano.mano]||{})[categoria.categoria]||''));
                    });
                    fila.push(html.td({"class": "fuera-tabla"},[
                html.label({"for":'puntos-totales'},"  Puntos: "),
                html.input({"class":"puntos-totales",id:'puntos-mano-'+mano.mano, contenteditable:true})
            ]));
                    filasJugadas.push(html.tr(fila));
                    
                }else{
                    hayUnaManoAbierta=true;
                    filaInputs.push(html.td({"class": "fuera-tabla"},[
                        html.label({"for":'puntos-totales'},"  Puntos: "),
                        html.input({"class":"puntos-totales",id:'puntos-mano-'+mano.mano, contenteditable:true})
                    ]));
                }
            });
            filasGrilla.push(html.tr(filaCategorias));
            filasGrilla=filasGrilla.concat(filasJugadas);
            //filasGrilla=filasGrilla.concat(filaValePalabra);
            if(hayUnaManoAbierta){
                filasGrilla.push(html.tr(filaInputs    ));
                filasGrilla.push(html.tr(filaControles ));
                filasGrilla=filasGrilla.concat(filaValePalabra);
            }
            var pagina=html.html([
                html.head([
                    html.meta({charset:"UTF-8"}),
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
                        html.table(filasGrilla),
                        html.button({id:'nueva-mano', style:"visibility:hidden"},"empezar")
                    ]),
                    html.pre({id:"consola"}),
                    html.script({src:'tutifruti.js'}),
                    html.script({src:'es6-promise.min.js'}),
                    html.script({src:'ajax-best-promise.js'})
                ])
            ])
            res.end(pagina.toHtmlDoc({title:'tutifruti', pretty:true}));
        }).catch(serveErr(req,res));
    });
    app.use('/services',function(req,res,next){
        clientDb.query(
            "SELECT mano, letra FROM tuti.manos WHERE partida = $1 AND estado_mano<>'fin'", 
            [req.user.partida]
        ).fetchOneRowIfExists().then(function(result){
            req.juego={
                mano_abierta: result.rowCount>0,
                mano: (result.row||{}).mano,
                letra: (result.row||{}).letra
            };
            next();
        }).catch(serveErr(req,res,next));
    });
    app.post('/services/play',function(req,res){
        var info=JSON.parse(req.body.info);
        if(req.user.jugador!=info.pk.jugador || req.user.partida!=info.pk.partida){
            req.end("Hacker detected");
        }else{
            var jugadaParams=[req.user.partida, req.juego.mano, req.user.jugador, info.pk.categoria];
            if(info.operacion=='JUGAR'){
                jugadaParams.push(info.palabra);
                clientDb.query(
                    "INSERT INTO tuti.jugadas (partida, mano, jugador, categoria, palabra) VALUES ($1, $2, $3, $4, $5)",
                    jugadaParams
                ).execute().catch(function(err){
                    if(err.code=='23505'){ //clave duplicada
                        return clientDb.query(
                            "UPDATE tuti.jugadas SET palabra=$5 WHERE partida = $1 AND mano = $2 AND jugador =$3 AND categoria = $4",
                            jugadaParams
                        ).execute();
                    }else{
                        throw err;
                    }
                }).then(function(){
                    res.end('\n registrado '+info.palabra);
                }).catch(function(err){
                    res.end("\n error al intentar jugar: "+info.palabra+". "+err.code+' '+err);
                })
            }else{
                clientDb.query(
                    "DELETE FROM tuti.jugadas WHERE partida = $1 AND mano = $2 AND jugador = $3 AND categoria = $4",
                    jugadaParams
                ).execute().then(function(){
                    res.end('\n borrada');
                }).catch(function(err){
                    res.end("\n error al intentar borrar. "+err.code+' '+err);
                })
            }
        }
    });
    app.post('/services/status',function(req,res){
        var jugadaParams=[req.user.partida, req.juego.mano, req.user.jugador];
        var rta={};
        Promises.start(function(){
            return clientDb.query(
                "SELECT categoria, count(*) as cant_jugadas FROM tuti.jugadas WHERE partida = $1 AND mano = $2 AND jugador <> $3 GROUP BY categoria",
                //"SELECT categoria, count(categoria) as cant_jugadas FROM tuti.jugadas WHERE partida = $1 AND mano = $2 AND jugador <> $3 GROUP BY categoria",
               // "select j.categoria, count(j.categoria) as cant_jugadas from tuti.categorias u left join (select * from tuti.jugadas where mano = $2 ) j on j.partida=u.partida and j.categoria=u.categoria where u.partida= $1 AND j.jugador <> $3 group by j.categoria;",
                jugadaParams
            ).fetchAll();
        }).then(function(resultJugadas){
            rta.jugadas=resultJugadas.rows;
            return clientDb.query(
                "SELECT count(*) as cant_jugadores FROM tuti.jugadores WHERE partida = $1",
                [req.user.partida]
            ).fetchUniqueRow();
        }).then(function(resultJugadores){
            rta.cant_jugadores=resultJugadores.row.cant_jugadores;
            rta.mano=req.juego.mano;
            rta.jugando=req.juego.mano_abierta;
            rta.letra=req.juego.letra;
            res.end(JSON.stringify(rta));
        }).catch(serveErr(req,res));
    });
    app.post('/services/new',function(req,res){
        if(!req.juego.mano_abierta){
            Promises.start(function(){
                var orden=Math.floor(Math.random()*27);
                var letra="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"[orden];
                return clientDb.query(
                    "INSERT INTO tuti.manos (partida, mano, estado_mano, letra) SELECT $3, coalesce(max(mano)+1,1), 'abierta', $2 FROM tuti.manos WHERE partida = $1",
                    [req.user.partida, letra, req.user.partida]
                ).execute();
            }).then(function(){
                res.end("nueva mano");
            }).catch(serveErr(req,res));
        }else{
            res.end("mano finalizada previamente");
        }
    });
    app.post('/services/stop',function(req,res){
        if(req.juego.mano_abierta){
            Promises.start(function(){
                return clientDb.query(
                    "UPDATE tuti.manos SET estado_mano='fin' WHERE partida = $1 AND mano = $2",
                    [req.user.partida, req.juego.mano]
                ).execute();
            }).then(function(){
                res.end("mano finalizada");
            }).catch(serveErr(req,res));
        }else{
            res.end("mano finalizada previamente");
        }
    });
}).catch(function(err){
    console.log('ERROR',err);
    console.log('STACK',err.stack);
    console.log('quizas las partes que dependen de la base de datos no fueron instaladas en su totalidad');
    console.log('***************');
    console.log('REVISE QUE EXISTA LA DB');
});

