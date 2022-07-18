-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "desc" TEXT NOT NULL DEFAULT 'Product Descriptin Not Available',
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY['https://newhorizonindia.edu/nhengineering/mca/wp-content/uploads/2020/01/default-placeholder.png']::TEXT[];

-- CreateTable
CREATE TABLE "CateGory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CateGory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CateGoryToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CateGory_name_key" ON "CateGory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CateGoryToProduct_AB_unique" ON "_CateGoryToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_CateGoryToProduct_B_index" ON "_CateGoryToProduct"("B");

-- AddForeignKey
ALTER TABLE "_CateGoryToProduct" ADD CONSTRAINT "_CateGoryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "CateGory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CateGoryToProduct" ADD CONSTRAINT "_CateGoryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
