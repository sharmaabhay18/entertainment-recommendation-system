const myForm = document.getElementById('searchForm');
const textInput = document.getElementById('search_term');
const errorDiv = document.getElementById('error');
const myUl = document.getElementById('showList');
const divElem = document.getElementById('show');

(function ($) {
  if (myForm) {
    myForm.addEventListener('submit', (event) => {
      let enteredVal = textInput.value;
      event.preventDefault();

      if (textInput.value.trim()) {
        errorDiv.hidden = true;
        $('#showList').empty();
        $('#show').empty();
        $('#show').hide();
        let pageLaod = {
          method: 'GET',
          url: ' /movies/search?searchTerm=' + textInput.value,
        };

        $.ajax(pageLaod).then(function (responseMessage) {
          if (responseMessage.movies.length !== 0) {
            const html = `<div id="addHeader" style="display: none;">Movies</div>`;
            $('#showList').append(html);
            $('#addHeader').show();
            responseMessage.movies.map((e) => {
              let release_dateCheck = e.release_date ? e.release_date : 'NA';
              $('#showList').show();
              let li = document.createElement('li');
              li.innerHTML =
                `<a href="">${e.title}</a>` +
                `<p><strong>Release Date : </strong>${release_dateCheck}<p>` +
                `<a href="" class="addButton" id="${e.title}">Add</a>`;
              li.setAttribute('class', 'libody');
              myUl.appendChild(li);
            });
          } else {
            $('#showList').empty();
            $('#showList').hide();
            errorDiv.hidden = false;
            errorDiv.innerHTML = 'No result found for ' + enteredVal;
            textInput.focus();
          }
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
      $('#showList').hide();
      $('#show').empty();
      $('#show').show();
      let urll = $(this).attr('id');
      let pageLaod = {
        method: 'GET',
        url: '/movies/search?searchTerm=' + urll,
      };
      $.ajax(pageLaod).then(function (responseMessage) {
        let exId = 0;
        responseMessage.movies.map((e) => {
          if (e.title == urll) {
            exId += e.id;
          }
        });
        $('#addHeader2').show();
        let html =
          `<form method="POST" id="movieForm">` +
          `<h1>${urll}</h1>` +
          `<hr>` +
          `<label for="Status">Status<span>*</span> : </label>` +
          `<select name="status" id="status" class ="inputtext" required>
          <option value="0">Select status</option>
          <option value="inprogress">Currently Watching</option>
          <option value="completed">Completed</option>
          <option value="onhold">On-Hold</option>
          <option value="dropped">Dropped</option>
          <option value="plantowatch">Plan to Watch</option>
          </select>` +
          `<br/>` +
          `<label for="score">Rating<span>*</span> : </label>` +
          `<select name="score" id="rating" class ="inputtext" required>
            <option value="0">Select score</option>
            <option value="5">(5) Masterpiece</option>
            <option value="4">(4) Great</option>
            <option value="3">(3) Very Good</option>
            <option value="2">(2) Good</option>
            <option value="1">(1) Fine</option>
            </select>` +
          `<br/>` +
          `<button type="submit" class="addButton1" id="${exId}" >Add</button>` +
          `<button type="submit" id="addButton2">Cancel</button>` +
          `</form>`;
        $('#show').append(html);
      });
    });
  });

  $(document).ready(function () {
    $(document).on('click', '#addButton2', function (event) {
      event.preventDefault();
      $('#addHeader2').hide();
      $('#show').hide();
      $('#showList').show();
    });
  });

  $(document).ready(function () {
    $(document).on('click', '.addButton1', function (event) {
      event.preventDefault();
      $('#addHeader2').hide();
      $('#show').hide();
      $('#showList').hide();
      let newExternalId = $(this).attr('id');
      let newStatus = $('#status').val();
      let newRating = $('#rating').val();
      if (newStatus != 0 && newRating != 0) {
        const requestConfig = {
          method: 'POST',
          url: '/movies/add-movie',
          contentType: 'application/json',
          data: JSON.stringify({
            status: newStatus,
            externalId: newExternalId,
            rating: newRating,
          }),
        };
        $.ajax(requestConfig)
          .then(function (responseMessage) {
            window.location.href = '/addList';
          })
          .catch((error) => {
            if (
              error?.responseJSON?.message &&
              typeof error?.responseJSON?.message === 'string' &&
              error?.responseJSON?.message.length !== 0
            ) {
              alert(error.responseJSON.message);
            } else {
              alert('Something went wrong');
            }
            window.location.href = '/addList/addMovie';
          });
      } else {
        event.preventDefault();
        alert('Please provide all required fields');
        $('#addHeader2').show();
        $('#show').show();
      }
    });
  });
})(window.jQuery);
