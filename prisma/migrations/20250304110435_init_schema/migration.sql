/*
  Warnings:

  - You are about to drop the `BlockEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndexerState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostInteraction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tribe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_tribeId_fkey";

-- DropForeignKey
ALTER TABLE "PostInteraction" DROP CONSTRAINT "PostInteraction_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostInteraction" DROP CONSTRAINT "PostInteraction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Topic" DROP CONSTRAINT "Topic_tribeId_fkey";

-- DropForeignKey
ALTER TABLE "Tribe" DROP CONSTRAINT "Tribe_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_TopicPosts" DROP CONSTRAINT "_TopicPosts_A_fkey";

-- DropForeignKey
ALTER TABLE "_TribeMembers" DROP CONSTRAINT "_TribeMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_TribeMembers" DROP CONSTRAINT "_TribeMembers_B_fkey";

-- DropTable
DROP TABLE "BlockEvent";

-- DropTable
DROP TABLE "IndexerState";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "PostInteraction";

-- DropTable
DROP TABLE "Tribe";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tribes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "tribes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tribeId" TEXT NOT NULL,
    "metadata" JSONB,
    "blockchainId" INTEGER,
    "blockchainTxHash" TEXT,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_interactions" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexer_states" (
    "id" SERIAL NOT NULL,
    "chainId" INTEGER NOT NULL,
    "lastIndexedBlock" BIGINT NOT NULL,
    "lastSyncTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexer_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_events" (
    "id" SERIAL NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_address_key" ON "users"("address");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "posts_blockchainId_key" ON "posts"("blockchainId");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "posts"("authorId");

-- CreateIndex
CREATE INDEX "posts_tribeId_idx" ON "posts"("tribeId");

-- CreateIndex
CREATE INDEX "posts_blockchainId_idx" ON "posts"("blockchainId");

-- CreateIndex
CREATE INDEX "post_interactions_postId_idx" ON "post_interactions"("postId");

-- CreateIndex
CREATE INDEX "post_interactions_userId_idx" ON "post_interactions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "indexer_states_chainId_key" ON "indexer_states"("chainId");

-- CreateIndex
CREATE INDEX "block_events_blockNumber_idx" ON "block_events"("blockNumber");

-- CreateIndex
CREATE INDEX "block_events_processed_idx" ON "block_events"("processed");

-- AddForeignKey
ALTER TABLE "tribes" ADD CONSTRAINT "tribes_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "tribes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_tribeId_fkey" FOREIGN KEY ("tribeId") REFERENCES "tribes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_interactions" ADD CONSTRAINT "post_interactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_interactions" ADD CONSTRAINT "post_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TribeMembers" ADD CONSTRAINT "_TribeMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "tribes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TribeMembers" ADD CONSTRAINT "_TribeMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TopicPosts" ADD CONSTRAINT "_TopicPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
