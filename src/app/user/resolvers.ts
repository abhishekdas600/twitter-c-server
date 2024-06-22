import axios from 'axios';
import { prismaClient } from '../../clients/db';

import { GraphqlContext } from '../../interfaces';


import UserService from '../../services/user';

import TweetService from '../../services/tweet';
import { User } from '@prisma/client';
import { redisClient } from '../../clients/redis';



// interface GoogleTokenResult {
//    iss?: string;
//    nbf?: string;
//    aud?: string;
//    sub?: string;
//    email: string;
//    email_verified: string;
//    azp?: string;
//    name?: string;
//    picture?: string;
//    given_name: string;
//    family_name?: string;
//    iat?: string;
//    exp?: string;
//    jti?: string;
//    alg?: string;
//    kid?: string;
//    typ?: string;
// }

const queries = {
   verifyGoogleToken : async(parent : any, {token}: {token:string}) => {
       const resultToken = await UserService.verifyGoogleTokenForUser(token);
       return resultToken;


   },
   getCurrentUser : async(parent: any, args: any, ctx: GraphqlContext) => {
      const id = ctx.user?.id;
      if(!id){
         return null;
      }
      const user = await UserService.getUserById(id);
      return user;
   },
   getUserById : (parent: any, {id}:{id:string}, ctx:GraphqlContext) =>  UserService.getUserById(id),

   
}

const extraResolver = {
   User: {
      tweets: (parent: User) => TweetService.getTweetsById(parent.id),
      followers : async (parent: User) => {
         const result = await prismaClient.follows.findMany({where: {followingId: parent.id},
         include: {
            follower: true,
         }
         })
        
         return result.map(el => el.follower)
         
      },
      following : async (parent: User) => {
         const result = await prismaClient.follows.findMany({where: {followerId: parent.id},
         include: {
            following: true,
         }
         })
         return result.map(el => el.following);
      },
      recommendedUsers: async (parent: User, _: any, ctx: GraphqlContext) => {
         if(!ctx.user) return [];
         
         const cachedValue = await redisClient.get(`RECOMMENDED_USERS:${ctx.user.id}`);

         if(cachedValue){
            return JSON.parse(cachedValue);
         }
         const myFollowings = await prismaClient.follows.findMany({
            where: {followerId: ctx.user.id},
           include: {
            following: {include: {
              
               followers: {include: {
                  following: true,
               }}
            }}
           }
         })
         const users = [] as User[];
         for(const followings of myFollowings){
            for(const followingOfFollowedUser of followings.following.followers){
               if(followingOfFollowedUser.followingId !== ctx.user.id &&
                  myFollowings.findIndex((e)=> e?.followingId === followingOfFollowedUser.followingId)<0){
                 users.push(followingOfFollowedUser.following)
               }
            }
         }
         await redisClient.set(`RECOMMENDED_USERS:${ctx.user.id}`, JSON.stringify(users));
         return users;
      },
      
   }
}

const mutations = {
   followUser : async (parent: any, {to}:{to: string}, ctx: GraphqlContext) => {
      if(!ctx.user || !ctx.user.id) throw new Error('Unauthenticated');
      await UserService.followUser(ctx.user.id, to);
      await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
      return true;
   },
   unfollowUser : async (parent: any, {to}:{to: string}, ctx: GraphqlContext) => {
      if(!ctx.user || !ctx.user.id) throw new Error('Unauthenticated');
      await UserService.unfollowUser(ctx.user.id, to);
      await redisClient.del(`RECOMMENDED_USERS:${ctx.user.id}`);
      return true;
   }
}

export const resolvers = {queries, extraResolver, mutations};