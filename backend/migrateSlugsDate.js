import { prisma } from "./config/prisma.js";

const migrateSlugs = async () => {
    try {
        console.log("Starting slug migration (Title + Date)...");
        const events = await prisma.event.findMany();

        console.log(`Found ${events.length} events to process.`);

        for (const event of events) {
            // Parse Date
            let dateSuffix = '';
            try {
                // Try to parse the date string or object
                const dateObj = new Date(event.date);
                if (!isNaN(dateObj.getTime())) {
                    dateSuffix = `-${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                }
            } catch (e) {
                console.log(`Could not parse date for event: ${event.title}`);
            }

            let baseSlug = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            if (!baseSlug) baseSlug = "event";

            // Append Date Suffix
            baseSlug = `${baseSlug}${dateSuffix}`;

            let slug = baseSlug;
            let count = 1;

            // Check for collision (excluding self if we were updating, but here we just overwrite)
            // We need to check if ANY OTHER event has this slug. 
            // Ideally we check `findFirst` where slug = slug AND id != event.id
            while (await prisma.event.findFirst({ where: { slug, NOT: { id: event.id } } })) {
                slug = `${baseSlug}-${count}`;
                count++;
            }

            await prisma.event.update({
                where: { id: event.id },
                data: { slug }
            });

            console.log(`Updated event "${event.title}" -> ${slug}`);
        }

        console.log("Migration complete.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
};

migrateSlugs();
