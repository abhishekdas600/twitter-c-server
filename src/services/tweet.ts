import { prismaClient } from "../clients/db";
import { redisClient } from "../clients/redis";

export interface CreateTweetPayload{
    content: string;
    imageUrl?: string; 
    userId? : string;
}

class TweetService{
    public static async createTweetForUser(data: CreateTweetPayload){
        const tweet = await prismaClient.tweet.create({
            data: {
                content: data.content,
                imageUrl: data.imageUrl,
                author: {connect:{id: data.userId}},
            }
        })
        await redisClient.del("ALL_TWEETS");
        return tweet;
    }

    public static async getTweets(){

        const tweets = await prismaClient.tweet.findMany({orderBy:{createdAt:"desc"}});
        const cachedTweets = await redisClient.get("ALL_TWEETS");
        if(cachedTweets){
            return JSON.parse(cachedTweets);
        }
        await redisClient.set("ALL_TWEETS", JSON.stringify(tweets));
        return tweets;
    }

    public static getTweetsById(id: string){
        return prismaClient.tweet.findMany({where:{authorId: id}})
    }

    
}



export default TweetService;