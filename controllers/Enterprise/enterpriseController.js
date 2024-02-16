const EnterpriseAdminModel = require('../../models/enterprise.model');
const EnterpriseStateModel = require('../../models/enterprise_state.model');
const EnterpriseStateLocationModel = require('../../models/enterprise_state_location.model');
const GatewayModel = require('../../models/gateway.model');
const UserModel = require('../../models/user.model');
const bcrypt = require('bcrypt');
const { decode } = require('../../utility/JwtDecoder');
const OptimizerModel = require('../../models/optimizer.model');
const GatewayLogModel = require('../../models/GatewayLog.model');
const OptimizerLogModel = require('../../models/OptimizerLog.model');



// EnterpriseList
exports.EnterpriseListData = async (req, res) => {
    try {
        const AllEnt = await EnterpriseAdminModel.find({});

        if (req.params.flag === 'name') {
            return res.status(200).json({ success: true, message: "Data fetched successfully", data: AllEnt });
        }

        if (req.params.flag === 'data') {
            const getAllEnterpriseLocation = async (entId) => {
                const data = await EnterpriseStateLocationModel.find({ Enterprise_ID: entId }).exec();
                // console.log("Location=>", data);
                return data;
            };

            const getAllEnterpriseGateway = async (entInfoID) => {
                const data = await GatewayModel.find({ EnterpriseInfo: entInfoID }).exec();
                // console.log("Gateway=>", data);
                return data;
            };

            const getAllEnterpriseOptimizer = async (gatewayID) => {
                const data = await OptimizerModel.find({ GatewayId: gatewayID }).exec();
                // console.log("Optimizer=>", data);
                return data;
            };

            const updatedAllEnt = await Promise.all(AllEnt.map(async (ent) => {
                // Getting all the locations
                const LocationData = await getAllEnterpriseLocation(ent._id);

                // Getting all the gateways
                const GatewayData = await Promise.all(LocationData.map(async (location) => {
                    return await getAllEnterpriseGateway(location._id);
                }));
                const FlattenedGatewayData = GatewayData.flat(); // Use flat to flatten the array

                // Getting all the optimizers
                const OptimizerData = await Promise.all(FlattenedGatewayData.map(async (gateway) => {
                    return await getAllEnterpriseOptimizer(gateway._id);
                }));
                const FlattenedOptimizerData = OptimizerData.flat();


                const data = {
                    location: LocationData.length,
                    gateway: FlattenedGatewayData.length,
                    optimizer: FlattenedOptimizerData.length,
                    power_save_unit: Math.round(Math.random() * (300 - 100) + 1),
                };

                return { ...ent._doc, data };
            }));

            return res.status(200).json({ success: true, message: "Data fetched successfully", data: updatedAllEnt });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

// EnterpriseStateList
exports.EnterpriseStateList = async (req, res) => {
    const { enterprise_id } = req.params;

    try {
        const AllEnterpriseState = await EnterpriseStateModel.find({ Enterprise_ID: enterprise_id }).populate({
            path: 'Enterprise_ID'
        }).populate({
            path: 'State_ID'
        });


        if (AllEnterpriseState.length === 0) {
            return res.status(404).send({ success: false, message: 'No data found for the given enterprise ID.' });
        }

        // Extract the common Enterprise_ID data from the first object
        const { Enterprise_ID, ...commonEnterpriseData } = AllEnterpriseState[0].Enterprise_ID;
        const commonEnterpriseDataWithDoc = { ...commonEnterpriseData._doc };

        const getAllEnterpriseLocation = async (entId, stateId) => {
            const data = await EnterpriseStateLocationModel.find({ Enterprise_ID: entId, State_ID: stateId }).exec();
            // console.log("Location=>", data);
            return data;
        };

        const getAllEnterpriseGateway = async (entInfoID) => {
            const data = await GatewayModel.find({ EnterpriseInfo: entInfoID }).exec();
            // console.log("Gateway=>", data);
            return data;
        };

        const getAllEnterpriseOptimizer = async (gatewayID) => {
            const data = await OptimizerModel.find({ GatewayId: gatewayID }).exec();
            // console.log("Optimizer=>", data);
            return data;
        };

        // Map through the array and add the fields to each object
        const AllEntState = await Promise.all(AllEnterpriseState.map(async (item) => {
            // Getting all the locations
            const LocationData = await getAllEnterpriseLocation(item.Enterprise_ID._id, item.State_ID._id);

            // Getting all the gateways
            const GatewayData = await Promise.all(LocationData.map(async (location) => {
                return await getAllEnterpriseGateway(location._id);
            }));
            const FlattenedGatewayData = GatewayData.flat(); // Use flat to flatten the array

            // Getting all the optimizers
            const OptimizerData = await Promise.all(FlattenedGatewayData.map(async (gateway) => {
                return await getAllEnterpriseOptimizer(gateway._id);
            }));
            const FlattenedOptimizerData = OptimizerData.flat();


            const data = {
                location: LocationData.length,
                gateway: FlattenedGatewayData.length,
                optimizer: FlattenedOptimizerData.length,
                power_save_unit: Math.round(Math.random() * (300 - 100) + 1),
            };

            return { ...item._doc, data };
        }));

        // Remove "Enterprise_ID" field from AllEntState
        AllEntState.forEach(state => {
            delete state.Enterprise_ID;
        });

        // console.log(AllEntState);
        return res.status(200).json(
            {
                success: true,
                message: "Data fetched successfully",
                commonEnterpriseData: commonEnterpriseDataWithDoc,
                AllEntState
            }
        );
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }

}

// EnterpriseStateLocationList
exports.EnterpriseStateLocationList = async (req, res) => {
    const { enterprise_id, state_id } = req.params;

    try {
        const AllEnterpriseStateLocation = await EnterpriseStateLocationModel.find({ Enterprise_ID: enterprise_id, State_ID: state_id }).populate({
            path: 'Enterprise_ID'
        }).populate({
            path: 'State_ID'
        });

        if (AllEnterpriseStateLocation.length === 0) {
            return res.status(404).send({ success: false, message: 'No data found for the given enterprise ID.' });
        }

        // Extract the common Enterprise_ID data from the first object
        const { Enterprise_ID, ...commonEnterpriseData } = AllEnterpriseStateLocation[0].Enterprise_ID;
        const commonEnterpriseDataWithDoc = { ...commonEnterpriseData._doc };

        // Extract the common State_ID data from the first object
        const { State_ID, ...commonStateData } = AllEnterpriseStateLocation[0].State_ID;
        const commonStateDataWithDoc = { ...commonStateData._doc };

        const getAllEnterpriseGateway = async (entInfoID) => {
            const data = await GatewayModel.find({ EnterpriseInfo: entInfoID }).exec();
            // console.log("Gateway=>", data);
            return data;
        };

        const getAllEnterpriseOptimizer = async (gatewayID) => {
            const data = await OptimizerModel.find({ GatewayId: gatewayID }).exec();
            // console.log("Optimizer=>", data);
            return data;
        };

        // Map through the array and add the fields to each object
        const AllEntStateLocation = await Promise.all(AllEnterpriseStateLocation.map(async (location) => {
            // Getting all the gateways
            const GatewayData = await getAllEnterpriseGateway(location._id);
            const FlattenedGatewayData = GatewayData.flat(); // Use flat to flatten the array

            // Getting all the optimizers
            const OptimizerData = await Promise.all(FlattenedGatewayData.map(async (gateway) => {
                return await getAllEnterpriseOptimizer(gateway._id);
            }));
            const FlattenedOptimizerData = OptimizerData.flat();

            const data = {
                gateway: FlattenedGatewayData.length,
                optimizer: FlattenedOptimizerData.length,
                power_save_unit: Math.round(Math.random() * (300 - 100) + 1),
            };

            return { ...location._doc, data };
        }));

        // Remove "Enterprise_ID" & "State_ID" fields from AllEntStateLocation
        AllEntStateLocation.forEach(ent => {
            delete ent.Enterprise_ID;
            delete ent.State_ID;
        });


        // console.log(AllEntStateLocation);
        return res.status(200).json(
            {
                success: true,
                message: "Data fetched successfully",
                commonEnterpriseData: commonEnterpriseDataWithDoc,
                commonStateData: commonStateDataWithDoc,
                AllEntStateLocation
            }
        );
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

// EnterpriseStateLocationGatewayList
exports.EnterpriseStateLocationGatewayList = async (req, res) => {
    const { enterpriseInfo_id } = req.params;

    try {
        const AllEnterpriseStateLocationGateway = await GatewayModel.find({ EnterpriseInfo: enterpriseInfo_id }).populate({
            path: 'EnterpriseInfo',
            populate: [
                {
                    path: 'Enterprise_ID',
                },
                {
                    path: 'State_ID',
                },
            ]
        });

        if (AllEnterpriseStateLocationGateway.length === 0) {
            return res.status(404).send({ success: false, message: 'No data found for the given enterprise ID.' });
        }

        // Extract the common Enterprise_ID data from the first object
        const { Enterprise_ID, ...commonEnterpriseData } = AllEnterpriseStateLocationGateway[0].EnterpriseInfo.Enterprise_ID;
        const commonEnterpriseDataWithDoc = { ...commonEnterpriseData._doc };

        // Extract the common State_ID data from the first object
        const { State_ID, ...commonStateData } = AllEnterpriseStateLocationGateway[0].EnterpriseInfo.State_ID;
        const commonStateDataWithDoc = { ...commonStateData._doc };

        // Dynamic extraction of fields for commonLocationDataDoc
        const LocationData = { ...AllEnterpriseStateLocationGateway[0].EnterpriseInfo };
        const commonLocationDataDoc = { ...LocationData._doc };
        if (commonLocationDataDoc.Enterprise_ID && commonLocationDataDoc.State_ID) {
            delete commonLocationDataDoc.Enterprise_ID;
            delete commonLocationDataDoc.State_ID;
        } else {
            return commonLocationDataDoc;
        };

        const getAllEnterpriseOptimizer = async (gatewayID) => {
            const data = await OptimizerModel.find({ GatewayId: gatewayID }).exec();
            // console.log("Optimizer=>", data);
            return data;
        };

        // Map through the array and add the fields to each object
        const AllEntStateLocationGateway = await Promise.all(AllEnterpriseStateLocationGateway.map(async (gateway) => {
            // Getting all the optimizers
            const OptimizerData = await getAllEnterpriseOptimizer(gateway._id);
            const FlattenedOptimizerData = OptimizerData.flat();

            const data = {
                optimizer: FlattenedOptimizerData.length,
                power_save_unit: Math.round(Math.random() * (300 - 100) + 1),
            };

            return { ...gateway._doc, data };
        }));

        // Remove "EnterpriseInfo" field from AllEntStateLocationGateway
        AllEntStateLocationGateway.forEach(ent => {
            delete ent.EnterpriseInfo;
        });

        // return res.send(AllEnterpriseStateLocationGateway[0].EnterpriseInfo._id;);

        return res.status(200).json(
            {
                success: true,
                message: "Data fetched successfully",
                commonEnterpriseData: commonEnterpriseDataWithDoc,
                commonStateData: commonStateDataWithDoc,
                commonLocationData: commonLocationDataDoc,
                AllEntStateLocationGateway
            }
        );
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

// EnterpriseStateLocationGatewayOptimizerList
exports.EnterpriseStateLocationGatewayOptimizerList = async (req, res) => {
    const { gateway_id } = req.params;

    try {
        // Step 1: Find the gateway based on the provided gateway ID
        const Gateway = await GatewayModel.findOne({ GatewayID: gateway_id });

        // Check if the gateway exists
        if (!Gateway) {
            return res.status(401).json({ success: false, message: "Gateway ID not found" });
        }

        // Step 2: Find all optimizers associated with the gateway
        const AllEnterpriseStateLocationGatewayOptimizer = await OptimizerModel.find({ GatewayId: Gateway._id }).populate({
            path: 'GatewayId',
            populate: {
                path: 'EnterpriseInfo',
                populate: [
                    {
                        path: 'Enterprise_ID',
                    },
                    {
                        path: 'State_ID',
                    },
                ]
            }
        });

        // If no optimizers found, return 404
        if (AllEnterpriseStateLocationGatewayOptimizer.length === 0) {
            return res.status(404).send({ success: false, message: 'No data found for the given ID.' });
        }

        // Step 3: Fetch device data (optimizer logs) within the last 60 seconds
        const marginInSeconds = 60;
        const currentTimeStamp = Math.floor(new Date().getTime() / 1000);
        const startTimeStamp = currentTimeStamp - marginInSeconds;

        const DeviceData = await OptimizerLogModel.find({
            GatewayID: Gateway._id,
            TimeStamp: { $gte: startTimeStamp.toString(), $lte: currentTimeStamp.toString() }
        });

        // Step 4: Iterate over DeviceData and update the isOnline flag
        DeviceData.forEach(device => {
            AllEnterpriseStateLocationGatewayOptimizer.forEach(optimizer => {
                if (device.OptimizerID.toString() === optimizer._id.toString()) {
                    optimizer.isOnline = true;
                }
            });
        });

        // Step 5: Extract common data fields
        // Extract the common Enterprise_ID data from the first object
        const { Enterprise_ID, ...commonEnterpriseData } = AllEnterpriseStateLocationGatewayOptimizer[0].GatewayId.EnterpriseInfo.Enterprise_ID;
        const commonEnterpriseDataWithDoc = { ...commonEnterpriseData._doc };

        // Extract the common State_ID data from the first object
        const { State_ID, ...commonStateData } = AllEnterpriseStateLocationGatewayOptimizer[0].GatewayId.EnterpriseInfo.State_ID;
        const commonStateDataWithDoc = { ...commonStateData._doc };

        // Dynamic extraction of fields for commonLocationDataDoc
        const LocationData = { ...AllEnterpriseStateLocationGatewayOptimizer[0].GatewayId.EnterpriseInfo };
        const commonLocationDataDoc = { ...LocationData._doc };
        if (commonLocationDataDoc.Enterprise_ID && commonLocationDataDoc.State_ID) {
            delete commonLocationDataDoc.Enterprise_ID;
            delete commonLocationDataDoc.State_ID;
        } else {
            return commonLocationDataDoc;
        };

        // Dynamic extraction of fields for commonGatewayDataDoc
        const commonGatewayDataDoc = { ...AllEnterpriseStateLocationGatewayOptimizer[0].GatewayId._doc };
        if (commonGatewayDataDoc) {
            delete commonGatewayDataDoc.EnterpriseInfo;
        } else {
            return commonGatewayDataDoc;
        };

        // Map through the array and add the fields to each object
        const AllEntStateLocationGatewayOptimizer = AllEnterpriseStateLocationGatewayOptimizer.map(ent => ({
            ...ent._doc,
        }));

        // Remove "GatewayId" field from AllEntStateLocationGatewayOptimizer
        AllEntStateLocationGatewayOptimizer.forEach(ent => {
            delete ent.GatewayId;
        });

        // return res.send(AllEntStateLocationGatewayOptimizer);

        // Step 6: Prepare response
        const response = {
            success: true,
            message: "Data fetched successfully",
            commonEnterpriseData: commonEnterpriseDataWithDoc,
            commonStateData: commonStateDataWithDoc,
            commonLocationData: commonLocationDataDoc,
            commonGatewayData: commonGatewayDataDoc,
            AllEntStateLocationGatewayOptimizer
        };

        // Step 7: Return the response
        return res.status(200).json(response);

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
}

// OptimizerDetails
exports.OptimizerDetails = async (req, res) => {
    const { optimizer_id } = req.params;
    try {
        const Optimizer = await OptimizerModel.findOne({ OptimizerID: optimizer_id });

        if (Optimizer) {
            const Gateway = await GatewayModel.findOne({ _id: Optimizer.GatewayId });
            const GatewayLogData = await GatewayLogModel.findOne({ GatewayID: Gateway._id }).sort({ createdAt: -1 });

            const OptimizerLogData = await OptimizerLogModel
                .findOne({ OptimizerID: Optimizer._id, GatewayID: Gateway._id })
                .sort({ createdAt: -1 })  // Sort in descending order based on createdAt
                .limit(1);

            const DATA = {
                Optimizer: {
                    _id: Optimizer._id,
                    OptimizerID: Optimizer.OptimizerID,
                    OptimizerName: Optimizer.OptimizerName,
                    isBypass: Optimizer.isBypass,
                    isReset: Optimizer.isReset,
                    isSetting: Optimizer.isSetting,
                    createdAt: Optimizer.createdAt,
                    updatedAt: Optimizer.updatedAt,
                },
                Gateway: {
                    _id: Gateway._id,
                    GatewayID: Gateway.GatewayID,
                    OnboardingDate: Gateway.OnboardingDate,
                    Switch: Gateway.Switch,
                    isDelete: Gateway.isDelete,
                    isConfigure: Gateway.isConfigure,
                    createdAt: Gateway.createdAt,
                    updatedAt: Gateway.updatedAt,
                },
                optimizer_mode: OptimizerLogData.OptimizerMode,
                outside_temp: "29", // static_data
                outside_humidity: "20", // static_data
                room_temp: OptimizerLogData.RoomTemperature,
                coil_temp: OptimizerLogData.CoilTemperature,
                humidity: OptimizerLogData.Humidity,
                unit: {
                    temperature: "C",
                    voltage: "V",
                    current: "A",
                    active_power: "kW",
                    apartment_power: "kVA",
                },
                PH1: {
                    voltage: GatewayLogData.Phases.Ph1.Voltage,
                    current: GatewayLogData.Phases.Ph1.Current,
                    active_power: GatewayLogData.Phases.Ph1.ActivePower,
                    power_factor: GatewayLogData.Phases.Ph1.PowerFactor,
                    apartment_power: GatewayLogData.Phases.Ph1.ApparentPower,
                },
                PH2: {
                    voltage: GatewayLogData.Phases.Ph2.Voltage,
                    current: GatewayLogData.Phases.Ph2.Current,
                    active_power: GatewayLogData.Phases.Ph2.ActivePower,
                    power_factor: GatewayLogData.Phases.Ph2.PowerFactor,
                    apartment_power: GatewayLogData.Phases.Ph2.ApparentPower,
                },
                PH3: {
                    voltage: GatewayLogData.Phases.Ph3.Voltage,
                    current: GatewayLogData.Phases.Ph3.Current,
                    active_power: GatewayLogData.Phases.Ph3.ActivePower,
                    power_factor: GatewayLogData.Phases.Ph3.PowerFactor,
                    apartment_power: GatewayLogData.Phases.Ph3.ApparentPower,
                },
            };
            return res.status(200).json({ success: true, message: "Data fetched successfully", data: DATA });
        } else {
            return res.status(404).json({ success: false, message: "Optimizer not found", data: null });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

// GatewayDetails
exports.GatewayDetails = async (req, res) => {
    const { gateway_id } = req.params;
    try {
        const Gateway = await GatewayModel.findOne({ GatewayID: gateway_id });
        if (Gateway) {
            const GatewayLogData = await GatewayLogModel.findOne({ GatewayID: Gateway._id }).populate({
                'path': 'GatewayID',
                'select': '_id OnboardingDate GatewayID EnterpriseUserID Switch isDelete isConfigure is_Ready_toConfig createdAt updatedAt'
            }).sort({ createdAt: -1 });

            const DATA = {
                ...GatewayLogData.toObject(),
                Gateway: GatewayLogData.GatewayID,  // Rename GatewayID to Gateway
            };

            delete DATA.GatewayID;  // Remove the original GatewayID field

            return res.status(200).json({ success: true, message: "Data fetched successfully", data: DATA });
        } else {
            return res.status(404).json({ success: false, message: "Gateway not found", data: null });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

// SET PASSWORD VIEW
exports.SetNewPasswordView = async (req, res) => {
    try {
        const url = process.env.HOST;
        const decodedHashValue = decode("Bearer " + req.params.hashValue);
        let valid = true;
        let message = "";
        // Check if the token has expired
        const currentTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
        if (decodedHashValue.exp && currentTimestamp > decodedHashValue.exp) {
            valid = false
            message = 'Token has expired';
        } else {
            valid = true;
            message = 'Token is still valid';
        }
        const DATA = {
            message,
            valid,
            token: req.params.hashValue,
            backend_url: url + "/api/enterprise/set/new/password/" + req.params.hashValue,
            perpose: "Set New Password"
        }
        // return res.status(200).json(DATA);
        // return res.send(decodedHashValue);
        return res.render("auth/set_password", {
            title: "Set New Password",
            DATA
        });
    } catch (error) {
        console.log(error.message);
        return res.send({ success: false, message: error.message });
    }
};

// SET PASSWORD
exports.SetNewPassword = async (req, res) => {
    const { _token, password } = req.body;
    try {
        const decodedHashValueEmail = decode("Bearer " + _token).email;
        // const user = await User.findOne({ email: decodedHashValueEmail });
        const hashedPassword = await bcrypt.hash(password, 10);
        const filter = { email: decodedHashValueEmail };
        const update = { password: hashedPassword };

        // Use updateOne to update a single document
        const result = await UserModel.updateOne(filter, update);

        console.log(result);
        // return res.status(200).json({
        //     success: true,
        //     message: "Password reset successfully!",
        // });

        return res.render("auth/success", {});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

