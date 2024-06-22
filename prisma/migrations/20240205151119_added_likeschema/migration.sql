-- CreateTable
CREATE TABLE "Likes" (
    "likerId" TEXT NOT NULL,
    "likedId" TEXT NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("likerId","likedId")
);

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likerId_fkey" FOREIGN KEY ("likerId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_likedId_fkey" FOREIGN KEY ("likedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
