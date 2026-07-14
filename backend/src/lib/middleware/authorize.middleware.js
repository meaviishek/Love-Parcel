import { can } from "../permission/can.js"

export function authorize(permission, options = {}) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    message: "UNAUTHENTICATED"
                });
            }

            const { eventRole } = options;

            const context = {
                platformRole: req.user.platformRole
    
            };

            // ! ADD BEFORE CAN
            if (!can(permission, context)) {
                return res.status(403).json({ message: "FORBIDDEN: INSUFFICIENT_PERMISSION" });
            }

            next();
        } catch (error) {
            console.error("Authorization error:", err);
            return res.status(500).json({
                message: "AUTHORIZATION_FAILED",
            });
        }


        // const { eventRole } = options;

        // const context = {
        //     platformRole: req.user.platformRole,
        //     eventRole: eventRole ? req.eventRole : undefined
        // };

        // if(!can(permission, context)){
        //     return res.status(403).json({
        //         message: "Forbidden: insufficient permission"
        //     });
        // }
        // next();
    }
}
