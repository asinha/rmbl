-- CreateTable
CREATE TABLE "public"."Whisper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullTranscription" TEXT NOT NULL,

    CONSTRAINT "Whisper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transformation" (
    "id" TEXT NOT NULL,
    "whisperId" TEXT NOT NULL,
    "isGenerating" BOOLEAN NOT NULL DEFAULT true,
    "typeName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudioTrack" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "partialTranscription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whisperId" TEXT NOT NULL,
    "language" TEXT,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Transformation" ADD CONSTRAINT "Transformation_whisperId_fkey" FOREIGN KEY ("whisperId") REFERENCES "public"."Whisper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudioTrack" ADD CONSTRAINT "AudioTrack_whisperId_fkey" FOREIGN KEY ("whisperId") REFERENCES "public"."Whisper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
