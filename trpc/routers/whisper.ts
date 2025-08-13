import { t } from "../init";
import { z } from "zod";
import { PrismaClient } from "../../lib/generated/prisma";
import { v4 as uuidv4 } from "uuid";
import { protectedProcedure } from "../init";
import { limitMinutes } from "@/lib/limits";
import {
  togetherBaseClientWithKey,
  togetherVercelAiClient,
} from "@/lib/apiClients";
import { generateText } from "ai";

const prisma = new PrismaClient();

export const whisperRouter = t.router({
  listWhispers: protectedProcedure.query(async ({ ctx }) => {
    const whispers = await prisma.whisper.findMany({
      where: { userId: ctx.auth.userId },
      orderBy: { createdAt: "desc" },
    });
    // Map to dashboard shape
    return whispers.map((w) => ({
      id: w.id,
      title: w.title,
      content: w.fullTranscription,
      preview:
        w.fullTranscription.length > 80
          ? w.fullTranscription.slice(0, 80) + "..."
          : w.fullTranscription,
      timestamp: w.createdAt.toISOString(),
      // duration: ... // If you want to add duration, you can extend the model or calculate from audioTracks
    }));
  }),
  transcribeFromS3: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string(),
        whisperId: z.string().optional(),
        language: z.string().optional(),
        durationSeconds: z.number().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Enforce minutes limit
      const minutes = Math.ceil(input.durationSeconds / 60);

      console.log("decreasing of minutes", minutes);

      const limitResult = await limitMinutes({
        clerkUserId: ctx.auth.userId,
        isBringingKey: !!ctx.togetherApiKey,
        minutes,
      });

      if (!limitResult.success) {
        throw new Error("You have exceeded your daily audio minutes limit.");
      }

      const res = await togetherBaseClientWithKey(
        ctx.togetherApiKey
      ).audio.transcriptions.create({
        // @ts-ignore: Together API accepts file URL as string, even if types do not allow
        file: input.audioUrl,
        model: "openai/whisper-large-v3",
        language: input.language || "en",
      });

      const transcription = res.text as string;

      // Generate a title from the transcription (first 8 words or fallback)
      const { text: title } = await generateText({
        prompt: `Generate a title for the following transcription with max of 10 words/80 characters:
        ${transcription}

        Only return the title, nothing else, no explanation and no quotes or followup.
        `,
        model: togetherVercelAiClient(ctx.togetherApiKey)(
          "meta-llama/Llama-3.3-70B-Instruct-Turbo"
        ),
        maxTokens: 10,
      });

      const whisperId = input.whisperId || uuidv4();

      if (input.whisperId) {
        // Add AudioTrack to existing Whisper
        const whisper = await prisma.whisper.findUnique({
          where: { id: input.whisperId },
        });
        if (!whisper) throw new Error("Whisper not found");
        // Create new AudioTrack
        await prisma.audioTrack.create({
          data: {
            fileUrl: input.audioUrl,
            partialTranscription: transcription,
            whisperId: input.whisperId,
            language: input.language,
          },
        });
        // Append to fullTranscription
        await prisma.whisper.update({
          where: { id: input.whisperId },
          data: {
            fullTranscription: whisper.fullTranscription + "\n" + transcription,
          },
        });
      } else {
        // Create new Whisper and first AudioTrack
        await prisma.whisper.create({
          data: {
            id: whisperId,
            title: title.slice(0, 80),
            userId: ctx.auth.userId,
            fullTranscription: transcription,
            audioTracks: {
              create: [
                {
                  fileUrl: input.audioUrl,
                  partialTranscription: transcription,
                  language: input.language,
                },
              ],
            },
          },
        });
      }
      return { id: whisperId };
    }),
  getWhisperWithTracks: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const whisper = await prisma.whisper.findUnique({
        where: { id: input.id },
        include: {
          audioTracks: true,
          transformations: { orderBy: { createdAt: "asc" } },
        },
      });
      if (!whisper) throw new Error("RMBL not found");
      return whisper;
    }),
  updateFullTranscription: protectedProcedure
    .input(z.object({ id: z.string(), fullTranscription: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only allow the owner to update
      const whisper = await prisma.whisper.findUnique({
        where: { id: input.id },
      });
      if (!whisper) throw new Error("RMBL not found");
      if (whisper.userId !== ctx.auth.userId) throw new Error("Unauthorized");
      const updated = await prisma.whisper.update({
        where: { id: input.id },
        data: { fullTranscription: input.fullTranscription },
      });
      return { id: updated.id, fullTranscription: updated.fullTranscription };
    }),
  updateTitle: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only allow the owner to update
      const whisper = await prisma.whisper.findUnique({
        where: { id: input.id },
      });
      if (!whisper) throw new Error("RMBL not found");
      if (whisper.userId !== ctx.auth.userId) throw new Error("Unauthorized");
      const updated = await prisma.whisper.update({
        where: { id: input.id },
        data: { title: input.title },
      });
      return { id: updated.id, title: updated.title };
    }),
  deleteWhisper: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Only allow the owner to delete
      const whisper = await prisma.whisper.findUnique({
        where: { id: input.id },
      });
      if (!whisper) throw new Error("RMBL not found");
      if (whisper.userId !== ctx.auth.userId) throw new Error("Unauthorized");

      // Delete all related Transformations first
      await prisma.transformation.deleteMany({
        where: { whisperId: input.id },
      });

      // Delete all related AudioTracks
      await prisma.audioTrack.deleteMany({
        where: { whisperId: input.id },
      });

      // Now delete the Whisper
      await prisma.whisper.delete({
        where: { id: input.id },
      });
      return { id: input.id };
    }),
});

// import { t } from "../init";
// import { z } from "zod";
// import { PrismaClient } from "../../lib/generated/prisma";
// import { v4 as uuidv4 } from "uuid";
// import { protectedProcedure } from "../init";
// import { limitMinutes } from "@/lib/limits";
// import {
//   togetherBaseClientWithKey,
//   togetherVercelAiClient,
// } from "@/lib/apiClients";
// import { generateText } from "ai";

// const prisma = new PrismaClient();

// // Enhanced chunk processing with smart merging
// async function processAudioChunk(
//   audioUrl: string,
//   language: string,
//   togetherApiKey?: string,
//   retryCount = 0
// ): Promise<string> {
//   const maxRetries = 3;

//   try {
//     const res = await togetherBaseClientWithKey(togetherApiKey).audio.transcriptions.create({
//       // @ts-ignore: Together API accepts file URL as string
//       file: audioUrl,
//       model: "openai/whisper-large-v3",
//       language: language || "en",
//       // Add these parameters for better large file handling
//       temperature: 0.0, // More deterministic output
//       response_format: "verbose_json", // Get timestamps for better merging
//     });

//     return typeof res.text === 'string' ? res.text : res.text || '';
//   } catch (error) {
//     console.error(`Chunk transcription error (attempt ${retryCount + 1}):`, error);

//     if (retryCount < maxRetries) {
//       // Exponential backoff
//       await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
//       return processAudioChunk(audioUrl, language, togetherApiKey, retryCount + 1);
//     }

//     throw error;
//   }
// }

// // Smart transcription merging with overlap handling
// function mergeTranscriptions(transcriptions: Array<{text: string, chunkIndex: number}>): string {
//   if (transcriptions.length === 0) return '';
//   if (transcriptions.length === 1) return transcriptions[0].text;

//   // Sort by chunk index to ensure proper order
//   const sortedTranscriptions = transcriptions.sort((a, b) => a.chunkIndex - b.chunkIndex);

//   let mergedText = sortedTranscriptions[0].text;

//   for (let i = 1; i < sortedTranscriptions.length; i++) {
//     const currentText = sortedTranscriptions[i].text;
//     const previousText = sortedTranscriptions[i - 1].text;

//     // Simple overlap detection and removal
//     const overlapDetected = findOverlap(previousText, currentText);

//     if (overlapDetected.length > 10) { // Significant overlap found
//       // Remove the overlapping part from the current text
//       const cleanCurrentText = currentText.slice(overlapDetected.length);
//       mergedText += ' ' + cleanCurrentText;
//     } else {
//       // No significant overlap, just append with space
//       mergedText += ' ' + currentText;
//     }
//   }

//   return mergedText.trim();
// }

// // Find overlapping text between end of previous and start of current
// function findOverlap(previous: string, current: string): string {
//   const prevWords = previous.trim().split(' ');
//   const currWords = current.trim().split(' ');

//   let maxOverlap = '';
//   const maxCheckLength = Math.min(10, prevWords.length, currWords.length); // Check up to 10 words

//   for (let i = 1; i <= maxCheckLength; i++) {
//     const prevEnd = prevWords.slice(-i).join(' ').toLowerCase();
//     const currStart = currWords.slice(0, i).join(' ').toLowerCase();

//     if (prevEnd === currStart) {
//       maxOverlap = currWords.slice(0, i).join(' ');
//     }
//   }

//   return maxOverlap;
// }

// // Enhanced title generation with better context
// async function generateSmartTitle(transcription: string, togetherApiKey?: string): Promise<string> {
//   try {
//     // Use first 500 characters for better context
//     const excerpt = transcription.slice(0, 500);

//     const { text: title } = await generateText({
//       prompt: `Analyze this transcription and create a concise, descriptive title (max 8 words, 60 characters):

// "${excerpt}"

// Requirements:
// - Focus on the main topic or theme
// - Be specific and descriptive
// - Avoid generic words like "recording" or "audio"
// - Return only the title, no quotes or explanation`,
//       model: togetherVercelAiClient(togetherApiKey)(
//         "meta-llama/Llama-3.3-70B-Instruct-Turbo"
//       ),
//       maxTokens: 15,
//       temperature: 0.3,
//     });

//     return title.trim().slice(0, 60) || 'Untitled Recording';
//   } catch (error) {
//     console.error('Title generation error:', error);
//     // Fallback to first few words
//     const words = transcription.trim().split(' ').slice(0, 6).join(' ');
//     return words.slice(0, 60) || 'Untitled Recording';
//   }
// }

// export const whisperRouter = t.router({
//   listWhispers: protectedProcedure.query(async ({ ctx }) => {
//     const whispers = await prisma.whisper.findMany({
//       where: { userId: ctx.auth.userId },
//       orderBy: { createdAt: "desc" },
//       include: {
//         audioTracks: {
//           select: {
//             id: true,
//             createdAt: true,
//           }
//         }
//       }
//     });

//     return whispers.map((w) => ({
//       id: w.id,
//       title: w.title,
//       content: w.fullTranscription,
//       preview:
//         w.fullTranscription.length > 100
//           ? w.fullTranscription.slice(0, 100) + "..."
//           : w.fullTranscription,
//       timestamp: w.createdAt.toISOString(),
//       chunkCount: w.audioTracks.length,
//       status: w.fullTranscription ? 'completed' : 'processing',
//     }));
//   }),

//   // Enhanced transcription endpoint with better large file support
//   transcribeFromS3: protectedProcedure
//     .input(
//       z.object({
//         audioUrl: z.string(),
//         whisperId: z.string().optional(),
//         language: z.string().optional().default("en"),
//         durationSeconds: z.number().min(1).max(3600), // Max 1 hour per chunk
//         chunkIndex: z.number().optional().default(0),
//         totalChunks: z.number().optional().default(1),
//         isRetry: z.boolean().optional().default(false),
//       })
//     )
//     .mutation(async ({ input, ctx }) => {
//       const {
//         audioUrl,
//         whisperId,
//         language,
//         durationSeconds,
//         chunkIndex,
//         totalChunks,
//         isRetry
//       } = input;

//       // Enforce minutes limit (only for new recordings, not retries)
//       if (!isRetry) {
//         const minutes = Math.ceil(durationSeconds / 60);
//         console.log("Processing audio chunk:", { chunkIndex, totalChunks, minutes });

//         const limitResult = await limitMinutes({
//           clerkUserId: ctx.auth.userId,
//           isBringingKey: !!ctx.togetherApiKey,
//           minutes,
//         });

//         if (!limitResult.success) {
//           throw new Error("You have exceeded your daily audio minutes limit.");
//         }
//       }

//       // Process the audio chunk with enhanced error handling
//       const transcription = await processAudioChunk(
//         audioUrl,
//         language,
//         ctx.togetherApiKey
//       );

//       if (!transcription || transcription.trim().length === 0) {
//         throw new Error("Transcription failed - no text generated");
//       }

//       const finalWhisperId = whisperId || uuidv4();

//       if (whisperId) {
//         // Add AudioTrack to existing Whisper
//         const whisper = await prisma.whisper.findUnique({
//           where: { id: whisperId },
//           include: {
//             audioTracks: {
//               orderBy: { createdAt: 'asc' }
//             }
//           }
//         });

//         if (!whisper) {
//           throw new Error("Recording session not found");
//         }

//         // Create new AudioTrack with chunk metadata
//         await prisma.audioTrack.create({
//           data: {
//             fileUrl: audioUrl,
//             partialTranscription: transcription,
//             whisperId: whisperId,
//             language: language,
//             chunkIndex: chunkIndex,
//             durationSeconds: durationSeconds,
//           },
//         });

//         // Get all chunks and merge intelligently
//         const allTracks = await prisma.audioTrack.findMany({
//           where: { whisperId: whisperId },
//           orderBy: { chunkIndex: 'asc' }
//         });

//         // Smart merge of all transcriptions
//         const transcriptionsWithIndex = allTracks.map(track => ({
//           text: track.partialTranscription,
//           chunkIndex: track.chunkIndex || 0
//         }));

//         const mergedTranscription = mergeTranscriptions(transcriptionsWithIndex);

//         // Update with merged transcription
//         await prisma.whisper.update({
//           where: { id: whisperId },
//           data: {
//             fullTranscription: mergedTranscription,
//             // Update title if this is the last chunk and we have substantial content
//             ...(allTracks.length >= totalChunks && mergedTranscription.length > 100 ? {
//               title: await generateSmartTitle(mergedTranscription, ctx.togetherApiKey)
//             } : {})
//           },
//         });

//       } else {
//         // Create new Whisper for first chunk
//         const initialTitle = transcription.length > 50
//           ? await generateSmartTitle(transcription, ctx.togetherApiKey)
//           : 'Recording in progress...';

//         await prisma.whisper.create({
//           data: {
//             id: finalWhisperId,
//             title: initialTitle,
//             userId: ctx.auth.userId,
//             fullTranscription: transcription,
//             audioTracks: {
//               create: [{
//                 fileUrl: audioUrl,
//                 partialTranscription: transcription,
//                 language: language,
//                 chunkIndex: chunkIndex,
//                 durationSeconds: durationSeconds,
//               }],
//             },
//           },
//         });
//       }

//       return {
//         id: finalWhisperId,
//         chunkIndex,
//         totalChunks,
//         transcriptionLength: transcription.length
//       };
//     }),

//   // New endpoint for batch processing status
//   getProcessingStatus: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .query(async ({ input, ctx }) => {
//       const whisper = await prisma.whisper.findUnique({
//         where: {
//           id: input.id,
//           userId: ctx.auth.userId
//         },
//         include: {
//           audioTracks: {
//             select: {
//               id: true,
//               chunkIndex: true,
//               createdAt: true,
//               durationSeconds: true,
//             },
//             orderBy: { chunkIndex: 'asc' }
//           }
//         }
//       });

//       if (!whisper) {
//         throw new Error("Recording not found");
//       }

//       const totalDuration = whisper.audioTracks.reduce(
//         (sum, track) => sum + (track.durationSeconds || 0),
//         0
//       );

//       return {
//         id: whisper.id,
//         title: whisper.title,
//         status: whisper.fullTranscription ? 'completed' : 'processing',
//         chunksProcessed: whisper.audioTracks.length,
//         totalDurationSeconds: totalDuration,
//         transcriptionLength: whisper.fullTranscription.length,
//         lastUpdated: whisper.updatedAt,
//       };
//     }),

//   // Retry failed chunk
//   retryChunk: protectedProcedure
//     .input(z.object({
//       whisperId: z.string(),
//       audioUrl: z.string(),
//       chunkIndex: z.number(),
//       language: z.string().optional().default("en"),
//       durationSeconds: z.number(),
//     }))
//     .mutation(async ({ input, ctx }) => {
//       // Use the main transcribe endpoint with retry flag
//       return await whisperRouter
//         .createCaller({ auth: ctx.auth, togetherApiKey: ctx.togetherApiKey })
//         .transcribeFromS3({
//           ...input,
//           whisperId: input.whisperId,
//           isRetry: true,
//         });
//     }),

//   getWhisperWithTracks: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .query(async ({ input, ctx }) => {
//       const whisper = await prisma.whisper.findUnique({
//         where: {
//           id: input.id,
//           userId: ctx.auth.userId
//         },
//         include: {
//           audioTracks: {
//             orderBy: { chunkIndex: 'asc' }
//           },
//           transformations: {
//             orderBy: { createdAt: "asc" }
//           },
//         },
//       });

//       if (!whisper) {
//         throw new Error("Recording not found");
//       }

//       return whisper;
//     }),

//   updateFullTranscription: protectedProcedure
//     .input(z.object({
//       id: z.string(),
//       fullTranscription: z.string().max(100000) // Reasonable limit
//     }))
//     .mutation(async ({ input, ctx }) => {
//       const whisper = await prisma.whisper.findUnique({
//         where: { id: input.id },
//       });

//       if (!whisper) throw new Error("Recording not found");
//       if (whisper.userId !== ctx.auth.userId) throw new Error("Unauthorized");

//       const updated = await prisma.whisper.update({
//         where: { id: input.id },
//         data: {
//           fullTranscription: input.fullTranscription,
//           updatedAt: new Date(),
//         },
//       });

//       return {
//         id: updated.id,
//         fullTranscription: updated.fullTranscription
//       };
//     }),

//   updateTitle: protectedProcedure
//     .input(z.object({
//       id: z.string(),
//       title: z.string().min(1).max(80)
//     }))
//     .mutation(async ({ input, ctx }) => {
//       const whisper = await prisma.whisper.findUnique({
//         where: { id: input.id },
//       });

//       if (!whisper) throw new Error("Recording not found");
//       if (whisper.userId !== ctx.auth.userId) throw new Error("Unauthorized");

//       const updated = await prisma.whisper.update({
//         where: { id: input.id },
//         data: {
//           title: input.title,
//           updatedAt: new Date(),
//         },
//       });

//       return {
//         id: updated.id,
//         title: updated.title
//       };
//     }),

//   deleteWhisper: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input, ctx }) => {
//       const whisper = await prisma.whisper.findUnique({
//         where: { id: input.id },
//       });

//       if (!whisper) throw new Error("Recording not found");
//       if (whisper.userId !== ctx.auth.userId) throw new Error("Unauthorized");

//       // Use transaction for data consistency
//       await prisma.$transaction(async (tx) => {
//         // Delete all related Transformations
//         await tx.transformation.deleteMany({
//           where: { whisperId: input.id },
//         });

//         // Delete all related AudioTracks
//         await tx.audioTrack.deleteMany({
//           where: { whisperId: input.id },
//         });

//         // Delete the Whisper
//         await tx.whisper.delete({
//           where: { id: input.id },
//         });
//       });

//       return { id: input.id };
//     }),
// });
