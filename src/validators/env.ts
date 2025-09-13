import z from "zod"

const envSchema = z.object({
    PORT: z.number().default(5473),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_REDIRECT_URL: z.url()
})

const env = envSchema.parse(process.env);

export { env }