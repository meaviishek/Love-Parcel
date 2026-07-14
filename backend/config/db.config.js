import { prisma } from "./prisma.js"

export const DB = {
    async connectPrismaToDB() {
        try {
            await prisma.$connect();
            console.log("✅ Prisma connected to DB");
        } catch (error) {
            console.error("❌ Prisma connection to DB failed:", error);
            throw error;
        }
    }
}
