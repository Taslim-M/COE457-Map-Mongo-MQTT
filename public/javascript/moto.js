var current_user_name = "";
function validate() {
    $.ajax({
        type: "GET",
        dataType: 'JSON',
        url: "/validate",
    }).done(function (response) {
        console.log(response);
        if(!response.valid){
            window.location.href = "/unauthorized.html";
            // console.log("invalid");
        }else{
            current_user_name = response.username;
            $("#name").html(response.username);
            if (response.allow_cookie) {
                console.log("cookies allowed");
                //Check if first login
                if (getCookie("last_time")) {
                    last_time_cookie = getCookie("last_time");
                    str = "Welcome back " + current_user_name + "! You last accessed at: " + Date(last_time_cookie).toString();
                    console.log(last_time_cookie);
                    $("#text_add").html(str);

                }//update cookie time for next usage
                setCookie("last_time", Date.now(), 30);


            }
            initMQTT();
        }
    });
}


function toRadians(degrees) {
    return degrees * Math.PI / 180;
};

function rotate(angle) {
    // Source https://stackoverflow.com/questions/20061774/rotate-an-image-in-image-source-in-html 
    console.log(angle);
    var rotate = 'rotate(' + angle + 'deg)';
    console.log(rotate);
    $('img').css({
        '-webkit-transform': rotate,
        '-moz-transform': rotate,
        '-o-transform': rotate,
        '-ms-transform': rotate,
        'transform': rotate
    });
}
function calculate_angle(curent_lat_lng, final_lat_lng) {
    if (curent_lat_lng && final_lat_lng) {
        // Reference https://stackoverflow.com/questions/3932502/calculate-angle-between-two-latitude-longitude-points
        lat2 = toRadians(final_lat_lng.lat);
        long2 = toRadians(final_lat_lng.lng);

        lat1 = toRadians(curent_lat_lng.lat);
        long1 = toRadians(curent_lat_lng.lng);

        dLon = (long2 - long1);

        y = Math.sin(dLon) * Math.cos(lat2);
        x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1)
            * Math.cos(lat2) * Math.cos(dLon);

        var angleRad = Math.atan2(y, x);
        //I want 0 to 360, so convert
        if (angleRad < 0) {
            angleRad += (2 * Math.PI);
        }
        var angleDeg = angleRad * 180 / Math.PI;
        return (angleDeg);
    } else {
        return 0;
    }
}

//MQTT
var wsbroker = "localhost";  //mqtt websocket enabled broker
var wsport = 9001 // port for above
var client = new Paho.MQTT.Client(wsbroker, wsport,
    "myclientid_" + parseInt(Math.random() * 100, 10));
client.onConnectionLost = function (responseObject) {
    console.log("connection lost: " + responseObject.errorMessage);
};
//WHENEVER MSG ARRIVES - UPDATE ANGLE
client.onMessageArrived = function (message) {
    // console.log(message.destinationName, ' -- ', message.payloadString);
    data = JSON.parse(message.payloadString);
    console.log(data);
    angle_degree = calculate_angle(data.current, data.final);
    console.log(angle_degree);
    rotate(angle_degree);
};
var options = {
    timeout: 3,
    onSuccess: function () {
        console.log("mqtt connected");
        client.subscribe("coe457/coordinates", { qos: 2 });
    },
    onFailure: function (message) {
        console.log("Connection failed: " + message.errorMessage);
    }
};

function initMQTT() {
    client.connect(options);
}

//Cookie Handlers
// Source: https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}