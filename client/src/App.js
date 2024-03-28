import React from 'react';
import { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import './App.css';
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [userEmail, setUserEmail] = useState("");

  function handleCallbackResponse(response) {
    var userObject = jwt_decode(response.credential);

    setUser(userObject);
    setUserEmail(userObject.email);

    localStorage.setItem('user', userObject);
    localStorage.setItem('userEmail', JSON.stringify(userObject.email));
  }

  if (userEmail !== "") {
    navigate("/classList", { state: { userEmail: userEmail, user: user, name: user.given_name } });
  }

  useEffect(() => {
    /* global google */ // NEEDED FOR GOOGLE API
    google.accounts.id.initialize({
      client_id: "577503408571-t7b1p7kh2rppnoeooagkti8t1hnqh3nc.apps.googleusercontent.com",
      callback: handleCallbackResponse
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    )

  }, []);

  useEffect(() => {
    if (userEmail) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      };

      fetch('/coachId', requestOptions)
        .then((res) => {
          if (res.status == 401) {
            navigate("/unauthorized");
          }
          return res.json();
        })
        .then((data) => localStorage.setItem('userId', JSON.stringify(data)));
    }
  }, [userEmail]);

  return (
    <div className="App gradient-bg">
      <div className="signInWrapper ">
        <div className="main-login-content">
          <img src={require("./images/firstTeeLogo.png")} alt="FirstTeeLogo" />
          <h1 className="name-header poppins-bold">Coach Login</h1>
          <h1 className="your-class-header poppins-light font-size-large padding-bottom-small">If you are registered as a coach for First Tee Pittsburgh, login below to view your classes and notify students with updates!</h1>
          <div id="signInDiv"></div>
        </div>
        <div className="login-img">
        </div>
      </div>
    </div>
  );
}

export default App;
