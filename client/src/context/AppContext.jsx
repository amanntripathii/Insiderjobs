import {createContext, useState, useEffect} from 'react';
import {jobsData} from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import {useUser, useAuth} from '@clerk/react';

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL //Getting backend url from .env file

    const {user} = useUser() // Get user from Clerk
    const {getToken} = useAuth() // Get token from Clerk

    const [searchFilter, setSearchFilter] = useState({ // object to hold search filters for job search
        title: '',
        location: '',
    });

    const [isSearched, setIsSearched] = useState(false); // returns true if user has performed a search

    const [jobs, setJobs] = useState([]) // return list of jobs

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false) // to show recruiter login

    const [companyToken, setCompanyToken] = useState(null) // to store company token

    const [companyData, setCompanyData] = useState(null) // to store company data

    const [userData, setUserData] = useState(null) // to store user data

    const [userApplications, setUserApplications] = useState([]) // to store user applications

    //Function to fetch jobs
    const fetchJobs = async() => {
        try{
            const {data} = await axios.get(backendUrl+'/api/jobs')

            if(data.success){
                setJobs(data.jobs)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    //Function to fetch company data
    const fetchCompanyData = async() => {
        try{
            const {data} = await axios.get(backendUrl + '/api/company/company', {headers:{token: companyToken}})
            if(data.success){
                setCompanyData(data.company)
                console.log(data)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    //Function to fetch user data
    const fetchUserData = async() => {
        try{
            const token = await getToken()

            const {data} = await axios.get(backendUrl+`/api/users/user`,
                {headers:{Authorization: `Bearer ${token}`}}
            )

            if(data.success){
                setUserData(data.user)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    //Function to fetch user applications
    const fetchUserApplications = async() => {
        try{
            const token = await getToken()

            const {data} = await axios.get(backendUrl+`/api/users/applications`,
                {headers:{Authorization: `Bearer ${token}`}}
            )

            if(data.success){
                setUserApplications(data.applications)
            }else{
                toast.error(data.message)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchJobs();

        const storeCompanyToken = localStorage.getItem('companyToken') //On reloading or refreshing the page, token is not lost
        if(storeCompanyToken){
            setCompanyToken(storeCompanyToken)
        }
    },[])

    useEffect(() => {
        if(companyToken){
            fetchCompanyData()
        }
    },[companyToken])

    useEffect(() => {
        if(user) {
            fetchUserData()
            fetchUserApplications()
        }
    }, [user])

    const value = {
        searchFilter,
        setSearchFilter,
        isSearched,
        setIsSearched,
        jobs,
        setJobs,
        showRecruiterLogin,
        setShowRecruiterLogin,
        companyToken,
        setCompanyToken,
        companyData,
        setCompanyData,
        backendUrl,
        userData,
        setUserData,
        userApplications,
        setUserApplications,
        fetchUserData,
        fetchUserApplications
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider;