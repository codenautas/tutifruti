"use script";

window.addEventListener("load", function(){
    var checkboxs=document.getElementsByClassName("tutifruti-listo");
    Array.prototype.forEach.call(checkboxs,function(checkbox){
        checkbox.addEventListener("click",function(event){
            var infoPk=JSON.parse(this.getAttribute("tutifruti-pk"));
            var tdCorrespondiente=document.getElementById("categoria_"+infoPk.categoria);
            if(!tdCorrespondiente.textContent && this.checked){
                this.checked=false;
            }
            tdCorrespondiente.contentEditable=!this.checked;
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