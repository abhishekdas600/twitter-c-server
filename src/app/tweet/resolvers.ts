import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

interface CreateTweetPayload{
    content: string;
    imageUrl?: string; 
}

const queries ={
  getAllTweets: () => prismaClient.tweet.findMany({orderBy: {createdAt: "desc"}}),
}

const mutations = {
    createTweet : async (parent: any, {payload}:{payload : CreateTweetPayload}, ctx:GraphqlContext) => {
      if(!ctx.user) throw new Error("You are not authenticated");
      const tweet = await prismaClient.tweet.create({
        data: {
            content: payload.content,
            imageUrl: payload.imageUrl,
            author: {connect: {id: ctx.user.id}}, 
        },
      });

      return tweet;
    },
};

const extraResolver = {
  Tweet: {
      author: (parent: Tweet) => prismaClient.user.findUnique({where: {id : parent.authorId}}),
  }
}

export const resolvers = {mutations , extraResolver, queries};