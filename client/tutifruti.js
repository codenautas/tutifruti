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

window.addEventListener("load", function(){
    consola.textContent+='\nanda la consola';
    var checkboxs=document.getElementsByClassName("tutifruti-listo");
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
    Array.prototype.forEach.call(checkboxs,function(checkbox){
        consola.textContent+='\n encontro los checkboxes';
        checkbox.addEventListener("click",function(event){
            consola.textContent+='\n recibe el click';
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
            document.getElementById("cantidad-jugadores").textContent=result.cant_jugadores;
            result.jugadas.forEach(function(categoria){
                var e=document.getElementById("status_"+categoria.categoria).textContent=categoria.cant_jugadas;
            });
            if(!result.jugando){
                desHabilitarTodo();
            }
        }).catch(function(err){
            consola.textContent+='\nERR: '+err;
        });
    }, 1000);
});