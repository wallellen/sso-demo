import React from 'react';
import ReactDOM from 'react-dom';
import Keycloak from 'keycloak-js'
import $ from "jquery";



//keycloak init options
let initOptions = {
    url: 'https://abcd.com', 
    realm: 'react-realm', 
    clientId: 'react-login-client',
    onLoad: 'login-required'
}


let keycloak = new Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad })

keycloak.onAuthSuccess = () => {
    localStorage.setItem("bearer-token", keycloak.token);
    localStorage.setItem("refresh-token", keycloak.refreshToken);
    console.log(keycloak.token);

    setInterval(() => {
        keycloak.updateToken(70).then((refreshed) => {

            if (refreshed) {
                console.debug('Token refreshed' + refreshed);
            } else {
                console.warn('Token not refreshed, valid for '
                    + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
            }
        }).catch((message) => {
            console.error('Failed to refresh token: ', message);
        });


    }, 6000)

}



function LogOut(){
    const logout = ()=>{
        keycloak.logout();
    };

    return (
     <>
        <button  onClick={logout}>
          Logout
        </button>
    </>

    );
}

ReactDOM.render(<LogOut />, document.getElementById("logoutBtn"));



function CheckRoles() {
  const check = () => {
    $.ajax({
      type: "GET",
      url: "http://localhost:8080/check/admin",
      headers : {
         'Authorization': 'Bearer ' + localStorage.getItem("bearer-token")
      },
      success: function (data1) {
        document.getElementById("admin").innerHTML = data1;
      },
      error: function (error) {
        document.getElementById("admin").innerHTML = "You dont have admin privilages";
      }
    });

    $.ajax({
      type: "GET",
      url: "http://localhost:8080/check/customer",
      headers : {
         'Authorization': 'Bearer ' + localStorage.getItem("bearer-token")
      },
      success: function (data2) {
        document.getElementById("cust").innerHTML = data2;
      },
      error: function (error) {
        document.getElementById("cust").innerHTML = "You dont have customer privilages";
      }
    });

    $.ajax({
      type: "GET",
      url: "http://localhost:8080/anon",
      headers : {
         'Authorization': 'Bearer ' + localStorage.getItem("bearer-token")
      },
      success: function (data2) {
        document.getElementById("anno").innerHTML = data2;
      },
      error: function (error) {
        document.getElementById("anno").innerHTML = "You dont have anon privilages";
      }
    });


  };

  return (
    <>
      <p> Check Admin privilages at <strong>/check/admin</strong> and check Customer privilages at <strong>/check/customer</strong>
      </p>
      <button onClick={check} >
        Check 
      </button>
      <p id="admin"> </p>
      <p id="cust"> </p>
      <p id="anno"> </p>
    </>
  );
}
ReactDOM.render(<CheckRoles />, document.getElementById("root"));


