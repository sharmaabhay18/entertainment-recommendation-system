$(document).ready(function () {
  $('#like svg').click(function () {
    const likeId = this.id;
    const commentId = $(this).attr('value');
    $(`#${likeId}`).attr('class', 'fas fa-thumbs-up');
    const url = window.location.pathname;
    const movieId = url.substring(url.lastIndexOf('/') + 1);

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
          window.location.href = '/movies/' + movieId;
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
  $('#alreadyliked svg').click(function () {
    const alreadyLikedId = this.id;
    const commentId = $(this).attr('value');
    $(`#${alreadyLikedId}`).attr('class', 'far fa-thumbs-up');
    const url = window.location.pathname;
    const movieId = url.substring(url.lastIndexOf('/') + 1);

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
          window.location.href = '/movies/' + movieId;
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
  $('#alreadydisliked svg').click(function () {
    const alreadyDislikedId = this.id;
    const commentId = $(this).attr('value');
    $(`#${alreadyDislikedId}`).attr('class', 'fas fa-thumbs-down');
    const url = window.location.pathname;
    const movieId = url.substring(url.lastIndexOf('/') + 1);

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
          window.location.href = '/movies/' + movieId;
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
  $('#dislike svg').click(function () {
    const dislikeId = this.id;
    const commentId = $(this).attr('value');
    $(`#${dislikeId}`).attr('class', 'fas fa-thumbs-down');
    const url = window.location.pathname;
    const movieId = url.substring(url.lastIndexOf('/') + 1);

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
          window.location.href = '/movies/' + movieId;
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
          window.location.href = '/movies/' + movieId;
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

  $('#deleteComment').click(function (event) {
    event.preventDefault();

    const url = window.location.pathname;
    const movieId = url.substring(url.lastIndexOf('/') + 1);

    const commentId = $(this).attr('value');
    const requestConfig = {
      method: 'DELETE',
      url: '/comment/' + commentId,
    };

    $.ajax(requestConfig)
      .then(function (res) {
        if (res?.status) {
          window.location.href = '/movies/' + movieId;
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
