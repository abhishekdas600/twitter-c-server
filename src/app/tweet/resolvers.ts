import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3"; 
import { GraphqlContext } from "../../interfaces";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";
import { redisClient } from "../../clients/redis";



const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
})

const queries ={
  getAllTweets:  () => TweetService.getTweets(),
   
  getSignedURLForTweet: async(parent: any,  {imageType, imageName}:{imageType: string; imageName: string}, ctx :GraphqlContext)=> {
      if(!ctx.user || !ctx.user?.id) throw new Error("Unauthenticated");
      const allowedImageType = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
      if(!allowedImageType.includes(imageType)) throw new Error("Unsupported Image Type"); 

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `uploads/${ctx.user.id}/tweets/${imageName}-${Date.now()}`,
      }) ;

      const signedURL = await getSignedUrl(s3Client, putObjectCommand);
      return signedURL;
  },
}

const mutations = {
    createTweet : async (parent: any, {payload}:{payload : CreateTweetPayload}, ctx:GraphqlContext) => {
      if(!ctx.user) throw new Error("You are not authenticated");
      const tweet = await TweetService.createTweetForUser({
        ...payload,
        userId: ctx.user.id,
      });

      return tweet;
    },

    
};

const extraResolver = {
  Tweet: {
      author: (parent: Tweet) => UserService.getUserById(parent.authorId),

     
  }
}

export const resolvers = {mutations , extraResolver, queries};