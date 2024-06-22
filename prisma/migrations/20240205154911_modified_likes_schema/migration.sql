-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_likedId_fkey";

-- DropForeignKey
ALTER TABLE "Likes" DROP CONSTRAINT "Likes_likerId_fkey";

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likerId_fkey" FOREIGN KEY ("likerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedId_fkey" FOREIGN KEY ("likedId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
