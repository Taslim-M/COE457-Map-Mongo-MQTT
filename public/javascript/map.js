var current_position = null;
var curent_lat_lng = null;

var final_position = null;
var final_lat_lng = null;

var current_layer = null;

var current_user_name = null;
var remember_me = false;
var map;
var dir = MQ.routing.directions();
function validate() {
    $.ajax({
        type: "GET",
        dataType: 'JSON',
        url: "/validate",
    }).done(function (response) {
        console.log(response);
        if (!response.valid) {
            window.location.href = "/unauthorized.html";
        } else {
            current_user_name = response.username;
            remember_me = response.remember;
            $("#name").html(current_user_name);

            console.log("cookies allowed");
            //Check if first login - server will set this to blank if cookies not allowed
            if (response.last_access != "") {
                date = new Date(response.last_access);
                str = "Welcome back " + response.username + "! You last accessed at: " + date.toString();
                $("#main").append(str);
            }

            initMQTT();
            loadMap();
        }
    });
}

function loadMap() {

    map = L.map('map', {
        layers: MQ.mapLayer(),
        center: [25.2821208, 55.400],
        zoom: 15
    });
    // This function is called everytime Location Changes - Update The start
    map.on('locationfound', function (e) {
        curent_lat_lng = e.latlng;
        //First Time, else just Remove Marker and Add
        if (current_position == null) {
            current_position = L.marker(e.latlng).addTo(map).bindPopup("Start").openPopup();
            console.log('Set Current Location First Time');
        }   //No else Needed once setup
        //Just Update the route, not add the marker again - else gets too messy
        //Add Route if Destination is there
        if (final_lat_lng != null) {
            addRoute();
        }
    });
    map.on('locationerror', function (ev) {
        console.log(ev.message);
        console.log('User has not allowed Location');
    });
    map.on('click', function (e) {
        //First we need to check if the start is set, else the first time user clicks, set START
        if (current_position == null) {
            curent_lat_lng = e.latlng;
            current_position = L.marker(e.latlng).addTo(map).bindPopup("Start").openPopup();
            console.log('Set Current Location First Time');
        } else {
            final_lat_lng = e.latlng;
            if (final_position == null) {
                final_position = L.marker(e.latlng).addTo(map).bindPopup("Destination").openPopup();
                console.log('Set Destination Location First Time');
            } else {
                final_position.setLatLng(final_lat_lng);
                final_position.openPopup();
            }
            //We know there is a Start,so add a Route
            addRoute();
        }
    });
    map.locate({ setView: false, maxZoom: 16, watch: true });

}

function addRoute() {
    //This will clear the Default Markers
    if (current_layer) {
        map.removeLayer(current_layer);
    }
    console.log('add route called');
    dir.route({
        locations: [
            { latLng: curent_lat_lng },
            { latLng: final_lat_lng }
        ]
    });
    current_layer = MQ.routing.routeLayer({
        directions: dir,
        fitBounds: true
    });
    map.addLayer(current_layer);

    message = new Paho.MQTT.Message(JSON.stringify({
        "username": current_user_name,
        "current": curent_lat_lng,
        "final": final_lat_lng
    })
    );
    message.destinationName = "coe457/coordinates";
    client.send(message);
}

//MQTT
var wsbroker = "localhost";  //mqtt websocket enabled broker
var wsport = 9001 // port for above
var client = new Paho.MQTT.Client(wsbroker, wsport,
    "myclientid_" + parseInt(Math.random() * 100, 10));
client.onConnectionLost = function (responseObject) {
    console.log("connection lost: " + responseObject.errorMessage);
};
var options = {
    timeout: 3,
    onSuccess: function () {
        console.log("mqtt connected");
    },
    onFailure: function (message) {
        console.log("Connection failed: " + message.errorMessage);
    }
};

function initMQTT() {
    client.connect(options);
}
//checking remember me option - if the user close tab or leave page
window.addEventListener('beforeunload', function (e) {
    if (!remember_me) {
        $.get("/logout", function (data, status) { });
    }
});

