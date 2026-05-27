import {createContext, useState, useEffect} from 'react';
import {jobsData} from '../assets/assets';

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const [searchFilter, setSearchFilter] = useState({ // object to hold search filters for job search
        title: '',
        location: '',
    });

    const [isSearched, setIsSearched] = useState(false); // returns true if user has performed a search

    const [jobs, setJobs] = useState([]) // return list of jobs

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false) // to show recruiter login

    //Function to fetch jobs
    const fetchJobs = async() => {
        setJobs(jobsData)
    }

    useEffect(()=>{
        fetchJobs();
    },[])

    const value = {
        searchFilter,
        setSearchFilter,
        isSearched,
        setIsSearched,
        jobs,
        setJobs,
        showRecruiterLogin,
        setShowRecruiterLogin,
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}