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
      include: {
        tags: {
          orderBy: { createdAt: "asc" },
        },
        transformations: {
          orderBy: { createdAt: "asc" },
        },
      },
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
      tags: w.tags,
      transforms: w.transformations,
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
    .query(async ({ input, ctx }) => {
      const whisper = await prisma.whisper.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId, // Ensure user can only access their own whispers
        },
        include: {
          audioTracks: {
            orderBy: { createdAt: "asc" },
          },
          transformations: {
            orderBy: { createdAt: "asc" },
          },
          tags: {
            orderBy: { createdAt: "asc" },
          },
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

  addTag: protectedProcedure
    .input(
      z.object({
        whisperId: z.string(),
        tagName: z.string().min(1).max(50),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the whisper belongs to the user
      const whisper = await prisma.whisper.findUnique({
        where: {
          id: input.whisperId,
          userId: ctx.auth.userId,
        },
        include: {
          tags: true,
        },
      });

      if (!whisper) {
        throw new Error(
          "RMBL not found or you don't have permission to access it"
        );
      }

      // Check if tag already exists for this whisper (case-insensitive)
      const existingTag = whisper.tags?.find(
        (tag: { name: string }) =>
          tag.name.toLowerCase() === input.tagName.toLowerCase()
      );

      if (existingTag) {
        throw new Error("Tag already exists for this transcription");
      }

      // Check tag limit (optional - you can set a reasonable limit like 20 tags per whisper)
      if (whisper.tags && whisper.tags.length >= 20) {
        throw new Error("Maximum number of tags reached (20)");
      }

      // Create the new tag
      const newTag = await prisma.tag.create({
        data: {
          id: uuidv4(),
          name: input.tagName.trim(),
          color: input.color,
          whisperId: input.whisperId,
          userId: ctx.auth.userId,
        },
      });

      return {
        id: newTag.id,
        name: newTag.name,
        color: newTag.color,
        createdAt: newTag.createdAt,
      };
    }),

  removeTag: protectedProcedure
    .input(
      z.object({
        whisperId: z.string(),
        tagId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the whisper belongs to the user
      const whisper = await prisma.whisper.findUnique({
        where: {
          id: input.whisperId,
          userId: ctx.auth.userId,
        },
      });

      if (!whisper) {
        throw new Error(
          "RMBL not found or you don't have permission to access it"
        );
      }

      // Verify the tag belongs to this whisper and user
      const tag = await prisma.tag.findUnique({
        where: {
          id: input.tagId,
          whisperId: input.whisperId,
          userId: ctx.auth.userId,
        },
      });

      if (!tag) {
        throw new Error(
          "Tag not found or you don't have permission to remove it"
        );
      }

      // Delete the tag
      await prisma.tag.delete({
        where: { id: input.tagId },
      });

      return {
        success: true,
        deletedTagId: input.tagId,
        message: "Tag removed successfully",
      };
    }),

  // Get all tags for a user (useful for tag suggestions/autocomplete)
  getUserTags: protectedProcedure.query(async ({ ctx }) => {
    const tags = await prisma.tag.findMany({
      where: { userId: ctx.auth.userId },
      distinct: ["name"],
      orderBy: { name: "asc" },
      select: {
        name: true,
        color: true,
      },
    });
    return tags;
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

      // Use transaction to ensure data integrity
      await prisma.$transaction(async (tx) => {
        // Delete all related Tags first
        await tx.tag.deleteMany({
          where: { whisperId: input.id },
        });

        // Delete all related Transformations
        await tx.transformation.deleteMany({
          where: { whisperId: input.id },
        });

        // Delete all related AudioTracks
        await tx.audioTrack.deleteMany({
          where: { whisperId: input.id },
        });

        // Now delete the Whisper
        await tx.whisper.delete({
          where: { id: input.id },
        });
      });

      return { id: input.id };
    }),
});
