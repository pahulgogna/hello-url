import express from 'express'
import { readUrlJsonData } from './utils/readCSV';
import { UrlInputSchema, urlInputSchema, urlSchema } from '@pahul100/short-link-common'
import { shortHash } from './utils/hashing';
import { Url } from './utils/database';
import { sign, verify } from 'jsonwebtoken';
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
        const key = exists[0].key

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


    let createdUrl = await Url.create({
                        key: hash,
                        url: url.url,
                        verified: true
                    })

    const key = createdUrl.key

    res.json({"detail":key})
})

app.get('/token/*', (req, res) => {
    const url = req.originalUrl.replace(/[\s/]+$/, '').split('/')

    const id = url[url.length - 1]

    if(!id){
        res.status(404).json({"detail": "Not Found"})
        return
    }

    let expire = Date.now() + 1000 * 60 // 60 seconds validity
    let countDown = Date.now() + 1000 * 15 //15 seconds countdown


    const token = sign({ id: id, countDown: Math.floor(countDown),exp: Math.floor(expire/1000)}  , process.env.JWT_SECRET as string)

    res.send({"detail":token})
})

app.get('/*', async (req, res) => {

    try{
        const header = req.header("authorization") || "";
        const token = header.split(' ')[1];

        const decodedToken = verify(token, process.env.JWT_SECRET as string);
        if (typeof decodedToken === 'string' || !decodedToken || !('id' in decodedToken) || !('countDown' in decodedToken)) {
            res.status(403).json({"detail": "Unauthorized"});
            return;
        }3
        const tokenData = decodedToken as { id: string, countDown: number };

        const date = Date.now()

        if(date < tokenData.countDown){
            res.status(403).json({"detail": "Unauthorized"})
            return
        }
    }
    catch(e){
        res.status(403)
        res.json({"detail": "Unauthorized"})
        return
    }

    const id = req.originalUrl.slice(1)
    let data = await Url.find({
        key: id
    })
    if(data.length > 0){
        res.send(data[0].url)
    }
    else{
        res.status(404).json({"detail": "not found"})
    }
})

app.listen(3000, () => {
    console.log("started server on port 3000")
})