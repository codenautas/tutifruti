"use script";

window.addEventListener("load", function(){
    var checkboxs=document.getElementsByClassName("tutifruti-listo");
    Array.prototype.forEach.call(checkboxs,function(checkbox){
        checkbox.addEventListener("click",function(event){
            var info=JSON.parse(this.getAttribute("tutifruti-pk"));
            var tdCorrespondiente=document.getElementById("categoria_"+info.categoria);
            if(!tdCorrespondiente.textContent && this.checked){
                this.checked=false;
            }
            tdCorrespondiente.contentEditable=!this.checked;
        });
    });
});