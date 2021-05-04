const myForm = document.getElementById('searchForm');
const textInput = document.getElementById('search_term');
const errorDiv = document.getElementById('error');
const myUl = document.getElementById('showList');
const divElem = document.getElementById('show');

(function ($) {
  if (myForm) {
    myForm.addEventListener('submit', (event) => {
      event.preventDefault();

      if (textInput.value.trim()) {
        errorDiv.hidden = true;
        $('#showList').empty();
        $('#show').empty();
        $('#show').hide();
        let pageLaod = {
          method: 'GET',
          url: ' http://api.tvmaze.com/search/shows?q=' + textInput.value,
        };
        $.ajax(pageLaod).then(function (responseMessage) {
          const html = `<div id="addHeader" style="display: none;">Movies</div>`;
          $("#showList").append(html);
          $("#addHeader").show();
          responseMessage.map((e) => {
            $('#showList').show();
            let li = document.createElement('li');
            li.innerHTML = `<a href="">${e.show.name}</a> <a href="" class="addButton" id="${e.show.name}">Add</a>`;
            li.setAttribute('class', 'libody');
            myUl.appendChild(li);
          });
        });
        myForm.reset();
        textInput.focus();
      } else {
        textInput.value = '';
        $('#showList').empty();
        $('#showList').hide();
        errorDiv.hidden = false;
        errorDiv.innerHTML = 'You must enter a value';
        textInput.focus();
      }
    });
  }

  $(document).ready(function () {
    $(document).on('click', 'ul li a', function (event) {
      event.preventDefault();
            $("#showList").hide();
            $("#show").empty();
            $("#show").show();
      let urll = $(this).attr('id');
      let pageLaod = {
        method: 'GET',
        url: 'http://api.tvmaze.com/search/shows?q=' + urll,
      };
      $.ajax(pageLaod).then(function (responseMessage) {
         $("#addHeader2").show();
            let html = 
             `<form method="POST" id="movieForm">` +
            `<h1>${urll}</h1>` +
            `<hr>`+
            `<label for="Status">Status<span>*</span> : </label>`+
            `<select name="status" id="Status" class ="inputtext" required>
            <option value="0">Select status</option>
            <option value="1">Currently Watching</option>
            <option value="2">Completed</option>
            <option value="3">On-Hold</option>
            </select>` +
            `<br/>`+
            `<label for="score">Score<span>*</span> : </label>`+
            `<select name="score" id="score" class ="inputtext" required>
            <option value="0">Select score</option>
            <option value="10">(5) Masterpiece</option>
            <option value="9">(4) Great</option>
            <option value="8">(3) Very Good</option>
            <option value="7">(2) Good</option>
            <option value="6">(1) Fine</option>
            </select>`+
            `<br/>`+
            `<button type="submit" id="addButton1" >Add</button>`+
            `<button type="submit" id="addButton2">Cancel</button>`+
            `</form>`;
            $("#show").append(html);
        });
      });
    });


    $(document).ready(function () {
        $(document).on('click', '#addButton2', function (event) {
            event.preventDefault();
            $("#addHeader2").hide();
            $("#show").hide();
            $("#showList").show(); 
         });
    });
   
})(window.jQuery);
