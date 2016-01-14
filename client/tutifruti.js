"use script";

window.addEventListener("load", function(){
    consola.textContent+='\nanda la consola';
    var checkboxs=document.getElementsByClassName("tutifruti-listo");
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
                url:'service',
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
});