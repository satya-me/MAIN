const EnterpriseStateModel = require('../../models/enterprise_state.model');
const EnterpriseStateLocationModel = require('../../models/enterprise_state_location.model');
const GatewayModel = require('../../models/gateway.model');
const OptimizerModel = require('../../models/optimizer.model');


// check enterprise state
exports.CheckEntState = async (req, res, next) => {
    const { Enterprise_ID, State_ID } = req.body;
    const { ent_state_id } = req.params;

    try {

        if (!Enterprise_ID) {
            return res.status(401).json({ success: false, message: "Enterprise is required!", key: "Enterprise_ID" });

        }
        if (!State_ID) {
            return res.status(401).json({ success: false, message: "State is required!", key: "State_ID" });

        }

        if (!ent_state_id) {
            const existingEntState = await EnterpriseStateModel.findOne({ Enterprise_ID, State_ID });
            if (existingEntState) {
                return res.status(401).json({ success: false, message: "State already added under this enterprise!" });
            }
        }
        next();

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
};

// check enterprise state location
exports.CheckEntStateLocation = async (req, res, next) => {
    const { Enterprise_ID, State_ID, LocationName, Address } = req.body;
    const { location_id } = req.params;

    try {
        if (!Enterprise_ID) {
            return res.status(401).json({ success: false, message: "Enterprise is required!", key: "Enterprise_ID" });

        }
        if (!State_ID) {
            return res.status(401).json({ success: false, message: "State is required!", key: "State_ID" });

        }
        if (!LocationName) {
            return res.status(401).json({ success: false, message: "Location name is required!", key: "LocationName" });

        }
        if (!Address) {
            return res.status(401).json({ success: false, message: "An Address is required!", key: "Address" });

        }


        if (!location_id) {
            const lowerCaseAddressName = Address.toLowerCase();
            // Assuming EnterpriseStateLocationModel is your Mongoose model
            const allLocations = await EnterpriseStateLocationModel.find({});
            // Check for existing records with the lowercase address name
            for (const location of allLocations) {
                const dbLocationName = location.Address.toLowerCase();
                if (lowerCaseAddressName === dbLocationName) {
                    return res.status(401).json({ success: false, message: "Same address already added under this location.", key: "Address" });
                }
            }
        }

        next();

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
};

// Add gateway empty field check
exports.CheckGateway = async (req, res, next) => {
    const { EnterpriseInfo, OnboardingDate, GatewayID, NetworkSSID, NetworkPassword, EnterpriseUserID } = req.body;
    const { gateway_id } = req.params;

    try {

        if (!EnterpriseInfo) {
            return res.status(401).json({ success: false, message: "Enterprise Information is required!", key: "EnterpriseInfo" });

        }
        if (!OnboardingDate) {
            return res.status(401).json({ success: false, message: "Onboarding Date is required!", key: "OnboardingDate" });

        }
        if (!GatewayID) {
            return res.status(401).json({ success: false, message: "GatewayID is required!", key: "GatewayID" });

        }
        if (!NetworkSSID) {
            return res.status(401).json({ success: false, message: "NetworkSSID is required!", key: "NetworkSSID" });

        }
        if (!NetworkPassword) {
            return res.status(401).json({ success: false, message: "Network Password is required!", key: "NetworkPassword" });

        }
        if (!EnterpriseUserID) {
            return res.status(401).json({ success: false, message: "Enterprise User is required!", key: "EnterpriseUser" });

        }

        if (!gateway_id) {
            const ExsistingGateway = await GatewayModel.findOne({ GatewayID });
            if (ExsistingGateway) {
                return res.status(409).json({ success: false, message: 'A gateway with the provided ID already exists. Please choose a different ID.', key: 'GatewayID' });
            }
        }

        next();

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
};

// Add optimizer empty field check
exports.CheckOptimizer = async (req, res, next) => {
    const { GatewayId, OptimizerID, OptimizerName } = req.body;
    const { optimizer_id } = req.params;

    try {

        if (!GatewayId) {
            return res.status(401).json({ success: false, message: "GatewayId is required!", key: "GatewayId" });

        }
        if (!OptimizerID) {
            return res.status(401).json({ success: false, message: "OptimizerID is required!", key: "OptimizerID" });

        }
        if (!OptimizerName) {
            return res.status(401).json({ success: false, message: "Optimizer name is required!", key: "OptimizerName" });

        }
        if (!optimizer_id) {
            const ExsistingOptimizer = await OptimizerModel.findOne({ OptimizerID });
            if (ExsistingOptimizer) {
                return res.status(409).json({ success: false, message: 'A optimizer with the provided ID already exists. Please choose a different ID.', key: 'OptimizerID' });
            }
        }

        next();

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
};