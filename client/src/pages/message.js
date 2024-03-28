import React from 'react';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import '../App.css';
import { FaArrowLeft } from "react-icons/fa";
import {
  Link
} from "react-router-dom";
import { useNavigate } from "react-router-dom";



function Message() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState([]);
  const [sessionId, setSessionId] = useState([]);
  const [sessionName, setSessionName] = useState([]);
  const [participant, setParticipant] = useState([{}]);
  const [coach, setCoach] = useState([{}]);

  const [msgSubject, setMsgSubject] = useState("Class Cancelled");
  const [msgValue, setMsgValue] = useState("");

  function handleSubmit() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: msgSubject, message: msgValue, coachId: sessionId })
    };
    fetch('/sendmessage', requestOptions)
      .then(res => res.json())
      .then(data => alert("Message sent successfully!"));
  }
  function handleSignOut(event) {
    navigate("../");
    localStorage.clear();
    sessionStorage.clear();
  }

  function ClearFields() {
    document.getElementById("subject-message").value = "";
    document.getElementById("text-message").value = "";
    setMsgValue("");
    setMsgSubject("");
  }

  useEffect(() => {
    const emails = JSON.parse(localStorage.getItem('userEmail'));
    const id = JSON.parse(localStorage.getItem('sessionId'));
    const name = JSON.parse(localStorage.getItem('sessionName'));

    if (emails) setUserEmail(emails);
    if (id) setSessionId(id);
    if (name) setSessionName(name);

  }, []);


  useEffect(() => {
    if (sessionId) {
      fetch(`/participants?participant=${encodeURIComponent(JSON.parse(localStorage.getItem('sessionId')))}`)
        .then((res) => res.json())
        .then((data) => setParticipant(data))
    }

  }, [sessionId]);

  useEffect(() => {
    if (participant) {
      fetch(`/coaches?session=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => setCoach(data))
    }

  }, [participant, sessionId]);

  useEffect(() => {
    setMsgValue("THIS IS A TEST!");
    setMsgSubject("Class Cancelled");
  }, []);

  return (
    <div className="App">
      <div className="top-bar">
        <div className="top-bar-content">
          <img src={require("../images/firstTeeLogo.png")} alt="FirstTeeLogo" />
          <button onClick={(e) => handleSignOut(e)}>
            <span className="poppins-regular">Sign Out&nbsp;&nbsp;<i className="fa fa-sign-out"></i></span>
          </button>
        </div>
      </div>

      <div className="main-margin">
        <div className="margin-top-large">
          <Link to="/classList" className="back-button poppins-light" state={{ userEmail: userEmail }}><FaArrowLeft /> &nbsp;Back to Classes</Link>
          <h1 className="name-header poppins-medium">{sessionName}</h1>
        </div>
        <div className="card-container margin-bottom-large">
          <h2 className="your-class-header poppins-regular">Send Notification</h2>
          <hr></hr>
          <div className="card message side-margins">
            <div id="message-form">
              <p className="your-class-header poppins-light" style={{ color: 'black' }}>Notify all members of the class on important announcements <br />Your message will be emailed and text messaged to all members of the class</p>

              <form onSubmit={handleSubmit}>
                <label className="your-class-header poppins-regular">
                  Subject <br></br>
                  <input id="subject-message" type='text' value={msgSubject} placeholder='Please enter a subject' className="poppins-light" style={{ width: '100%' }} onChange={(e) => setMsgSubject(e.target.value)} />
                  <br></br><br></br>
                </label>


                <label className="your-class-header poppins-regular message-container">
                  Message <br></br>
                  <textarea id="text-message" rows="5" cols="33" value={msgValue} placeholder='Please enter a message' style={{ width: '100%' }} className="poppins-light" onChange={(e) => setMsgValue(e.target.value)}></textarea><br></br><br></br>
                  <input id="clear-button" type="button"
                    value="Clear Text"
                    onClick={ClearFields} />
                </label>

                <button variant="contained" type="submit" className="send-button poppins-regular">Send <i className="fa fa-paper-plane" aria-hidden="true"></i></button>
              </form>
            </div>
          </div>
        </div>

        {/*  coach members */}
        <div className="card-container margin-bottom-large">
          <h2 className="your-class-header poppins-regular">Coaching Staff</h2>
          <hr></hr>
          <div className="card message side-margins">
            {coach &&
              <div id='session-participants' style={{ marginTop: '30px', width: '100%' }}>

                {
                  coach.map((data, key) => {
                    return (
                      <Box color="black" bgcolor="lightgray" m={2} p={1} key={key}
                        sx={{
                          borderRadius: '16px'
                        }}>

                        <div className="class-content">
                          <div className="class-text">
                            <p className="class-title poppins-medium">{data.name}</p>
                            <p className="student-num poppins-regular">{data.phone}</p>
                          </div>
                          <div className="email-button">
                            <a href={"mailto:" + data.email} className="email-icon">
                              <i className="fa fa-envelope fa-2x" aria-hidden="true"></i>
                            </a>
                          </div>
                        </div>
                      </Box>
                    );
                  })
                }
              </div>
            }

          </div>
        </div>

        {/*  class members */}
        <div className="card-container margin-bottom-large">
          <h2 className="your-class-header poppins-regular">Class Members</h2>
          <hr></hr>
          <div className="card message side-margins">
            {participant &&
              <div id='session-participants' style={{ marginTop: '30px', width: '100%' }}>

                {
                  participant.map((data, key) => {
                    return (
                      <Box color="black" bgcolor="lightgray" m={2} p={1} key={key}
                        sx={{
                          borderRadius: '16px'
                        }}>

                        <div className="class-content">
                          <div className="class-text">
                            <p className="class-title poppins-medium">{data.contact_name}</p>
                            <p className="student-num poppins-regular">{data.primary_contact_phone}</p>
                          </div>
                          <div className="email-button">
                            <a href={"mailto:" + data.primary_contact_email} className="email-icon">
                              <i className="fa fa-envelope fa-2x" aria-hidden="true"></i>
                            </a>
                          </div>
                        </div>
                      </Box>
                    );
                  })
                }
              </div>
            }

          </div>
        </div>
      </div>
      <div className="top-bar">
        <div className="top-bar-content">
          <img src={require("../images/FirstTeeMain.png")} alt="FirstTeeLogo" />
          <a href="https://firsttee.my.site.com/parentRegistration/s/privacy-policy?language=en_US&website=www.firstteepittsburgh.org">
            <span>Privacy Policy</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Message