export const mutations = `#graphql

createTweet(payload:CreateTweetData!): Tweet

likeTweet(to: ID!): Boolean
dislikeTweet(to: ID!): Boolean
`;

