import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import { withDB } from './db';
import path from 'path';

const articlesInfo = {
    'learn-react': { upvotes: 0, comments: [] },
    'learn-node': { upvotes: 0, comments: [] },
    'my-thoughts-on-resumes': { upvotes: 0, comments: [] },
};

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {

    await withDB(async db => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName });

        if (articleInfo) {
            res.status(200).json(articleInfo);
        } else {
            res.status(404).send("Article not found!");
        }

    })
});

app.post('/api/articles/:name/comment', async (req, res) => {
    
        await withDB(async db => {
        const articleName = req.params.name;
        const newComment = req.body.comment;
        
        const articleInfo = await db.collection('articles')
            .findOne({ name: articleName });

        if (!articleInfo) return res.status(404).send("Article not found!");

        await db.collection('articles').updateOne({
            name: articleName
        }, {
            '$set': { comments: articleInfo.comments.concat(newComment) }
        });

        const updateArticleInfo = await db.collection('articles')
            .findOne({ name: articleName });

        res.status(200).json(updateArticleInfo);

    })
});


app.post('/api/articles/:name/upvote', async (req, res) => {
    
    await withDB(async db => {
    const articleName = req.params.name;

    const articleInfo = await db.collection('articles')
        .findOne({ name: articleName });

    if (!articleInfo) return res.status(404).send("Article not found!");

    await db.collection('articles').updateOne({
        name: articleName
    }, {
        '$set': { upvotes: articleInfo.upvotes + 1 }
    });

    const updateArticleInfo = await db.collection('articles')
        .findOne({ name: articleName });

    res.status(200).json(updateArticleInfo);
    })
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'));
});

app.listen(8000, () => console.log("Server is listening on port 8000"));