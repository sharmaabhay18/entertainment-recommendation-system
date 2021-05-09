var userList = [];
var emailList = [];
var isUsernameMatch = false;
var isEmailMatch = false;

$(document).ready(function () {
  $('#login-button').click(function () {
    var $modalEle = $('.landing-container');
    if ($modalEle.hasClass('landing-container-hide')) {
      $modalEle.removeClass('landing-container-hide');
      $modalEle.addClass('landing-container-show');
      setTimeout(() => {
        $modalEle.removeClass('landing-container-hide-visiual');
      }, 20);
    }
  });

  $('.loading-form-close').click(function () {
    var $modalEle = $('.landing-container');
    let temp = document.getElementsByClassName('landing-container')[0];
    if ($modalEle.hasClass('landing-container-show')) {
      $modalEle.removeClass('landing-container-show');
      $modalEle.addClass('landing-container-hide-visiual');
      temp.addEventListener(
        'transitionend',
        function (e) {
          $modalEle.addClass('landing-container-hide');
        },
        {
          capture: false,
          once: true,
          passive: false,
        }
      );
    }
  });

  $.ajax({
    url: '/users/username',
    success: function (result) {
      userList = Object.assign(userList, result);
    },
  });
  $.ajax({
    url: '/users/emailId',
    success: function (result) {
      emailList = Object.assign(emailList, result);
    },
  });
});

var loginFields = '#login-username, #login-password';

$(loginFields).on('change', function () {
  if (allFilled(loginFields)) {
    $('#login-submit').removeAttr('disabled');
  } else {
    $('#login-submit').attr('disabled', 'disabled');
  }
});

function checkIfFilled() {
  if (allFilled(signUpFields)) {
    $('#signup-submit').removeAttr('disabled');
  } else {
    $('#signup-submit').attr('disabled', 'disabled');
  }
}

var signUpFields = '#username, #firstname, #lastname, #email, #password';

$(signUpFields).on('change', function () {
  checkIfFilled();
});

function allFilled(fields) {
  var filled = true;
  $(fields).each(function () {
    if ($(this).val() == '') {
      filled = false;
    }
    if ($(this).attr('name') == 'password') {
      if ($(this).val().length < 5) {
        filled = false;
      }
    }
    if ($(this).attr('name') == 'username') {
      if ($(this).val().length < 3) {
        filled = false;
      }
    }
    if (isUsernameMatch) {
      filled = false;
    }
    if (isEmailMatch) {
      filled = false;
    }
  });
  return filled;
}

function toggleForm() {
  var $loginEle = $('.login-page');
  var $signUpEle = $('.signup-page');

  if ($loginEle.hasClass('landing-container-hide')) {
    $loginEle.removeClass('landing-container-hide');
    $signUpEle.addClass('landing-container-hide');
  } else {
    $signUpEle.removeClass('landing-container-hide');
    $loginEle.addClass('landing-container-hide');
  }
}

$('#loginForm').on('submit', function () {
  $('#login-submit').attr('disabled', 'disabled');
  // TODO do something here to show user that form is being submitted
  // fetch(event.target.action, {
  //   method: 'POST',
  //   body: new URLSearchParams(new FormData(event.target)), // event.target is the form
  // }).then(
  //   (resp) => {
  //     console.log(resp); // or resp.text() or whatever the server sends
  //     if (resp.status === 400) {
  //       $('#login-submit').removeAttr('disabled');
  //       alert('Wrong password');
  //     }
  //     if (resp.status === 404) {
  //       $('#login-submit').removeAttr('disabled');
  //       alert('User not found');
  //     }
  //   },
  //   (error) => {
  //     console.log(error);
  //   }
  // );
  let data = {
    username: $('#login-username').val(),
    password: $('#login-password').val()
  }
  $.ajax({
    type: 'POST',
    url: '/users/login',
    headers: {
        "Content-Type": "application/json"
    },
    data: JSON.stringify(data),
    dataType: "json",
    success: function(data) {
      alert('Login successfull')
    },
    error: function(error) {
    }
})
});

$('#registerForm').on('submit', function () {
  $('#signup-submit').attr('disabled', 'disabled');
  // TODO do something here to show user that form is being submitted
  fetch(event.target.action, {
    method: 'POST',
    body: new URLSearchParams(new FormData(event.target)), // event.target is the form
  }).then((resp) => {
    console.log(resp); // or resp.text() or whatever the server sends
    if (resp.status === 400) {
      $('#signup-submit').removeAttr('disabled');
      alert('Something went wrong');
    }
    if (resp.status === 404) {
      $('#signup-submit').removeAttr('disabled');
      alert('Something went wrong');
    }
  });
});

$('#username').keyup(function () {
  let inputValue = $('#username').val();
  if (userList.find((ele) => ele == inputValue)) {
    $('#signup-submit').attr('disabled', 'disabled');
    isUsernameMatch = true;
    alert('User name already exist');
  } else {
    isUsernameMatch = false;
    checkIfFilled();
  }
});

$('#email').keyup(function () {
  let inputValue = $('#email').val();
  if (emailList.find((ele) => ele == inputValue)) {
    $('#signup-submit').attr('disabled', 'disabled');
    isEmailMatch = true;
    alert('Email Id already exist');
  } else {
    isEmailMatch = false;
    checkIfFilled();
  }
});
