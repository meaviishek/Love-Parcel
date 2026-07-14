import prisma from "../../lib/prisma.js";

export const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await prisma.address.findMany({
            where: { userId }
        });
        res.status(200).json({ status: "success", data: addresses });
    } catch (error) {
        console.error("Get addresses error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, house, area, landmark, city, state, pincode } = req.body;

        if (!fullName || !phone || !house || !city || !state || !pincode) {
            return res.status(400).json({ status: "fail", message: "Missing required fields" });
        }

        const newAddress = await prisma.address.create({
            data: {
                userId,
                fullName,
                phone,
                house,
                area: area || "",
                landmark,
                city,
                state,
                pincode
            }
        });

        res.status(201).json({ status: "success", data: newAddress });
    } catch (error) {
        console.error("Add address error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { fullName, phone, house, area, landmark, city, state, pincode } = req.body;

        const address = await prisma.address.findUnique({ where: { id } });

        if (!address || address.userId !== userId) {
            return res.status(404).json({ status: "fail", message: "Address not found" });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                fullName,
                phone,
                house,
                area,
                landmark,
                city,
                state,
                pincode
            }
        });

        res.status(200).json({ status: "success", data: updatedAddress });
    } catch (error) {
        console.error("Update address error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const address = await prisma.address.findUnique({ where: { id } });

        if (!address || address.userId !== userId) {
            return res.status(404).json({ status: "fail", message: "Address not found" });
        }

        await prisma.address.delete({ where: { id } });

        res.status(200).json({ status: "success", message: "Address deleted" });
    } catch (error) {
        console.error("Delete address error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
