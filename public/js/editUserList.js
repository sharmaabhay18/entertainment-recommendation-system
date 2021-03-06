const myForm1 = document.getElementById('editForm');

const getUrlParameter = function getUrlParameter(sParam) {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
};

(function ($) {
  if (myForm1) {
    myForm1.addEventListener('submit', (event) => {
      event.preventDefault();

      const newExternalId = getUrlParameter('id').replace(/['"]+/g, '');
      const newStatus = $('#editStatus').val();
      const newRating = $('#editRating').val();
      if (newStatus != 0 || newRating != 0) {
        let requestConfig = {};
        if (newStatus == 0) {
          requestConfig = {
            method: 'PATCH',
            url: '/movies/update',
            contentType: 'application/json',
            data: JSON.stringify({
              externalId: newExternalId,
              rating: newRating,
            }),
          };
        } else if (newRating == 0) {
          requestConfig = {
            method: 'PATCH',
            url: '/movies/update',
            contentType: 'application/json',
            data: JSON.stringify({
              status: newStatus,
              externalId: newExternalId,
            }),
          };
        } else {
          requestConfig = {
            method: 'PATCH',
            url: '/movies/update',
            contentType: 'application/json',
            data: JSON.stringify({
              status: newStatus,
              externalId: newExternalId,
              rating: newRating,
            }),
          };
        }

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
            window.location.href = '/addList';
          });
      } else {
        event.preventDefault();
        alert('Please provide all required fields');
      }
    });
  }

  $(document).ready(function () {
    $(document).on('click', '#plantowatch', function (event) {
      event.preventDefault();
      window.location.href = '/addList?status=plantowatch';
    });
    $(document).on('click', '#dropped', function (event) {
      event.preventDefault();
      window.location.href = '/addList?status=dropped';
    });
    $(document).on('click', '#onhold', function (event) {
      event.preventDefault();
      window.location.href = '/addList?status=onhold';
    });
    $(document).on('click', '#completed', function (event) {
      event.preventDefault();
      window.location.href = '/addList?status=completed';
    });
    $(document).on('click', '#inprogress', function (event) {
      event.preventDefault();
      window.location.href = '/addList?status=inprogress';
    });
  });
})(window.jQuery);
