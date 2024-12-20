import { useMemo, useState } from "react";
import Button from "../components/Button"
import TextInput from "../components/TextInput"
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Copy, CopyCheck } from "lucide-react";

var timeout: number;

function ShrinkUrl() {

    const [url, setUrl] = useState("")
    const [isValid, setIsValid] = useState(true)
    const [key, setKey] = useState('')
    const [copied, setCopied] = useState(false)

    function isUrlValid(userInput: string): boolean {
        if(!userInput.length){
            return true
        }
        let url;
        try {
          url = new URL(userInput);
        } catch (_) {
          return false;
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    async function handleShrink(){
        setKey('')
        if(isValid && url.length){
            const data: {data:{detail: string}} | void = await axios.post(import.meta.env.VITE_BEEP + '/shrink', {url : url})
            .catch((e) => {
                toast.error(e.response.data.detail, {
                    position: "bottom-right"
                })
            })
            if(data && data.data && data.data.detail){
                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(0)
                    }, 3000)
                })
                setKey(data.data.detail)
            }
            else{
                toast.error("Invalid URL", {
                    position: "bottom-right"
                })
            }
        }
        else{
            toast.error("Invalid URL", {
                position: "bottom-right"
            })
        }
    }
    
    useMemo(() => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            setIsValid(isUrlValid(url))
        }, 150)
    }, [url])

    return (
        <div className="flex justify-center h-full">
            <div className=" w-2/3 sm:w-1/2 lg:w-1/3">
                <div className="font-semibold flex justify-center w-full text-2xl  md:text-3xl pt-5">
                    Shrink Your URL
                </div>
                <div className="border border-slate-300 rounded-lg p-5 mt-5">
                    <TextInput
                        lable="URL"
                        placeholder="https://verylongurl.com"
                        value={url}
                        setValue={setUrl}
                        className={` ${isValid? "": "bg-red-200"} `}
                    />
                    <div className="flex justify-center mt-5">
                        <Button onClick={handleShrink}>
                            Shrink
                        </Button>
                    </div>
                </div>
                {
                key.length
                ? 
                <div className="flex justify-center">
                    <div className="flex justify-center mt-5 text-lg border border-slate-300 p-5 rounded-lg transition hover:shadow-lg w-fit">
                        <div className="flex flex-col">
                            <div className="flex justify-center">
                                Your URL:
                            </div>
                            <div className="flex">
                                <a href={key} target="_blanck" className="underline text-blue-600">
                                    {key}                    
                                </a>
                                <div className="ml-3 hover:cursor-pointer" 
                                onClick={() => {
                                    setCopied(true)
                                    navigator.clipboard.writeText(key)
                                    setTimeout(() => {
                                        setCopied(false)
                                    }, 2000)
                                }}>
                                    {copied ? <CopyCheck/>:<Copy/>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                : null}
            </div>
            <ToastContainer/>
        </div>
    )
}

export default ShrinkUrl
