function isLoggedIn() {
    $.ajax({
        type: "GET",
        dataType: 'JSON',
        url: "/check_login",
    }).done(function (response) {
        console.log(response);
        if (response.already_logged_in) {
            window.location.href = "/map.html";
        } 
    })
};

$("#alert").hide()

$("#loginbtn").on('click', function () {
    console.log("click");
    if ($("#username").val().length == 0 || $("#password").val() == 0) {
        alert("Please input Username and Password first!");
    } else {
        $.ajax({
            type: "POST",
            dataType: 'JSON',
            url: "/login",
            data: {
                username: $("#username").val(),
                password: $("#password").val(),
                rememberme: $("#rememberme").is(':checked'),
                cookie: $("#cookie").is(':checked'),
            },
        }).done(function (response) {
            console.log(response);
            if (response.msg == "Success") {
                window.location.href = "/map.html";
            } else {
                $("#alert").html(response.msg);
                $("#alert").show();
                //    alert(response.msg);
            }
        });
    }
});