import express from 'express'
import { readUrlJsonData } from './utils/readCSV';
import { UrlInputSchema, urlInputSchema } from '@pahul100/short-link-common'
import { shortHash } from './utils/hashing';
import { Url } from './utils/database';
import cors from 'cors';

const app = express();

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use(express.json())

app.use((req, _, next) => {
    console.log(req.method + " : " + req.originalUrl)
    next()
})

app.post('/shrink',async (req, res) => {
    let data = await readUrlJsonData()

    let body = urlInputSchema.safeParse(req.body)

    const fullUrl = `${req.protocol}://${req.get("host")}/`

    if(!body.success){
        res.status(400).json({"detail": "Invalid Input"})
        return
    }

    let url: UrlInputSchema = body.data;

    url.url = url.url.trim()

    url.url = url.url.endsWith("/") ? url.url.replace(/[\s/]+$/, '') : url.url

    if(data[url.url]){
        res.status(400).json({
            "detail": "ERROR: The URL you provided appears to be unsafe or potentially harmful. For security purposes, it cannot be processed. Please verify the URL and try again."
        })
        return
    }
    
    let exists = await Url.find({
        url: url.url
    })

    if(exists.length > 0){
        const key = fullUrl + exists[0].key

        res.json({"detail":key})
        return 
    }

    let hash = shortHash(url.url)

    try{
        let u = new URL(url.url);
    }
    catch{
        res.status(400).json({"detail" : "Invalid URL"})
        return
    }

    try{
        let createdUrl = await Url.create({
                            key: hash,
                            url: url.url,
                            verified: true
                        })
    
        const key = fullUrl + createdUrl.key
    
        res.json({"detail":key})
    }
    catch{
        res.status(500).json({"detail":"internal server error"})
    }
})

app.get('/*', async (req, res) => {

    const id = req.originalUrl.slice(1)

    if(!id){
        res.sendStatus(404)
        return
    }

    let data = await Url.find({
        key: id
    })
    if(data.length > 0){
        res.redirect(data[0].url)
    }
    else{
        res.sendStatus(404)
    }
})

app.listen(3000, () => {
    console.log("started server on port 3000")
})