$(function () {
  var userid = "";
  var path = window.location.href;
  console.log(path);
  const socket = io(path);

  socket.on("connect", () => {
    userid = socket.id;
    console.log(userid);
  });

  socket.on("status", (msg)=>{
    switch (msg) {
      case 'qrcode':
        Toast.fire({
          icon: 'success',
          title: 'Please scan QR'
        })
        break;
      case 'success':
        Toast.fire({
          icon: 'success',
          title: 'Whatsapp connected successfuly'
        })
        break;
      case 'failed':
        Toast.fire({
          icon: 'error',
          title: 'Token expired'
        })
        break;
      default:
        break;
    }
  })

  socket.on('qrcode', (msg)=>{
    $('#qrcode').html(`
    <img src="data:image/png;base64, ${msg}">
    `);
  })

  $('#btnlogin').on('click', ()=>{
    var user_id = $('#oldkey').val();
    if(user_id == '')
    {
      user_id = userid;
    }
    var password = $('#password').val();
    $.ajax({
      url: path+'create',
      method: 'post',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        socket_id: userid,
        user_id: user_id,
        password: password
      }),
      success: (res)=>{
        console.log(res)
        $('#qrcode').empty();
      },
      error: (err)=>{
        var error = JSON.parse(err.responseText)
        Toast.fire({
          icon: 'error',
          title: error.desc
        })
      }
    })
  })
});
