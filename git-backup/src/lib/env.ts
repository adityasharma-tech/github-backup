import z from "zod"

const envSchema = z.object({
    NEXT_PUBLIC_GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    NEXT_PUBLIC_GITHUB_REDIRECT_URL: z.url()
})

const env = envSchema.safeParse(process.env).data!;

export { env }