-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "hfsFileId" TEXT,
ADD COLUMN     "hfsMetadataId" TEXT;

-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "hfsImageId" TEXT,
ADD COLUMN     "hfsMetadataId" TEXT;
