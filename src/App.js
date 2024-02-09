import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login/Login';
import AuthProvider from "./components/AuthProvider/AuthProvider";

import './App.css';
import Register from "./components/Register/Register";
import Home from "./components/Home/Home";
import Admin from "./components/Admin/Admin";

import 'bootstrap/dist/css/bootstrap.min.css';
import Create from "./components/Create/Create";
import ContentPage from "./components/ContentPage/ContentPage";
import MyStuff from "./components/MyStuff/MyStuff";
import User from "./components/User/User";



const firebaseConfig = {
  apiKey: "AIzaSyASEJGWw6vUO_23e_W157Gi7ydKs2a2w3o",
  authDomain: "book-club-aa.firebaseapp.com",
  projectId: "book-club-aa",
  storageBucket: "book-club-aa.appspot.com",
  messagingSenderId: "602622615648",
  appId: "1:602622615648:web:b7d7ad9e5cb32357e52305"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);


function App() {

  return (
      <AuthProvider firestore={firestore} auth={auth}>
          <Router>
            <div className="App">
                <Routes>
                    <Route path="/login"         element={<Login auth={auth} />} />
                    <Route path="/register" element={<Register auth={auth}
                                                                firestore={firestore}/>} />
                    <Route path="/"         element={<Home auth={auth}
                                                           firestore={firestore}/>} />
                    <Route path="/admin"         element={<Admin auth={auth}
                                                           firestore={firestore}
                                                            />} />
                    <Route path="/upload"         element={<Create auth={auth}
                                                                 firestore={firestore}
                                                                   storage={storage}
                    />} />
                    <Route path="/content/:id" element={<ContentPage firestore={firestore}
                    auth = {auth} storage={storage}/>} />
                    <Route path="/mystuff"         element={<MyStuff auth={auth}
                                                           firestore={firestore}/>} />
                    <Route path="/user/:id" element={<User firestore={firestore}
                                                                     auth = {auth} storage={storage}/>} />
                    {/* Add more routes for other pages/components */}
                </Routes>
            </div>
          </Router>
      </AuthProvider>


  );
}

export default App;
