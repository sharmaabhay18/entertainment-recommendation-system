const myForm = document.getElementById('searchForm');
const textInput = document.getElementById('search_term');
const errorDiv = document.getElementById('error')
const myUl = document.getElementById('showList');
const divElem = document.getElementById('show');


(function($) {  
    if(myForm){
    myForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        if(textInput.value.trim()){
            errorDiv.hidden = true;
            $("#showList").empty();
            $("#show").empty();
            let pageLaod = {
                method: 'GET',
                url: ' http://api.tvmaze.com/search/shows?q=' + textInput.value
            };
            $.ajax(pageLaod).then(function(responseMessage) {
                responseMessage.map(e =>{
                    $("#showList").show();
                    let li = document.createElement('li'); 
                    li.innerHTML = `<a href="">${e.show.name}</a> <a href="" class="addButton" id="${e.show.name}">Add</a>`; 
                    li.setAttribute("class","libody")
                    myUl.appendChild(li);
                });
            });   
            myForm.reset();
            textInput.focus();
        }else{
            textInput.value = '';
            $("#showList").empty();
            $("#showList").hide();
            errorDiv.hidden = false;
            errorDiv.innerHTML = 'You must enter a value';  
            textInput.focus();
        }
        });
    }

    $(document).ready(function() {
        $(document).on("click","ul li a",function(event) {
            event.preventDefault();
            let urll = $(this).attr('id');
            console.log(urll);
        });
    });
   
})(window.jQuery);