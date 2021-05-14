$(document).ready(function () {
  $('.rateContainer .userRatingContainer #like').on('click', 'svg', function () {
    const likeId = this.id;

    const isUserLoggedIn = document.querySelector('#like').getAttribute('data-value');
    if (isUserLoggedIn === 'false') {
      alert('You need to login to like/dislike comment');
      return;
    }
    const commentId = $(this).attr('value');
    $(`#${likeId}`).attr('class', 'fas fa-thumbs-up');

    const requestConfig = {
      method: 'POST',
      url: '/commentRating',
      datatype: 'application/json',
      data: {
        commentId: commentId,
        status: 'like',
      },
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          location.reload();
        } else {
          $(`#${likeId}`).attr('class', 'far fa-thumbs-up');
          alert('Something went wrong');
        }
      })
      .catch((error) => {
        $(`#${likeId}`).attr('class', 'far fa-thumbs-up');
        if (typeof error?.responseJSON?.message === 'string' && error?.responseJSON?.message) {
          alert(error?.responseJSON?.message);
        } else {
          alert('Something went wrong');
        }
      });
  });
});

$(document).ready(function () {
  $('.rateContainer .userRatingContainer #alreadyliked').on('click', 'svg', function () {
    const alreadyLikedId = this.id;
    const isUserLoggedIn = document.querySelector('#alreadyliked').getAttribute('data-value');
    if (isUserLoggedIn === 'false') {
      alert('You need to login to like/dislike comment');
      return;
    }
    const commentId = $(this).attr('value');
    $(`#${alreadyLikedId}`).attr('class', 'far fa-thumbs-up');

    const requestConfig = {
      method: 'DELETE',
      url: '/commentRating/' + commentId,
      datatype: 'application/json',
      data: {
        status: 'like',
      },
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          location.reload();
        } else {
          $(`#${alreadyLikedId}`).attr('class', 'fas fa-thumbs-up');
          alert('Something went wrong');
        }
      })
      .catch((error) => {
        $(`#${alreadyLikedId}`).attr('class', 'fas fa-thumbs-up');
        if (typeof error?.responseJSON?.message === 'string' && error?.responseJSON?.message) {
          alert(error?.responseJSON?.message);
        } else {
          alert('Something went wrong');
        }
      });
  });
});

$(document).ready(function () {
  $('.rateContainer .userRatingContainer #alreadydisliked').on('click', 'svg', function () {
    const alreadyDislikedId = this.id;
    const isUserLoggedIn = document.querySelector('#alreadydisliked').getAttribute('data-value');
    if (isUserLoggedIn === 'false') {
      alert('You need to login to like/dislike comment');
      return;
    }
    const commentId = $(this).attr('value');
    $(`#${alreadyDislikedId}`).attr('class', 'fas fa-thumbs-down');

    const requestConfig = {
      method: 'DELETE',
      url: '/commentRating/' + commentId,
      datatype: 'application/json',
      data: {
        status: 'dislike',
      },
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          location.reload();
        } else {
          $(`#${alreadyDislikedId}`).attr('class', 'far fa-thumbs-down');
          alert('Something went wrong');
        }
      })
      .catch((error) => {
        $(`#${alreadyDislikedId}`).attr('class', 'far fa-thumbs-down');
        if (typeof error?.responseJSON?.message === 'string' && error?.responseJSON?.message) {
          alert(error?.responseJSON?.message);
        } else {
          alert('Something went wrong');
        }
      });
  });
});

$(document).ready(function () {
  $('.rateContainer .userRatingContainer #dislike').on('click', 'svg', function () {
    const dislikeId = this.id;

    const isUserLoggedIn = document.querySelector('#dislike').getAttribute('data-value');

    if (isUserLoggedIn === 'false') {
      alert('You need to login to like/dislike comment');
      return;
    }
    const commentId = $(this).attr('value');
    $(`#${dislikeId}`).attr('class', 'fas fa-thumbs-down');

    const requestConfig = {
      method: 'POST',
      url: '/commentRating',
      datatype: 'application/json',
      data: {
        commentId: commentId,
        status: 'dislike',
      },
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          location.reload();
        } else {
          $(`#${dislikeId}`).attr('class', 'far fa-thumbs-down');
          alert('Something went wrong');
        }
      })
      .catch((error) => {
        $(`#${dislikeId}`).attr('class', 'far fa-thumbs-down');
        if (typeof error?.responseJSON?.message === 'string' && error?.responseJSON?.message) {
          alert(error?.responseJSON?.message);
        } else {
          alert('Something went wrong');
        }
      });
  });
});

$(document).ready(function () {
  $('#addComment').on('submit', function (event) {
    event.preventDefault();
    const comment = commentBody?.value;
    const url = window.location.pathname;
    const movieId = url.substring(url.lastIndexOf('/') + 1);

    const requestConfig = {
      method: 'POST',
      url: '/comment/add',
      datatype: 'application/json',
      data: {
        message: comment,
        movieId: movieId,
      },
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          location.reload();
        } else {
          alert('Something went wrong');
        }
      })
      .catch((error) => {
        if (typeof error?.responseJSON?.message === 'string' && error?.responseJSON?.message) {
          alert(error?.responseJSON?.message);
        } else {
          alert('Something went wrong');
        }
      });
  });

  $('#deleteComment button').on('click', function (event) {
    event.preventDefault();

    const commentId = $(this).attr('value');

    const requestConfig = {
      method: 'DELETE',
      url: '/comment/' + commentId,
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          location.reload();
        } else {
          alert('Something went wrong');
        }
      })
      .catch((error) => {
        if (typeof error?.responseJSON?.message === 'string' && error?.responseJSON?.message) {
          alert(error?.responseJSON?.message);
        } else {
          alert('Something went wrong');
        }
      });
  });
});
