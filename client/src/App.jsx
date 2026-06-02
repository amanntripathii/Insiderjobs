import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ApplyJob from './pages/ApplyJob';
import Applications from './pages/Applications';
import RecruiterLogin from './components/RecruiterLogin';
import { AppContext } from './context/AppContext';
import { useContext } from 'react';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import ViewApplications from './pages/ViewApplications';
import ManageJobs from './pages/ManageJobs';
import 'quill/dist/quill.snow.css'; // import quill snow css
import {ToastContainer,toast} from 'react-toastify'; // for popup notifications
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const {showRecruiterLogin, companyToken} = useContext(AppContext)

  return(
    <div>
      {showRecruiterLogin && <RecruiterLogin/>}
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/apply-job/:id' element={<ApplyJob/>} />
        <Route path='/applications' element={<Applications/>} />
        <Route path='/dashboard' element={<Dashboard/>}>
        {companyToken ?
        <>
          <Route path='add-job' element={<AddJob/>} />
          <Route path='view-applications' element={<ViewApplications/>} />
          <Route path='manage-jobs' element={<ManageJobs/>} />
        </>
          : null 
        }
        </Route>
      </Routes>
    </div>
  )
}

export default App