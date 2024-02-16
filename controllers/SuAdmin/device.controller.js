const EnterpriseStateModel = require('../../models/enterprise_state.model');
const EnterpriseStateLocationModel = require('../../models/enterprise_state_location.model');
const GatewayModel = require('../../models/gateway.model');
const OptimizerModel = require('../../models/optimizer.model');
const { deleteEnterprise, deleteState, deleteLocation, deleteGateway, deleteOptimizer } = require('../../services/delete.service');



/********** ADD ***********/
// AddEnterpriseState
exports.AddEnterpriseState = async (req, res) => {
    const { Enterprise_ID, State_ID } = req.body;
    try {
        const NewEntState = new EnterpriseStateModel({ Enterprise_ID, State_ID });

        await NewEntState.save();
        return res.status(201).json({ success: true, message: "Enterprise state added successfully." });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
};

// AddEnterpriseStateLocation
exports.AddEnterpriseStateLocation = async (req, res) => {
    const { Enterprise_ID, State_ID, LocationName, Address } = req.body;
    try {
        const NewEntStateLocation = new EnterpriseStateLocationModel({ Enterprise_ID, State_ID, LocationName, Address });

        await NewEntStateLocation.save();
        return res.status(201).json({ success: true, message: "Enterprise Location added successfully." });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
}

// Add gateway
exports.AddGateway = async (req, res) => {
    const { EnterpriseInfo, OnboardingDate, GatewayID, NetworkSSID, NetworkPassword, EnterpriseUserID } = req.body;
    try {
        const NewGateway = new GatewayModel({
            EnterpriseInfo,
            OnboardingDate,
            GatewayID,
            NetworkSSID,
            NetworkPassword,
            EnterpriseUserID,
        });

        await NewGateway.save();
        return res.status(201).json({ success: true, message: "Gateway added successfully." });

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

// Add Optimizer
exports.AddOptimizer = async (req, res) => {
    const { GatewayId, OptimizerID, OptimizerName } = req.body;
    try {
        const GATEWAY = await GatewayModel.findOne({ GatewayID: GatewayId });
        const NewOptimizer = new OptimizerModel({
            GatewayId: GATEWAY._id, // primary _id of that Gateway
            OptimizerID,
            OptimizerName,
        });

        await NewOptimizer.save();
        return res.status(201).json({ success: true, message: "Optimizer added successfully." });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}


/********** UPDATE ***********/
// UpdateEnterpriseState
exports.UpdateEnterpriseState = async (req, res) => {
    const { Enterprise_ID, State_ID } = req.body;
    const { ent_state_id } = req.params;

    try {
        const EntState = await EnterpriseStateModel.findOne({ _id: ent_state_id });

        if (EntState) {
            await EnterpriseStateModel.findByIdAndUpdate({ _id: ent_state_id },
                {
                    Enterprise_ID,
                    State_ID,
                },
                { new: true }); // This option returns the modified document rather than the original);
            return res.status(201).json({ success: true, message: "Enterprise state updated successfully." });
        } else {
            return res.status(201).json({ success: true, message: "Enterprise state not found." });
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
};

// Update EnterpriseStateLocation
exports.UpdateEnterpriseStateLocation = async (req, res) => {
    const { Enterprise_ID, State_ID, LocationName, Address } = req.body;
    const { location_id } = req.params;

    try {
        const EntStateLocation = await EnterpriseStateLocationModel.findOne({ _id: location_id, Enterprise_ID, State_ID });
        console.log(EntStateLocation);
        if (EntStateLocation) {
            await EnterpriseStateLocationModel.findByIdAndUpdate({ _id: location_id },
                {
                    Enterprise_ID,
                    State_ID,
                    LocationName,
                    Address,
                },
                { new: true }); // This option returns the modified document rather than the original);
            return res.status(201).json({ success: true, message: "Enterprise Location updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Enterprise Location not found." });
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", err: error.message });
    }
}

// Update Gateway
exports.UpdateGateway = async (req, res) => {
    const { EnterpriseInfo, OnboardingDate, GatewayID, NetworkSSID, NetworkPassword, EnterpriseUserID } = req.body;
    const { gateway_id } = req.params;

    try {
        const Gateway = await GatewayModel.find({ _id: gateway_id, EnterpriseInfo: EnterpriseInfo, GatewayID: GatewayID, EnterpriseUserID: EnterpriseUserID });
        if (Gateway.length > 0) {
            await GatewayModel.findByIdAndUpdate({ _id: gateway_id },
                {
                    EnterpriseInfo,
                    OnboardingDate,
                    GatewayID,
                    NetworkSSID,
                    NetworkPassword,
                    EnterpriseUserID
                },
                { new: true } // This option returns the modified document rather than the original
            );
            return res.status(200).json({ success: true, message: "Gateway updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Gateway not found." });
        }

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

// Update Optimizer
exports.UpdateOptimizer = async (req, res) => {
    const { GatewayId, OptimizerID, OptimizerName } = req.body;
    const { optimizer_id } = req.params;
    try {
        const GATEWAY = await GatewayModel.findOne({ GatewayID: GatewayId });
        const OPTIMIZER = await OptimizerModel.findOne({ OptimizerID: optimizer_id });
        const Optimizer = await OptimizerModel.findOne({ _id: OPTIMIZER._id, GatewayId: GATEWAY._id });

        if (Optimizer) {
            await OptimizerModel.findByIdAndUpdate({ _id: OPTIMIZER._id },
                {
                    GatewayId: GATEWAY._id, // primary _id of that Gateway
                    OptimizerID,
                    OptimizerName,
                    Switch: false,
                    isDelete: false,
                },
                { new: true }) // This option returns the modified document rather than the original);
            return res.status(201).json({ success: true, message: "Optimizer Updated successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Optimizer not found." });
        }
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}


/********** DELETE ***********/
// Delete All
exports.DeleteAll = async (req, res) => {
    const { group, id } = req.body;

    try {
        if (!(group && id)) {
            return res.status(400).json({ success: false, message: "Group and ID are required for deletion." });
        }

        let deleteResult;
        switch (group) {
            case 'enterprise':
                deleteResult = await deleteEnterprise(id);
                break;
            case 'state':
                deleteResult = await deleteState(id);
                break;
            case 'location':
                deleteResult = await deleteLocation(id);
                break;
            case 'gateway':
                deleteResult = await deleteGateway(id);
                break;
            case 'optimizer':
                deleteResult = await deleteOptimizer(id);
                break;
            default:
                return res.status(404).json({ success: false, message: "Invalid group specified for deletion." });
        }

        return res.status(deleteResult.success ? 200 : 404).json(deleteResult);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};





//************* Test Delete **************//
// Delete gateway
exports.DeleteOptimizer = async (req, res) => {
    const { gateway_id } = req.params;

    try {
        // Find and delete all Optimizers associated with the Gateway
        const deletedOptimizer = await OptimizerModel.deleteMany({ GatewayId: gateway_id });

        if (deletedOptimizer) {
            return res.status(200).json({ success: true, message: "Associated Optimizers deleted successfully." });
        } else {
            return res.status(404).json({ success: false, message: "Gateway not found." });
        }

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};