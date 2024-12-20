import axios from 'axios';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

function OpenUrl() {

    const [progress, setProgress] = useState(0);
    const navigate = useNavigate()


    function onError(){
        toast.error("We ran into some error trying to retrieve your URL. Please make sure the URL is correct.",
            {
                position: "bottom-right"
            }
        )
        toast.info("Redirecting you to the main page.",
            {
                position: "bottom-right"
            }
        )
        setTimeout( () => {
            navigate('/')
        }, 6000)
    }
 
    async function handleLink (linkId: string) {
        
        try{
            const data = (await axios.get(import.meta.env.VITE_BEEP + "/token/" + linkId)).data

            const getUrlAndRedirect = async () => {
                try{

                    const res = (await axios.get(import.meta.env.VITE_BEEP + "/" + linkId, {
                        headers: {
                            Authorization: `Bearer ${data.detail}`
                        }
                    })).data
                    
                    if(res){
                        window.location.href = res
                    }
                }
                catch{
                    onError()
                }

            }

            let interval = setInterval(() => {
                        setProgress((p) => {
                            if (p < 20 && !document.hidden) {
                                return p + 1;
                            } else {
                                if(p >= 20){
                                    clearInterval(interval);
                                    getUrlAndRedirect()
                                }
                                return p;
                            }
                        })
                    }, 
                1000)

        }
        catch{
            onError()
        }
    }

    useEffect(() => {
        const u = window.location.href.split("/");
        if(u[3]){
            handleLink(u[3])
        }
        else{
            navigate('/')
        }

    }, [])

    return (
        <div className='flex justify-center h-full'>
            <div className='flex w-4/5 md:w-1/2 flex-col justify-center h-full'>
                <div className='p-10 border border-slate-400 mt-10'>
                    <div className=' text-xl md:text-3xl font-bold flex justify-center'>
                        Almost there!
                    </div>
                    <div className=' md:text-lg mt-4 flex justify-center text-slate-600'>
                        We will redirect you shortly
                    </div>
                    <div className='md:text-lg flex justify-center text-slate-600'>
                        please wait while we prepare to redirect
                    </div>
                    <div className="w-full bg-gray-200 mt-4 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 transition rounded-full" style={{width: `${5*progress}%`}}></div>
                    </div>
                    <div className='text-xl font-bold flex justify-center'>
                        {20 - progress} Seconds left
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}

export default OpenUrl
