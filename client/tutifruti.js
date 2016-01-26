"use script";

function desHabilitarTodo(){
    var checkboxs=document.getElementsByClassName("tutifruti-listo");
    document.getElementById("boton-parar").disabled=true;
    Array.prototype.forEach.call(checkboxs,function(checkbox){
        checkbox.disabled=true;
        var infoPk=JSON.parse(checkbox.getAttribute("tutifruti-pk"));
        var tdCorrespondiente=document.getElementById("categoria_"+infoPk.categoria);
        tdCorrespondiente.contentEditable=false;
    });
}


var ManoActual='no se';

window.addEventListener("load", function(){
    consola.textContent+='\nanda la consola';
    var checkboxs=document.getElementsByClassName("tutifruti-listo");
    Array.prototype.forEach.call(checkboxs,function(checkbox){
      //  consola.textContent+='\n encontro los checkboxes';
        checkbox.addEventListener("click",function(event){
        //    consola.textContent+='\n recibe el click';
            var infoPk=JSON.parse(this.getAttribute("tutifruti-pk"));
            var tdCorrespondiente=document.getElementById("categoria_"+infoPk.categoria);
            if(!tdCorrespondiente.textContent && this.checked){
                this.checked=false;
            }
            tdCorrespondiente.contentEditable=!this.checked;
            consola.textContent+='\n está por enviar el ajax';
            AjaxBestPromise.post({
                url:'services/play',
                data:{ info:JSON.stringify({
                    pk: infoPk,
                    operacion: this.checked?'JUGAR':'BORRAR',
                    palabra:tdCorrespondiente.textContent 
                })}
            }).then(function(result){
                consola.textContent+='\n'+result;
            }).catch(function(err){
                consola.textContent+='\n'+err;
            });
        });
    });
    setInterval(function(){
        AjaxBestPromise.post({
            url:'services/status',
            data:{}
        }).then(JSON.parse).then(function(result){
            if(ManoActual==='no se'){
                ManoActual=result.mano;
            }else if(ManoActual!=result.mano){
                history.go(0);
            }
            if(result.jugando){
                document.getElementById("cantidad-jugadores").textContent=result.cant_jugadores;
                result.jugadas.forEach(function(categoria){
                    var e=document.getElementById("status_"+categoria.categoria).textContent=categoria.cant_jugadas;
                });
                document.getElementById("la-letra").textContent=result.letra;
            }else{
                document.getElementById("nueva-mano").style.visibility='visible';
                desHabilitarTodo();
            }
        }).catch(function(err){
            consola.textContent+='\nERR: '+err.stack;
        });
    }, 1000);
    document.getElementById("nueva-mano").addEventListener("click", function(){
        document.getElementById("nueva-mano").textContent="empezando";
        AjaxBestPromise.post({
            url:'services/new',
            data:{}
        }).then(function(result){
            history.go(0);
        }).catch(function(err){
            consola.textContent+='\n'+err;
        });
    });
    document.getElementById("boton-parar").addEventListener("click", function(){
        desHabilitarTodo();
        AjaxBestPromise.post({
            url:'services/stop',
            data:{}
        }).then(function(result){
            consola.textContent+='\n'+result;
        }).catch(function(err){
            consola.textContent+='\n'+err;
        });
    });
    var checkBoxsPuntos=document.getElementsByClassName("tuti-fruti-vale");
    Array.prototype.forEach.call(checkBoxsPuntos,function(checkbox){
        var infoPk=JSON.parse(checkbox.getAttribute("tutifruti-pk"));
        var divCorrespondiente=document.getElementById("puntosPalabra_"+infoPk.categoria);
        divCorrespondiente.textContent=0;
        checkbox.addEventListener("click",function(event){
            divCorrespondiente.contentEditable=true;
            if(this.checked==false){
                divCorrespondiente.textContent=0;
                divCorrespondiente.setAttribute("contentEditable", false);
            }
        });
    });
});