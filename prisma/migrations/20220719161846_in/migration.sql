-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "size" TEXT[] DEFAULT ARRAY['normal']::TEXT[];
