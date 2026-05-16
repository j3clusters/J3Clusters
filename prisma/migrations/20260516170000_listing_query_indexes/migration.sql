-- CreateIndex
CREATE INDEX "Listing_status_isFeatured_createdAt_idx" ON "Listing"("status", "isFeatured", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_status_city_purpose_type_idx" ON "Listing"("status", "city", "purpose", "type");
